-- Fix RLS: Prevent users from escalating their own role via UPDATE
-- Previously, "Users can update their own profile" had no WITH CHECK clause,
-- allowing any user to set role = 'admin' on their own profile row.

-- Drop the old permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate with WITH CHECK that locks the role column to its current value
-- A regular user cannot change their own role; only service_role (Edge Functions / admin SQL) can.
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- Admin UPDATE policy: admins can update any profile (needed for role promotion via admin UI)
-- Drop first in case it exists from a previous migration
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid()
    AND admin_profile.role = 'admin'
  )
);
