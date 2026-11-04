-- Fix: infinite recursion in profiles RLS policies
-- Root cause: WITH CHECK and admin USING clauses query back into profiles table,
-- triggering RLS evaluation on the same table → infinite loop.
--
-- Fix strategy:
-- 1. User UPDATE policy: use a SECURITY DEFINER helper function to read role
--    without triggering RLS (bypasses the recursive check).
-- 2. Admin UPDATE policy: same — use helper function instead of subquery.

-- Drop the broken policies from previous migration
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Helper function: get role of a given user id WITHOUT triggering RLS
-- SECURITY DEFINER runs as the function owner (postgres), bypassing RLS entirely.
CREATE OR REPLACE FUNCTION public.get_profile_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- User UPDATE policy: user can update their own row, but cannot change their role
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = public.get_profile_role(auth.uid())
);

-- Admin UPDATE policy: admins can update any profile (for role promotion via admin UI)
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
USING (
  public.get_profile_role(auth.uid()) = 'admin'
);
