import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Standalone function to sync expired payments
export const syncExpiredPayments = async () => {
    try {
        // console.log('Syncing expired payments...');
        const { error } = await supabase.rpc('sync_expired_bookings');
        if (error) {
            console.error('Error syncing expired payments:', error);
        }
    } catch (err) {
        console.error('Failed to sync expired payments:', err);
    }
};

// Hook for countdown
export const usePaymentCountdown = (expiresAt: string | null) => {
    const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number; totalSeconds: number } | null>(null);
    const [isExpired, setIsExpired] = useState(false);
    const hasTriggeredExpiryRef = useRef(false);

    useEffect(() => {
        if (!expiresAt) {
            setTimeLeft(null);
            setIsExpired(false);
            return;
        }

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const expiryTime = new Date(expiresAt).getTime();
            const difference = expiryTime - now;

            if (difference <= 0) {
                setIsExpired(true);
                setTimeLeft({ minutes: 0, seconds: 0, totalSeconds: 0 });

                if (!hasTriggeredExpiryRef.current) {
                    hasTriggeredExpiryRef.current = true;
                    syncExpiredPayments();
                }
                return;
            }

            hasTriggeredExpiryRef.current = false;
            setIsExpired(false);

            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft({ minutes, seconds, totalSeconds: Math.floor(difference / 1000) });
        };

        calculateTimeLeft();
        const timerId = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timerId);
    }, [expiresAt]); // Removed syncExpiredPayments from dep array as it is now stable/global

    const timeLeftString = timeLeft
        ? `${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`
        : "--:--";

    return { timeLeft, isExpired, timeLeftString };
};

export const usePaymentLogic = () => {
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    // Check for active pending payments for a user
    const checkActivePendingPayment = async (userId: string) => {
        if (!userId) return null;

        await syncExpiredPayments();

        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', userId)
            .eq('payment_status', 'PENDING')
            .eq('booking_status', 'ACTIVE')
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error checking pending payments:', error);
            return null;
        }

        return data;
    };

    // Resume payment (redirect to Midtrans)
    const resumePayment = async (booking: any) => {
        if (!booking || !booking.redirect_url) {
            toast({
                title: "Error",
                description: "Link pembayaran tidak ditemukan.",
                variant: "destructive"
            });
            return;
        }

        setIsProcessing(true);
        window.location.href = booking.redirect_url;
        setIsProcessing(false);
    };

    // Cancel booking
    const cancelBooking = async (bookingId: string) => {
        setIsProcessing(true);
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData?.session?.access_token;

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-booking`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ booking_id: bookingId }),
                }
            );

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.details || err.error || 'Gagal membatalkan booking');
            }

            toast({
                title: "Booking Dibatalkan",
                description: "Booking berhasil dibatalkan."
            });

            return true;
        } catch (error: any) {
            toast({
                title: 'Gagal Membatalkan',
                description: error.message,
                variant: 'destructive'
            });
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        isProcessing,
        syncExpiredPayments,
        checkActivePendingPayment,
        resumePayment,
        cancelBooking,
        usePaymentCountdown // Exporting it here too for convenience, though named export matches
    };
};
