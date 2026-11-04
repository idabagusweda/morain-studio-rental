import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Clock, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/i18nUtils';

interface Booking {
    id: string;
    client_name: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    service_type: string;
    payment_status: string;
    booking_status: string;
}

const Calendar = () => {
    const { t, i18n } = useTranslation(['admin', 'common', 'dashboard']);
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .neq('booking_status', 'CANCELLED');

            if (error) throw error;
            setBookings(data || []);
        } catch (error: unknown) {
            console.error('Error fetching bookings:', error);
            toast({
                title: t('common:messages.error', 'Error'),
                description: t('admin:calendar.errorFetch', 'Gagal memuat data kalender'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const getDayBookings = (date: Date) => {
        return bookings.filter(b => {
            const bDate = new Date(b.booking_date);
            return bDate.getDate() === date.getDate() &&
                bDate.getMonth() === date.getMonth() &&
                bDate.getFullYear() === date.getFullYear();
        }).sort((a, b) => a.start_time.localeCompare(b.start_time));
    };

    const selectedDateBookings = selectedDate ? getDayBookings(selectedDate) : [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-display font-bold mb-1 text-[#849283]">{t('admin:calendar.title', 'Kalender')}</h2>
                <p className="text-muted-foreground">{t('admin:calendar.description', 'Lihat jadwal booking harian.')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Calendar View - Styled as Card */}
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border-0 w-full"
                        classNames={{
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
                            day_today: "bg-slate-100 text-foreground font-bold",
                        }}
                    />
                    <div className="mt-6 flex items-center gap-4 text-sm px-4 pt-4 border-t border-dashed">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#849283]" />
                            <span>{t('admin:calendar.selected', 'Selected')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-100" />
                            <span>{t('admin:calendar.today', 'Today')}</span>
                        </div>
                    </div>
                </div>

                {/* Slot Details - Styled as Card */}
                <div className="bg-white rounded-xl border shadow-sm flex flex-col h-[500px] overflow-hidden">
                    <div className="p-4 border-b bg-slate-50">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#849283]" />
                            {selectedDate ? formatDate(selectedDate, 'EEEE, d MMMM yyyy', i18n.language) : ''}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('admin:calendar.scheduledSessions', { count: selectedDateBookings.length, defaultValue: `${selectedDateBookings.length} Sesi Terjadwal` })}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {selectedDateBookings.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-6">
                                <CalendarComponent className="w-12 h-12 mb-3 opacity-20" />
                                <p>{t('admin:calendar.noEvents', 'Tidak ada booking untuk tanggal ini')}</p>
                                <p className="text-xs mt-1 text-slate-400">{t('admin:calendar.pickOtherDate', 'Pilih tanggal lain untuk melihat jadwal.')}</p>
                            </div>
                        ) : (
                            selectedDateBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className={`p-4 rounded-xl border transition-all hover:shadow-sm ${booking.service_type === 'studio'
                                        ? 'bg-indigo-50/30 border-indigo-100 hover:border-indigo-200'
                                        : 'bg-pink-50/30 border-pink-100 hover:border-pink-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="font-mono text-sm font-semibold bg-white px-2 py-1 rounded border shadow-sm text-foreground/80">
                                            {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                                        </span>
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-medium border uppercase ${booking.payment_status === 'LUNAS'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : booking.payment_status === 'DP'
                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                : 'bg-gray-50 text-gray-700 border-gray-200'
                                            }`}>
                                            {booking.payment_status}
                                        </span>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${booking.service_type === 'studio' ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-600'
                                            }`}>
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-foreground">{booking.client_name}</p>
                                            <p className="text-xs text-muted-foreground capitalize flex items-center gap-1.5 mt-0.5">
                                                {booking.service_type === 'studio' ? `📸 ${t('dashboard:overview.studioSession', 'Studio Session')}` : `🎞️ ${t('dashboard:overview.photoboxSession', 'Photobox Session')}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
