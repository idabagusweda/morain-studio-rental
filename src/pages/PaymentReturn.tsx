import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Check, Clock, XCircle, Home, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/lib/i18nUtils';

type PaymentStatus = 'success' | 'pending' | 'error' | 'loading';

interface BookingDetails {
    booking_code: string;
    service_type: string;
    package_name: string | null;
    style_name: string | null;
    total_amount: number;
    paid_amount: number;
    payment_status: string;
}

const PaymentReturn = () => {
    const { t, i18n } = useTranslation(['booking', 'common']);
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<PaymentStatus>('loading');
    const [booking, setBooking] = useState<BookingDetails | null>(null);

    const orderId = searchParams.get('order_id');
    const urlStatus = searchParams.get('status');

    useEffect(() => {
        const fetchBookingStatus = async () => {
            if (!orderId) {
                setStatus('error');
                return;
            }

            // Wait a moment for webhook to process
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Fetch booking by midtrans_order_id
            // Note: This query may fail if user is not authenticated after redirect from Midtrans.
            // We rely on RLS policy that allows users to view their own bookings.
            // Alternative: pass booking_code in URL params instead of midtrans_order_id
            const { data, error } = await supabase
                .from('bookings')
                .select('booking_code, service_type, package_name, style_name, total_amount, paid_amount, payment_status')
                .eq('midtrans_order_id', orderId)
                .single();

            // If query fails due to auth, show error with helpful message
            if (error) {
                console.error('Error fetching booking:', error);
            }

            if (error || !data) {
                setStatus('error');
                return;
            }

            setBooking(data);

            // Determine status based on payment_status
            if (data.payment_status === 'LUNAS' || data.payment_status === 'DP') {
                setStatus('success');
            } else if (data.payment_status === 'PENDING') {
                setStatus('pending');
            } else {
                setStatus('error');
            }
        };

        fetchBookingStatus();
    }, [orderId]);

    const getStatusConfig = () => {
        switch (status) {
            case 'success':
                return {
                    icon: <Check className="w-16 h-16 text-white" />,
                    bgColor: 'bg-green-500',
                    title: t('booking:paymentReturn.successTitle'),
                    description: t('booking:paymentReturn.successDesc'),
                };
            case 'pending':
                return {
                    icon: <Clock className="w-16 h-16 text-white" />,
                    bgColor: 'bg-yellow-500',
                    title: t('booking:paymentReturn.pendingTitle'),
                    description: t('booking:paymentReturn.pendingDesc'),
                };
            case 'error':
                return {
                    icon: <XCircle className="w-16 h-16 text-white" />,
                    bgColor: 'bg-red-500',
                    title: t('booking:paymentReturn.errorTitle'),
                    description: t('booking:paymentReturn.errorDesc'),
                };
            default:
                return {
                    icon: <Clock className="w-16 h-16 text-white animate-pulse" />,
                    bgColor: 'bg-gray-400',
                    title: t('booking:paymentReturn.processingTitle'),
                    description: t('booking:paymentReturn.processingDesc'),
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
                {/* Status Icon */}
                <div className={`w-24 h-24 ${config.bgColor} rounded-full flex items-center justify-center mx-auto shadow-lg`}>
                    {config.icon}
                </div>

                {/* Status Text */}
                <div className="space-y-2">
                    <h1 className="font-display text-2xl font-bold text-foreground">
                        {config.title}
                    </h1>
                    <p className="text-muted-foreground">
                        {config.description}
                    </p>
                </div>

                {/* Booking Details */}
                {booking && status !== 'loading' && (
                    <div className="bg-secondary/30 rounded-xl p-4 text-left space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('booking:paymentReturn.bookingCode')}</span>
                            <span className="font-mono font-medium">{booking.booking_code}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('booking:paymentReturn.service')}</span>
                            <span className="font-medium capitalize">{booking.service_type === 'photobox' ? t('common:services.photobox', 'Photobox') : t('common:services.studio', 'Studio')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('booking:paymentReturn.packageOrStyle')}</span>
                            <span className="font-medium">{booking.package_name || booking.style_name || '-'}</span>
                        </div>
                        <div className="border-t border-dashed pt-3 mt-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('booking:paymentReturn.total')}</span>
                                <span className="font-bold text-lg">
                                    {formatCurrency(booking.total_amount, i18n.language)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t('booking:paymentReturn.paid')}</span>
                                <span className="font-medium text-green-600">
                                    {formatCurrency(booking.paid_amount, i18n.language)}
                                </span>
                            </div>
                            {booking.total_amount - booking.paid_amount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('booking:paymentReturn.remaining')}</span>
                                    <span className="font-medium text-amber-600">
                                        {formatCurrency(booking.total_amount - booking.paid_amount, i18n.language)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between text-sm pt-2">
                            <span className="text-muted-foreground">{t('booking:paymentReturn.status')}</span>
                            <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${booking.payment_status === 'LUNAS' ? 'bg-green-100 text-green-700' :
                                    booking.payment_status === 'DP' ? 'bg-amber-100 text-amber-700' :
                                        'bg-gray-100 text-gray-700'
                                }`}>
                                {booking.payment_status}
                            </span>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4">
                    <Link to="/dashboard">
                        <Button className="w-full gap-2 bg-[#849283] hover:bg-[#6b7a6a]">
                            <FileText className="w-4 h-4" />
                            {t('booking:paymentReturn.viewHistory')}
                        </Button>
                    </Link>
                    <Link to="/">
                        <Button variant="outline" className="w-full gap-2">
                            <Home className="w-4 h-4" />
                            {t('booking:paymentReturn.backHome')}
                        </Button>
                    </Link>
                </div>

                {/* Order ID Reference */}
                {orderId && (
                    <p className="text-xs text-muted-foreground pt-4">
                        Order ID: <span className="font-mono">{orderId}</span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default PaymentReturn;
