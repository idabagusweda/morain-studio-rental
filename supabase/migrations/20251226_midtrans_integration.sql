-- ============================================================
-- MORAIN STUDIO - MIDTRANS PAYMENT INTEGRATION
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- 1. ADD NEW COLUMNS TO BOOKINGS TABLE
-- ============================================================

-- Add paid_amount column (tracks how much has been paid)
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS paid_amount INTEGER DEFAULT 0;

-- Add remaining_amount column (tracks outstanding balance)
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS remaining_amount INTEGER DEFAULT 0;

-- Add payment_option column (DP or FULL)
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_option TEXT;

-- Add midtrans_order_id column (unique reference for Midtrans)
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS midtrans_order_id TEXT UNIQUE;

-- Add booking_status if not exists (for PENDING state before payment)
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS booking_status TEXT DEFAULT 'PENDING';

-- Update existing bookings to have correct remaining_amount
UPDATE public.bookings 
SET remaining_amount = COALESCE(total_amount, 0) - COALESCE(paid_amount, 0)
WHERE remaining_amount IS NULL OR remaining_amount = 0;

-- Update payment_status default to PENDING for new bookings
ALTER TABLE public.bookings 
ALTER COLUMN payment_status SET DEFAULT 'PENDING';

-- ============================================================
-- 2. CREATE PAYMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  provider TEXT DEFAULT 'midtrans',
  order_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  method TEXT, -- qris, va_bca, gopay, credit_card, etc.
  status TEXT NOT NULL DEFAULT 'pending', -- pending, settlement, expire, cancel, deny
  transaction_time TIMESTAMPTZ,
  raw_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================

-- Index for payment status queries on bookings
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status 
ON public.bookings(payment_status);

-- Index for midtrans order lookups
CREATE INDEX IF NOT EXISTS idx_bookings_midtrans_order 
ON public.bookings(midtrans_order_id);

-- Index for payment order_id lookups (webhook)
CREATE INDEX IF NOT EXISTS idx_payments_order_id 
ON public.payments(order_id);

-- Index for payment booking lookups
CREATE INDEX IF NOT EXISTS idx_payments_booking_id 
ON public.payments(booking_id);

-- ============================================================
-- 4. RLS POLICIES FOR PAYMENTS TABLE
-- ============================================================

-- Users can view their own payment records
CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = payments.booking_id 
    AND bookings.user_id = auth.uid()
  )
);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
ON public.payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Service role can insert/update (for Edge Functions with service key)
-- This is handled automatically by using service_role key in Edge Functions

-- ============================================================
-- 5. FUNCTION AND TRIGGER FOR UPDATED_AT ON PAYMENTS
-- ============================================================

-- Create the function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_payments_updated_at'
  ) THEN
    CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check new columns on bookings
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'bookings' AND table_schema = 'public';

-- Check payments table
-- SELECT * FROM information_schema.tables WHERE table_name = 'payments';

-- Check indexes
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('bookings', 'payments');
