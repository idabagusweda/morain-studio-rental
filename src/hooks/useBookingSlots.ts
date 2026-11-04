import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BookedSlot {
    start_time: string;
    end_time: string;
    booking_status: string;
}

interface UseBookingSlotsResult {
    bookedSlots: string[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useBookingSlots = (
    serviceType: 'studio' | 'photobox',
    selectedDate: Date | undefined,
    packageName?: string
): UseBookingSlotsResult => {
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBookedSlots = async () => {
        if (!selectedDate) {
            setBookedSlots([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Format date as YYYY-MM-DD without timezone conversion
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;

            let query = supabase
                .from('bookings')
                .select('start_time, end_time, booking_status')
                .eq('service_type', serviceType)
                .eq('booking_date', dateString)
                .eq('booking_status', 'ACTIVE');

            // If packageName is provided (for Studio), filter by it to enable separate room availability
            if (serviceType === 'studio' && packageName) {
                query = query.eq('package_name', packageName);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) {
                console.error('Error fetching booked slots:', fetchError);
                setError(fetchError.message);
                setBookedSlots([]);
                return;
            }

            // Extract all occupied slots
            const allOccupiedSlots: string[] = [];

            (data as BookedSlot[] || []).forEach(booking => {
                const start = booking.start_time.slice(0, 5); // "HH:MM"
                const end = booking.end_time.slice(0, 5);     // "HH:MM"

                // Create date objects for comparison (using arbitrary date)
                const startDate = new Date(`2000-01-01T${start}:00`);
                const endDate = new Date(`2000-01-01T${end}:00`);

                let current = new Date(startDate);

                // Add all slots from start to end (exclusive of end time)
                while (current < endDate) {
                    const hours = String(current.getHours()).padStart(2, '0');
                    const minutes = String(current.getMinutes()).padStart(2, '0');
                    allOccupiedSlots.push(`${hours}:${minutes}`);

                    // Increment based on service type
                    // Studio uses hourly slots, Photobox uses 15-min slots
                    // But we should block in smaller increments to be safe, or match the service interval
                    if (serviceType === 'studio') {
                        current.setHours(current.getHours() + 1);
                    } else {
                        current.setMinutes(current.getMinutes() + 15);
                    }
                }
            });

            setBookedSlots(allOccupiedSlots);
        } catch (err) {
            console.error('Error in fetchBookedSlots:', err);
            setError('Failed to fetch booked slots');
            setBookedSlots([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookedSlots();
    }, [serviceType, selectedDate, packageName]);

    return {
        bookedSlots,
        loading,
        error,
        refetch: fetchBookedSlots,
    };
};
