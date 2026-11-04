import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
    Users,
    Calendar,
    Wallet,
    TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/lib/i18nUtils';

interface DashboardStats {
    totalBookings: number;
    bookingsThisMonth: number;
    bookingsToday: number;
    revenueThisMonth: number;
    pendingCount: number;
    dpCount: number;
    lunasCount: number;
}

const Overview = () => {
    const { t, i18n } = useTranslation(['admin', 'common']);
    const { toast } = useToast();
    const [stats, setStats] = useState<DashboardStats>({
        totalBookings: 0,
        bookingsThisMonth: 0,
        bookingsToday: 0,
        revenueThisMonth: 0,
        pendingCount: 0,
        dpCount: 0,
        lunasCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
            const todayEnd = new Date(now.setHours(23, 59, 59, 999)).toISOString();

            const { data: bookings, error } = await supabase
                .from('bookings')
                .select('*');

            if (error) throw error;

            if (bookings) {
                const thisMonthBookings = bookings.filter(b => b.booking_date >= firstDayOfMonth);
                const todayBookings = bookings.filter(b => b.booking_date >= todayStart && b.booking_date <= todayEnd);

                setStats({
                    totalBookings: bookings.length,
                    bookingsThisMonth: thisMonthBookings.length,
                    bookingsToday: todayBookings.length,
                    revenueThisMonth: thisMonthBookings.reduce((sum, b) => sum + (b.paid_amount || 0), 0),
                    pendingCount: bookings.filter(b => b.payment_status === 'PENDING').length,
                    dpCount: bookings.filter(b => b.payment_status === 'DP').length,
                    lunasCount: bookings.filter(b => b.payment_status === 'LUNAS').length,
                });
            }
        } catch (error: unknown) {
            console.error('Error fetching stats:', error);
            toast({
                title: t('common:messages.error', 'Error'),
                description: t('admin:overview.errorFetch', 'Failed to load dashboard statistics'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-white rounded-xl border border-dashed" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-display font-bold mb-1 text-[#849283]">{t('admin:overview.title', 'Overview')}</h2>
                <p className="text-muted-foreground">{t('admin:overview.description', 'Ringkasan performa studio bulan ini.')}</p>
            </div>

            {/* Primary KPI Cards */}
            <div className="space-y-6">
                {/* Revenue Card - Full Width Primary */}
                <Card className="rounded-xl border shadow-soft overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            {t('admin:overview.revenue', 'Revenue (Bulan Ini)')}
                        </CardDescription>
                        <CardTitle className="text-[clamp(2rem,5vw,3.5rem)] font-body font-bold whitespace-nowrap leading-none" title={formatCurrency(stats.revenueThisMonth, i18n.language)}>
                            {formatCurrency(stats.revenueThisMonth, i18n.language)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {t('admin:overview.revenueFrom', { count: stats.bookingsThisMonth, defaultValue: `Dari ${stats.bookingsThisMonth} booking` })}
                        </p>
                    </CardContent>
                </Card>

                {/* Secondary Cards - 3 Column Grid */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="rounded-xl border shadow-soft">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {t('admin:overview.bookingsToday', 'Booking Hari Ini')}
                            </CardDescription>
                            <CardTitle className="text-2xl sm:text-3xl font-body font-bold text-blue-600">{stats.bookingsToday}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                {t('admin:overview.bookingsTodayDescription', 'Jadwal hari ini')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border shadow-soft">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {t('admin:overview.totalBookings', 'Total Booking')}
                            </CardDescription>
                            <CardTitle className="text-2xl sm:text-3xl font-body font-bold">{stats.totalBookings}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                {t('admin:overview.totalBookingsDescription', { count: stats.bookingsThisMonth, defaultValue: `+ ${stats.bookingsThisMonth} bulan ini` })}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border shadow-soft">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                {t('admin:overview.paymentStatus', 'Status Bayar')}
                            </CardDescription>
                            <div className="pt-2 flex justify-between gap-1 text-xs">
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-lg text-yellow-600">{stats.pendingCount}</span>
                                    <span className="text-muted-foreground">{t('admin:overview.pending', 'Pending')}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-lg text-blue-600">{stats.dpCount}</span>
                                    <span className="text-muted-foreground">{t('admin:overview.dp', 'DP')}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-lg text-green-600">{stats.lunasCount}</span>
                                    <span className="text-muted-foreground">{t('admin:overview.paid', 'Lunas')}</span>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Overview;
