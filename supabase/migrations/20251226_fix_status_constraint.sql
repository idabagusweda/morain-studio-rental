-- ============================================================
-- MORAIN STUDIO - FIX BOOKING STATUS CONSTRAINT
-- Run this in Supabase SQL Editor
-- ============================================================

-- STEP 1: Drop existing constraints first
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

-- STEP 2: Update existing rows with invalid booking_status values
-- Set NULL or empty booking_status to 'ACTIVE'
UPDATE public.bookings 
SET booking_status = 'ACTIVE' 
WHERE booking_status IS NULL OR booking_status = '' OR booking_status NOT IN ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- STEP 3: Update existing rows with invalid payment_status values
-- Normalize payment_status values (lowercase 'pending' to uppercase, etc)
UPDATE public.bookings SET payment_status = 'PENDING' WHERE LOWER(payment_status) = 'pending';
UPDATE public.bookings SET payment_status = 'LUNAS' WHERE LOWER(payment_status) = 'lunas';
UPDATE public.bookings SET payment_status = 'DP' WHERE LOWER(payment_status) = 'dp';
-- Set any other invalid values to 'PENDING'
UPDATE public.bookings 
SET payment_status = 'PENDING' 
WHERE payment_status NOT IN ('PENDING', 'DP', 'LUNAS', 'FAILED', 'EXPIRED');

-- STEP 4: Now add the constraints (after data is fixed)
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check 
CHECK (booking_status IN ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'));

ALTER TABLE public.bookings ADD CONSTRAINT bookings_payment_status_check 
CHECK (payment_status IN ('PENDING', 'DP', 'LUNAS', 'FAILED', 'EXPIRED'));

-- Done! Now booking with 'PENDING' status will work.
