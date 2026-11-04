-- ============================================================
-- MORAIN STUDIO - PAYMENT ENHANCEMENTS MIGRATION
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Date: 2025-12-27
-- ============================================================

-- 1. ADD NEW COLUMNS TO BOOKINGS TABLE
-- ============================================================

-- Add expires_at column for TTL (30 minutes for PENDING bookings)
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Add midtrans_snap_token column (optional, for storing snap token)
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS midtrans_snap_token TEXT;

-- Add payment_type_last column (tracks the last payment type: FULL, DP, REMAINING)
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_type_last TEXT;

-- ============================================================
-- 2. UPDATE PAYMENT STATUS CONSTRAINT
-- ============================================================

-- Drop existing constraint if exists (safe drop)
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

-- Normalize any invalid payment_status values before adding constraint
UPDATE public.bookings 
SET payment_status = 'PENDING' 
WHERE payment_status IS NULL OR payment_status = '';

UPDATE public.bookings 
SET payment_status = 'CANCELLED' 
WHERE payment_status IN ('BATAL', 'batal', 'cancelled');

UPDATE public.bookings 
SET payment_status = 'LUNAS' 
WHERE payment_status IN ('PAID', 'paid', 'SELESAI', 'selesai', 'lunas');

UPDATE public.bookings 
SET payment_status = 'EXPIRED' 
WHERE payment_status IN ('expired', 'EXPIRED');

UPDATE public.bookings 
SET payment_status = 'DP' 
WHERE payment_status IN ('dp', 'Dp');

UPDATE public.bookings 
SET payment_status = UPPER(payment_status)
WHERE payment_status NOT IN ('PENDING', 'DP', 'LUNAS', 'EXPIRED', 'CANCELLED', 'FAILED');

-- Add new constraint with all valid statuses
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_payment_status_check 
CHECK (payment_status IN ('PENDING', 'DP', 'LUNAS', 'EXPIRED', 'CANCELLED', 'FAILED'));

-- ============================================================
-- 3. UPDATE BOOKING STATUS CONSTRAINT
-- ============================================================

-- Drop existing booking_status constraint if exists
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_booking_status_check;

-- Normalize booking_status values
UPDATE public.bookings 
SET booking_status = 'PENDING' 
WHERE booking_status IS NULL OR booking_status = '';

UPDATE public.bookings 
SET booking_status = 'CANCELLED' 
WHERE booking_status IN ('cancelled', 'BATAL', 'batal');

UPDATE public.bookings 
SET booking_status = 'ACTIVE' 
WHERE booking_status IN ('active', 'Active');

UPDATE public.bookings 
SET booking_status = 'COMPLETED' 
WHERE booking_status IN ('completed', 'selesai', 'SELESAI');

-- Add constraint for booking_status
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_booking_status_check 
CHECK (booking_status IN ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'));

-- ============================================================
-- 4. SET DEFAULT VALUES FOR EXISTING BOOKINGS
-- ============================================================

-- Set remaining_amount for existing bookings if not set
UPDATE public.bookings 
SET remaining_amount = COALESCE(total_amount, 0) - COALESCE(paid_amount, 0)
WHERE remaining_amount IS NULL OR remaining_amount = 0;

-- Set expires_at for existing PENDING bookings (give them 30 minutes from now)
UPDATE public.bookings 
SET expires_at = now() + interval '30 minutes'
WHERE payment_status = 'PENDING' AND expires_at IS NULL;

-- ============================================================
-- 5. CREATE INDEX FOR EXPIRATION QUERIES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_bookings_expires_at 
ON public.bookings(expires_at) 
WHERE payment_status = 'PENDING';

-- ============================================================
-- 6. CREATE FUNCTION TO SET EXPIRES_AT ON INSERT
-- ============================================================

-- Function to automatically set expires_at for new PENDING bookings
CREATE OR REPLACE FUNCTION set_booking_expires_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set expires_at for PENDING bookings if not already set
    IF NEW.payment_status = 'PENDING' AND NEW.expires_at IS NULL THEN
        NEW.expires_at := now() + interval '30 minutes';
    END IF;
    
    -- Calculate remaining_amount
    IF NEW.remaining_amount IS NULL OR NEW.remaining_amount = 0 THEN
        NEW.remaining_amount := COALESCE(NEW.total_amount, 0) - COALESCE(NEW.paid_amount, 0);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_set_booking_expires_at ON public.bookings;

-- Create trigger for new bookings
CREATE TRIGGER trigger_set_booking_expires_at
    BEFORE INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION set_booking_expires_at();

-- ============================================================
-- 7. COMMENTS FOR DOCUMENTATION
-- ============================================================

COMMENT ON COLUMN public.bookings.expires_at IS 'TTL for PENDING bookings, auto-set to 30 minutes from creation';
COMMENT ON COLUMN public.bookings.midtrans_snap_token IS 'Midtrans Snap token for resuming payment';
COMMENT ON COLUMN public.bookings.payment_type_last IS 'Last payment type attempted: FULL, DP, or REMAINING';
COMMENT ON COLUMN public.bookings.paid_amount IS 'Total amount already paid';
COMMENT ON COLUMN public.bookings.remaining_amount IS 'Outstanding balance to be paid';

-- ============================================================
-- DONE! Run this migration in Supabase SQL Editor
-- ============================================================
