
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CreditCard, QrCode, Landmark, Wallet } from 'lucide-react';

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
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'lunas': return 'LUNAS';
            case 'dp': return 'DP';
            case 'pending': return 'PENDING';
            default: return status.toUpperCase();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'lunas': return 'text-green-700 bg-green-50 border-green-200';
            case 'dp': return 'text-amber-700 bg-amber-50 border-amber-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const paymentIcon = () => {
        const method = booking.payment_method?.toLowerCase() || '';
        if (method.includes('qris')) return <QrCode className="w-4 h-4" />;
        if (method.includes('transfer')) return <Landmark className="w-4 h-4" />;
        if (method.includes('dana') || method.includes('gopay')) return <Wallet className="w-4 h-4" />;
        return <CreditCard className="w-4 h-4" />;
    };

    // Calculate remaining amount irrespective of status string, but respecting LUNAS/FULL logic if needed.
    // If status is DP, we expect a remainder. If LUNAS, expected 0.
    // But the most robust way is: Total - Paid.
    // Use dp_amount if valid, otherwise try to use a 'paid_amount' field if it existed (but interface implies only dp_amount available here?)
    // Actually the interface has: dp_amount?: number...
    // Let's rely on logic: Total - (Paid Amount).
    // Paid Amount = dp_amount (if DP) OR total_amount (if Lunas).

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
                    <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-wide">INVOICE</h2>
                    <p className="font-mono text-green-700 font-medium">{booking.booking_code}</p>
                </div>
            </div>

            {/* 2. Publisher & Client Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-wider">DITERBITKAN ATAS NAMA</h3>
                    <div className="space-y-1">
                        <p className="font-bold text-slate-900">Morain Studio</p>
                        <p className="text-slate-600">Jl. Wibisana Barat No. 36</p>
                        <p className="text-slate-600">Denpasar Utara, Bali</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-wider">UNTUK</h3>
                    <div className="space-y-1">
                        <p className="font-bold text-slate-900">{booking.client_name}</p>
                        <p className="text-slate-600">
                            {format(new Date(booking.booking_date), 'dd MMMM yyyy', { locale: id })}
                        </p>
                        <p className="text-slate-600">{booking.client_whatsapp}</p>
                        {booking.client_email && <p className="text-slate-600">{booking.client_email}</p>}
                    </div>
                </div>
            </div>

            {/* 3. Service Table */}
            <div className="mb-8">
                <div className="grid grid-cols-12 gap-4 border-b-2 border-slate-100 pb-3 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-6">Info Layanan</div>
                    <div className="col-span-2 text-center">Jumlah</div>
                    <div className="col-span-2 text-right">Harga Satuan</div>
                    <div className="col-span-2 text-right">Total</div>
                </div>

                <div className="grid grid-cols-12 gap-4 py-2 items-start text-sm">
                    <div className="col-span-6">
                        <p className="font-bold text-slate-900 text-base mb-1 capitalize">
                            {booking.package_name?.replace('Paket Foto Studio – ', '') || booking.style_name || 'Studio Rental'}
                        </p>
                        <div className="space-y-1 text-slate-500 text-xs">
                            <p className="capitalize">Layanan: {booking.service_type}</p>
                            <p>Waktu: {booking.start_time} - {booking.end_time} WITA</p>
                            {booking.guest_count && <p>Tamu: {booking.guest_count} Orang</p>}
                        </div>
                    </div>
                    <div className="col-span-2 text-center text-slate-600">
                        {booking.duration_hours ? `${booking.duration_hours} Jam` : '1 Sesi'}
                    </div>
                    <div className="col-span-2 text-right text-slate-600">
                        Rp {(booking.total_amount / (booking.duration_hours || 1)).toLocaleString('id-ID')}
                    </div>
                    <div className="col-span-2 text-right font-bold text-slate-900">
                        Rp {booking.total_amount.toLocaleString('id-ID')}
                    </div>
                </div>
                <div className="border-b border-slate-100 mt-4"></div>
            </div>

            {/* 4. Cost Summary */}
            <div className="flex flex-col md:flex-row justify-end items-end gap-6 mb-8">
                <div className="w-full md:w-1/2 space-y-3">
                    <div className="flex justify-between items-center text-slate-600">
                        <span>Subtotal</span>
                        <span>Rp {booking.total_amount.toLocaleString('id-ID')}</span>
                    </div>
                    {/* Admin Fee or Discount can go here if needed */}

                    <div className="border-b border-slate-100 border-dashed my-2"></div>

                    <div className="flex justify-between items-center text-slate-600">
                        <span>Sudah Dibayar</span>
                        <span className="font-medium text-slate-900">Rp {(booking.dp_amount || 0).toLocaleString('id-ID')}</span>
                    </div>

                    {remainingAmount > 0 ? (
                        <div className="flex justify-between items-center text-slate-600">
                            <span>Sisa Pembayaran</span>
                            <span className="font-medium text-red-600">Rp {remainingAmount.toLocaleString('id-ID')}</span>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center text-slate-600">
                            <span>Sisa Pembayaran</span>
                            <span className="font-medium text-slate-900">Rp 0</span>
                        </div>
                    )}

                    <div className="border-b border-slate-100 my-2"></div>

                    <div className="flex justify-between items-center pt-1">
                        <span className="font-bold text-lg text-slate-900">Total Tagihan</span>
                        <span className="font-bold text-lg text-slate-900">Rp {booking.total_amount.toLocaleString('id-ID')}</span>
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
                        Metode Pembayaran
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
                    <p className="text-xs text-slate-400 text-right">Invoice ini dibuat secara otomatis oleh sistem Morain Studio.</p>
                    <p className="text-xs text-slate-400 text-right">Silakan hubungi kami jika membutuhkan bantuan.</p>
                </div>
            </div>
        </div>
    );
};
