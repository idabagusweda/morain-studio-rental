
import { CreditCard, QrCode, Landmark, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate } from '@/lib/i18nUtils';

interface InvoiceTemplateProps {
    booking: {
        booking_code: string;
        booking_date: string;
        service_type: string;
        package_name?: string | null;
        style_name?: string | null;
        payment_status: string;
        client_name: string;
        client_whatsapp: string;
        client_email?: string | null;
        start_time: string;
        end_time: string;
        duration_hours?: number;
        guest_count?: number;
        dp_amount?: number | null;
        total_amount: number;
        payment_method?: string | null;
        created_at?: string;
    };
}

export const InvoiceTemplate = ({ booking }: InvoiceTemplateProps) => {
    const { t, i18n } = useTranslation(['common', 'booking', 'dashboard']);

    const getStatusLabel = (status: string) => {
        switch (status.toLowerCase()) {
            case 'lunas':
            case 'paid':
                return t('common:status.paid').toUpperCase();
            case 'dp':
                return 'DP';
            case 'pending':
                return t('common:status.pending').toUpperCase();
            default:
                return status.toUpperCase();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'lunas':
            case 'paid':
                return 'text-green-700 bg-green-50 border-green-200';
            case 'dp':
                return 'text-amber-700 bg-amber-50 border-amber-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const paymentIcon = () => {
        const method = booking.payment_method?.toLowerCase() || '';
        if (method.includes('qris')) return <QrCode className="w-4 h-4" />;
        if (method.includes('transfer')) return <Landmark className="w-4 h-4" />;
        if (method.includes('dana') || method.includes('gopay')) return <Wallet className="w-4 h-4" />;
        return <CreditCard className="w-4 h-4" />;
    };

    const paidAmount = booking.payment_status.toLowerCase() === 'dp' ? (booking.dp_amount || 0) : booking.total_amount;
    const remainingAmount = Math.max(0, booking.total_amount - paidAmount);

    return (
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-100 shadow-sm print:shadow-none print:border-none max-w-3xl mx-auto text-sm font-sans text-slate-800">
            {/* 1. Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-6">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-slate-900 mb-1">Morain Studio</h1>
                    <p className="text-slate-500 text-xs">Professional Studio & Photobox</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-wide">{t('common:invoice.title')}</h2>
                    <p className="font-mono text-green-700 font-medium">{booking.booking_code}</p>
                </div>
            </div>

            {/* 2. Publisher & Client Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-wider">{t('common:invoice.issuedBy')}</h3>
                    <div className="space-y-1">
                        <p className="font-bold text-slate-900">Morain Studio</p>
                        <p className="text-slate-600">Jl. Wibisana Barat No. 36</p>
                        <p className="text-slate-600">Denpasar Utara, Bali</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-wider">{t('common:invoice.for')}</h3>
                    <div className="space-y-1">
                        <p className="font-bold text-slate-900">{booking.client_name}</p>
                        <p className="text-slate-600">
                            {formatDate(new Date(booking.booking_date), 'dd MMMM yyyy', i18n.language)}
                        </p>
                        <p className="text-slate-600">{booking.client_whatsapp}</p>
                        {booking.client_email && <p className="text-slate-600">{booking.client_email}</p>}
                    </div>
                </div>
            </div>

            {/* 3. Service Table */}
            <div className="mb-8">
                <div className="grid grid-cols-12 gap-4 border-b-2 border-slate-100 pb-3 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-6">{t('common:invoice.serviceInfo')}</div>
                    <div className="col-span-2 text-center">{t('common:invoice.quantity')}</div>
                    <div className="col-span-2 text-right">{t('common:invoice.unitPrice')}</div>
                    <div className="col-span-2 text-right">{t('common:invoice.total')}</div>
                </div>

                <div className="grid grid-cols-12 gap-4 py-2 items-start text-sm">
                    <div className="col-span-6">
                        <p className="font-bold text-slate-900 text-base mb-1 capitalize">
                            {booking.package_name?.replace('Paket Foto Studio – ', '') || booking.style_name || (booking.service_type === 'photobox' ? t('common:services.photobox') : t('common:services.studio'))}
                        </p>
                        <div className="space-y-1 text-slate-500 text-xs">
                            <p className="capitalize">{t('common:invoice.service')}: {booking.service_type === 'photobox' ? t('common:services.photobox') : t('common:services.studio')}</p>
                            <p>{t('common:invoice.time')}: {booking.start_time} - {booking.end_time} WITA</p>
                            {booking.guest_count && <p>{t('common:invoice.guests')}: {booking.guest_count} {t('common:labels.people', 'Orang')}</p>}
                        </div>
                    </div>
                    <div className="col-span-2 text-center text-slate-600">
                        {booking.duration_hours ? `${booking.duration_hours} ${t('common:time.hours')}` : `1 ${t('common:invoice.session')}`}
                    </div>
                    <div className="col-span-2 text-right text-slate-600">
                        {formatCurrency(booking.total_amount / (booking.duration_hours || 1), i18n.language)}
                    </div>
                    <div className="col-span-2 text-right font-bold text-slate-900">
                        {formatCurrency(booking.total_amount, i18n.language)}
                    </div>
                </div>
                <div className="border-b border-slate-100 mt-4"></div>
            </div>

            {/* 4. Cost Summary */}
            <div className="flex flex-col md:flex-row justify-end items-end gap-6 mb-8">
                <div className="w-full md:w-1/2 space-y-3">
                    <div className="flex justify-between items-center text-slate-600">
                        <span>{t('common:invoice.subtotal')}</span>
                        <span>{formatCurrency(booking.total_amount, i18n.language)}</span>
                    </div>

                    <div className="border-b border-slate-100 border-dashed my-2"></div>

                    <div className="flex justify-between items-center text-slate-600">
                        <span>{t('common:invoice.paid')}</span>
                        <span className="font-medium text-slate-900">{formatCurrency(booking.dp_amount || 0, i18n.language)}</span>
                    </div>

                    {remainingAmount > 0 ? (
                        <div className="flex justify-between items-center text-slate-600">
                            <span>{t('common:invoice.remaining')}</span>
                            <span className="font-medium text-red-600">{formatCurrency(remainingAmount, i18n.language)}</span>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center text-slate-600">
                            <span>{t('common:invoice.remaining')}</span>
                            <span className="font-medium text-slate-900">{formatCurrency(0, i18n.language)}</span>
                        </div>
                    )}

                    <div className="border-b border-slate-100 my-2"></div>

                    <div className="flex justify-between items-center pt-1">
                        <span className="font-bold text-lg text-slate-900">{t('common:invoice.totalBill')}</span>
                        <span className="font-bold text-lg text-slate-900">{formatCurrency(booking.total_amount, i18n.language)}</span>
                    </div>

                    <div className="flex justify-end pt-2">
                        <span className={`px-3 py-1 rounded-md text-xs font-bold border ${getStatusColor(booking.payment_status)}`}>
                            {getStatusLabel(booking.payment_status)}
                        </span>
                    </div>
                </div>
            </div>

            {/* 5. Footer & Payment Method */}
            <div className="grid md:grid-cols-2 gap-8 border-t border-slate-100 pt-6">
                <div>
                    <h4 className="font-bold text-xs text-slate-900 uppercase mb-3 flex items-center gap-2">
                        {t('common:invoice.paymentMethod')}
                    </h4>
                    {booking.payment_method ? (
                        <div className="flex items-center gap-2 text-slate-600 text-sm capitalize">
                            {paymentIcon()}
                            <span>{booking.payment_method}</span>
                        </div>
                    ) : (
                        <p className="text-slate-400 text-sm">-</p>
                    )}
                </div>
                <div className="text-right space-y-1">
                    <p className="text-xs text-slate-400 text-right">{t('common:invoice.autoGenerated')}</p>
                    <p className="text-xs text-slate-400 text-right">{t('common:invoice.supportNote')}</p>
                </div>
            </div>
        </div>
    );
};
