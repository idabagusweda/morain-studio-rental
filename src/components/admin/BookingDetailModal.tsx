import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Check,
    X,
    MessageCircle,
    FileText,
    Calendar,
    Clock,
    User,
    CreditCard
} from 'lucide-react';

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
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(booking?.payment_status || 'PENDING');
    const [bookingStatus, setBookingStatus] = useState(booking?.booking_status || 'ACTIVE');

    if (!booking) return null;

    const handleUpdateStatus = async () => {
        setLoading(true);
        try {
            const updateData: any = {
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
                title: 'Berhasil',
                description: 'Status booking berhasil diperbarui',
            });
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('Error updating booking:', error);
            toast({
                title: 'Gagal update status',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = () => {
        const phoneNumber = booking.client_whatsapp.replace(/\D/g, ''); // standardizes number
        const message = `Halo Kak ${booking.client_name}, ini dari Morain Studio mengenai booking ${booking.booking_code}.`;
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Booking Detail
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
                                <User className="w-4 h-4" /> Informasi Klien
                            </h4>
                            <div className="bg-secondary/20 p-3 rounded-lg space-y-2">
                                <div className="grid grid-cols-3 gap-1 text-sm">
                                    <span className="text-muted-foreground">Nama:</span>
                                    <span className="col-span-2 font-medium">{booking.client_name}</span>
                                    <span className="text-muted-foreground">WA:</span>
                                    <span className="col-span-2">{booking.client_whatsapp}</span>
                                    <span className="text-muted-foreground">Email:</span>
                                    <span className="col-span-2">{booking.client_email || '-'}</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full mt-2 h-7"
                                    onClick={handleWhatsApp}
                                >
                                    <MessageCircle className="w-3 h-3 mr-2 text-green-600" />
                                    Hubungi WhatsApp
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Detail Layanan
                            </h4>
                            <div className="bg-secondary/20 p-3 rounded-lg text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tipe:</span>
                                    <span className="font-medium capitalize">{booking.service_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Paket:</span>
                                    <span className="font-medium">
                                        {booking.service_type === 'studio' ? booking.package_name : booking.style_name}
                                    </span>
                                </div>
                                {booking.notes && (
                                    <div className="mt-2 text-xs italic text-muted-foreground border-t border-border pt-2">
                                        Note: "{booking.notes}"
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Time & Payment Status */}
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Waktu Sesi
                            </h4>
                            <div className="bg-secondary/20 p-3 rounded-lg text-sm flex items-center justify-between">
                                <div>
                                    <div className="font-medium">
                                        {new Date(booking.booking_date).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
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
                                <CreditCard className="w-4 h-4" /> Status & Pembayaran
                            </h4>
                            <div className="bg-secondary/20 p-3 rounded-lg space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Status Pembayaran</Label>
                                        <Select
                                            value={status}
                                            onValueChange={(val) => setStatus(val)}
                                        >
                                            <SelectTrigger className="h-8 text-xs bg-background">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="DP">DP</SelectItem>
                                                <SelectItem value="LUNAS">Lunas</SelectItem>
                                                <SelectItem value="EXPIRED">Expired</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Status Booking</Label>
                                        <Select
                                            value={bookingStatus}
                                            onValueChange={(val) => setBookingStatus(val)}
                                        >
                                            <SelectTrigger className="h-8 text-xs bg-background">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ACTIVE">Active</SelectItem>
                                                <SelectItem value="DONE">Done</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1 pt-2 border-t border-border">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Total:</span>
                                        <span className="font-medium">{formatCurrency(booking.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Sudah Bayar:</span>
                                        <span>{formatCurrency(booking.paid_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-red-500 font-medium">
                                        <span>Sisa:</span>
                                        <span>{formatCurrency(booking.remaining_amount > 0 ? booking.remaining_amount : Math.max(0, booking.total_amount - booking.paid_amount))}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Batal
                    </Button>
                    <Button onClick={handleUpdateStatus} disabled={loading} className="bg-[#849283] hover:bg-[#6b7a6b]">
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
