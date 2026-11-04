import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    MessageCircle,
    FileText,
    Calendar,
    Clock,
    User,
    CreditCard
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate } from '@/lib/i18nUtils';

interface Booking {
    id: string;
    booking_code: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    client_name: string;
    client_whatsapp: string;
    client_email: string | null;
    service_type: string;
    package_name: string | null;
    style_name: string | null;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    payment_status: string;
    booking_status: string;
    payment_method: string;
    notes: string | null;
}

interface BookingDetailModalProps {
    booking: Booking | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export const BookingDetailModal = ({ booking, isOpen, onClose, onUpdate }: BookingDetailModalProps) => {
    const { t, i18n } = useTranslation(['admin', 'common', 'booking']);
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(booking?.payment_status || 'PENDING');
    const [bookingStatus, setBookingStatus] = useState(booking?.booking_status || 'ACTIVE');

    if (!booking) return null;

    const handleUpdateStatus = async () => {
        setLoading(true);
        try {
            const updateData: Record<string, unknown> = {
                payment_status: status,
                booking_status: bookingStatus,
                updated_at: new Date().toISOString()
            };

            // Auto-calculate amounts if marking as LUNAS
            if (status === 'LUNAS' && booking.payment_status !== 'LUNAS') {
                updateData.paid_amount = booking.total_amount;
                updateData.remaining_amount = 0;
            }

            const { error } = await supabase
                .from('bookings')
                .update(updateData)
                .eq('id', booking.id);

            if (error) throw error;

            toast({
                title: t('common:messages.success', 'Berhasil'),
                description: t('admin:detailModal.updateSuccess', 'Status booking berhasil diperbarui'),
            });
            onUpdate();
            onClose();
        } catch (error: unknown) {
            console.error('Error updating booking:', error);
            const message = error instanceof Error ? error.message : '';
            toast({
                title: t('admin:detailModal.updateError', 'Gagal update status'),
                description: message,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = () => {
        const phoneNumber = booking.client_whatsapp.replace(/\D/g, '');
        const message = t('admin:detailModal.whatsappMessage', {
            name: booking.client_name,
            code: booking.booking_code,
            defaultValue: `Halo Kak ${booking.client_name}, ini dari Morain Studio mengenai booking ${booking.booking_code}.`
        });
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {t('admin:detailModal.title', 'Booking Detail')}
                        <Badge variant="outline" className="font-mono text-xs">
                            {booking.booking_code}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Left Column: Customer & Service Info */}
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <User className="w-4 h-4" /> {t('admin:detailModal.clientInfo', 'Informasi Klien')}
                            </h4>
                            <div className="bg-secondary/20 p-3 rounded-lg space-y-2">
                                <div className="grid grid-cols-3 gap-1 text-sm">
                                    <span className="text-muted-foreground">{t('admin:detailModal.name', 'Nama:')}</span>
                                    <span className="col-span-2 font-medium">{booking.client_name}</span>
                                    <span className="text-muted-foreground">{t('admin:detailModal.whatsapp', 'WA:')}</span>
                                    <span className="col-span-2">{booking.client_whatsapp}</span>
                                    <span className="text-muted-foreground">{t('admin:detailModal.email', 'Email:')}</span>
                                    <span className="col-span-2">{booking.client_email || '-'}</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full mt-2 h-7"
                                    onClick={handleWhatsApp}
                                >
                                    <MessageCircle className="w-3 h-3 mr-2 text-green-600" />
                                    {t('admin:detailModal.contactWhatsApp', 'Hubungi WhatsApp')}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <FileText className="w-4 h-4" /> {t('admin:detailModal.serviceDetail', 'Detail Layanan')}
                            </h4>
                            <div className="bg-secondary/20 p-3 rounded-lg text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('admin:detailModal.type', 'Tipe:')}</span>
                                    <span className="font-medium capitalize">{booking.service_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('admin:detailModal.package', 'Paket:')}</span>
                                    <span className="font-medium">
                                        {booking.service_type === 'studio' ? booking.package_name : booking.style_name}
                                    </span>
                                </div>
                                {booking.notes && (
                                    <div className="mt-2 text-xs italic text-muted-foreground border-t border-border pt-2">
                                        {t('admin:detailModal.note', 'Catatan')}: "{booking.notes}"
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Time & Payment Status */}
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> {t('admin:detailModal.sessionTime', 'Waktu Sesi')}
                            </h4>
                            <div className="bg-secondary/20 p-3 rounded-lg text-sm flex items-center justify-between">
                                <div>
                                    <div className="font-medium">
                                        {formatDate(new Date(booking.booking_date), 'EEEE, d MMMM yyyy', i18n.language)}
                                    </div>
                                    <div className="text-muted-foreground flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {booking.start_time} - {booking.end_time}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CreditCard className="w-4 h-4" /> {t('admin:detailModal.statusAndPayment', 'Status & Pembayaran')}
                            </h4>
                            <div className="bg-secondary/20 p-3 rounded-lg space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">{t('admin:detailModal.paymentStatus', 'Status Pembayaran')}</Label>
                                        <Select
                                            value={status}
                                            onValueChange={(val) => setStatus(val)}
                                        >
                                            <SelectTrigger className="h-8 text-xs bg-background">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PENDING">{t('common:status.pending')}</SelectItem>
                                                <SelectItem value="DP">{t('common:status.dp')}</SelectItem>
                                                <SelectItem value="LUNAS">{t('common:status.lunas')}</SelectItem>
                                                <SelectItem value="EXPIRED">{t('common:status.expired')}</SelectItem>
                                                <SelectItem value="CANCELLED">{t('common:status.cancelled')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">{t('admin:detailModal.bookingStatus', 'Status Booking')}</Label>
                                        <Select
                                            value={bookingStatus}
                                            onValueChange={(val) => setBookingStatus(val)}
                                        >
                                            <SelectTrigger className="h-8 text-xs bg-background">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ACTIVE">{t('common:status.active')}</SelectItem>
                                                <SelectItem value="DONE">{t('common:status.done')}</SelectItem>
                                                <SelectItem value="CANCELLED">{t('common:status.cancelled')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1 pt-2 border-t border-border">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t('admin:detailModal.total', 'Total:')}</span>
                                        <span className="font-medium">{formatCurrency(booking.total_amount, i18n.language)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>{t('admin:detailModal.paidAmount', 'Sudah Bayar:')}</span>
                                        <span>{formatCurrency(booking.paid_amount, i18n.language)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-red-500 font-medium">
                                        <span>{t('admin:detailModal.remaining', 'Sisa:')}</span>
                                        <span>{formatCurrency(booking.remaining_amount > 0 ? booking.remaining_amount : Math.max(0, booking.total_amount - booking.paid_amount), i18n.language)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        {t('common:buttons.cancel', 'Batal')}
                    </Button>
                    <Button onClick={handleUpdateStatus} disabled={loading} className="bg-[#849283] hover:bg-[#6b7a6b]">
                        {loading ? t('common:buttons.saving', 'Menyimpan...') : t('common:buttons.saveChanges', 'Simpan Perubahan')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
