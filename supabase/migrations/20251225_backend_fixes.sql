-- ============================================================
-- MORAIN STUDIO - CRITICAL DATABASE FIXES
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- 1. ADMIN RLS POLICIES
-- Drop existing policies first (for re-run safety)
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Allow admins to view ALL bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Allow admins to update ALL bookings
CREATE POLICY "Admins can update all bookings"
ON public.bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Allow admins to view ALL profiles (for Users page)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS admin_profile 
    WHERE admin_profile.id = auth.uid() AND admin_profile.role = 'admin'
  )
);

-- ============================================================
-- 2. UNIQUE CONSTRAINT FOR SLOT BOOKING (Prevent Double Booking)
-- ============================================================

-- For STUDIO: unique per package (3 separate rooms) - only for ACTIVE bookings
CREATE UNIQUE INDEX IF NOT EXISTS unique_studio_slot_idx 
ON public.bookings (service_type, package_name, booking_date, start_time)
WHERE service_type = 'studio' AND booking_status = 'ACTIVE';

-- For PHOTOBOX: unique slot regardless of style (1 booth shared) - only for ACTIVE bookings
CREATE UNIQUE INDEX IF NOT EXISTS unique_photobox_slot_idx 
ON public.bookings (service_type, booking_date, start_time)
WHERE service_type = 'photobox' AND booking_status = 'ACTIVE';

-- ============================================================
-- 3. PERFORMANCE INDEXES
-- ============================================================

-- Index for slot availability queries
CREATE INDEX IF NOT EXISTS idx_bookings_availability 
ON public.bookings (service_type, booking_date, start_time, booking_status);

-- Index for user booking history
CREATE INDEX IF NOT EXISTS idx_bookings_user_date 
ON public.bookings (user_id, created_at DESC);

-- ============================================================
-- 4. UPDATE TRIGGER TO SYNC WHATSAPP FROM METADATA
-- (Run if profiles missing WhatsApp after Google/OAuth signup)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, whatsapp)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.email,
    NEW.raw_user_meta_data ->> 'whatsapp'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    whatsapp = COALESCE(EXCLUDED.whatsapp, profiles.whatsapp);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- VERIFICATION QUERIES (Run after applying above)
-- ============================================================

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'bookings';
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Check indexes
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'bookings';

-- Check constraints
-- SELECT conname, contype FROM pg_constraint WHERE conrelid = 'bookings'::regclass;
