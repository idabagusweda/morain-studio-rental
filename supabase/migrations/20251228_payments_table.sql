-- ============================================================
-- MORAIN STUDIO - PAYMENTS TABLE MIGRATION
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Date: 2025-12-28
-- Purpose: Create payments table for Midtrans session management
--          Implements 15-minute on-demand expiry system
-- ============================================================

-- 0. DROP EXISTING TABLE IF EXISTS (clean slate)
-- ============================================================
DROP VIEW IF EXISTS public.active_payments;
DROP TABLE IF EXISTS public.payments CASCADE;

-- 1. CREATE PAYMENTS TABLE
-- ============================================================

CREATE TABLE public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    
    -- Payment status: PENDING (waiting), EXPIRED (timed out), SETTLED (paid), CANCELLED (user cancelled)
    payment_status TEXT NOT NULL DEFAULT 'PENDING' 
        CHECK (payment_status IN ('PENDING', 'EXPIRED', 'SETTLED', 'CANCELLED')),
    
    -- Midtrans session data
    midtrans_order_id TEXT UNIQUE,
    snap_token TEXT,
    redirect_url TEXT,
    
    -- Payment details
    amount INTEGER NOT NULL,
    payment_type TEXT CHECK (payment_type IN ('FULL', 'DP', 'REMAINING')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '15 minutes') NOT NULL,
    settled_at TIMESTAMPTZ,
    
    -- Raw webhook data for debugging
    raw_webhook_data JSONB
);

-- 2. CREATE INDEXES
-- ============================================================

-- Index for looking up payments by booking
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);

-- Index for finding payments by expires_at (for expiry checks)
CREATE INDEX IF NOT EXISTS idx_payments_expires_at ON public.payments(expires_at);

-- Index for finding payment by status
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);

-- Index for finding payment by midtrans order id (used by webhook)
CREATE INDEX IF NOT EXISTS idx_payments_midtrans_order_id ON public.payments(midtrans_order_id);

-- 3. CREATE FUNCTION TO SET expires_at ON INSERT
-- ============================================================

CREATE OR REPLACE FUNCTION set_payment_expires_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Set expires_at to 15 minutes from now if not already set
    IF NEW.expires_at IS NULL THEN
        NEW.expires_at := now() + interval '15 minutes';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_set_payment_expires_at ON public.payments;
CREATE TRIGGER trigger_set_payment_expires_at
    BEFORE INSERT ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION set_payment_expires_at();

-- 4. CREATE VIEW FOR ACTIVE PAYMENTS (convenience)
-- ============================================================

CREATE OR REPLACE VIEW public.active_payments AS
SELECT 
    p.*,
    b.booking_code,
    b.service_type,
    b.client_name,
    b.total_amount as booking_total,
    CASE 
        WHEN p.payment_status = 'PENDING' AND now() > p.expires_at THEN 'EXPIRED'
        ELSE p.payment_status
    END as computed_status,
    GREATEST(0, EXTRACT(EPOCH FROM (p.expires_at - now()))) as seconds_remaining
FROM public.payments p
JOIN public.bookings b ON p.booking_id = b.id;

-- 5. UPDATE BOOKINGS TABLE - CLEANUP OLD COLUMNS
-- ============================================================

-- Drop old columns that are now in payments table (if they exist)
-- We keep midtrans_order_id temporarily for backward compatibility during migration

-- Remove the old trigger that auto-sets expires_at on bookings
DROP TRIGGER IF EXISTS trigger_set_booking_expires_at ON public.bookings;
DROP FUNCTION IF EXISTS set_booking_expires_at();

-- 6. ENABLE RLS ON PAYMENTS TABLE
-- ============================================================

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payments (via booking ownership)
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT
    USING (
        booking_id IN (
            SELECT id FROM public.bookings WHERE user_id = auth.uid()
        )
    );

-- Policy: Service role can do everything (for Edge Functions)
CREATE POLICY "Service role full access" ON public.payments
    FOR ALL
    USING (auth.role() = 'service_role');

-- 7. COMMENTS FOR DOCUMENTATION
-- ============================================================

COMMENT ON TABLE public.payments IS 'Stores Midtrans payment sessions. 1 booking = 1 active PENDING payment at a time.';
COMMENT ON COLUMN public.payments.expires_at IS 'Set to created_at + 15 minutes. NEVER reset once set.';
COMMENT ON COLUMN public.payments.payment_status IS 'PENDING = waiting, EXPIRED = timed out, SETTLED = paid, CANCELLED = user cancelled';
COMMENT ON COLUMN public.payments.midtrans_order_id IS 'Unique order ID sent to Midtrans. Format: BOOKING_CODE-TYPE-TIMESTAMP';

-- ============================================================
-- DONE! Run this migration in Supabase SQL Editor
-- ============================================================
