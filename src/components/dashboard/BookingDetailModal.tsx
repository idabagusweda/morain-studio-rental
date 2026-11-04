import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    Clock,
    User,
    Phone,
    Mail,
    CreditCard,
    FileText,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { InvoiceTemplate } from './InvoiceTemplate';

interface BookingDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any;
}

export const BookingDetailModal = ({ isOpen, onClose, booking }: BookingDetailModalProps) => {
    if (!booking) return null;

    const handleDownloadInvoice = () => {
        // print window for now
        window.print();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'lunas':
            case 'selesai':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'dp':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'batal':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-amber-600 bg-amber-50 border-amber-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'lunas': return 'Lunas';
            case 'dp': return 'DP Paid';
            case 'pending': return 'Menunggu Pembayaran';
            case 'selesai': return 'Selesai';
            case 'batal': return 'Dibatalkan';
            default: return status;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50">
                <DialogHeader>
                    <div className="flex items-center justify-between mb-2">
                        <DialogTitle className="text-xl font-display">Invoice Booking</DialogTitle>
                    </div>
                    <DialogDescription>
                        Kode Booking: <span className="font-mono font-medium text-foreground">{booking.booking_code}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <InvoiceTemplate booking={booking} />

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="w-full" onClick={handleDownloadInvoice}>
                            <FileText className="w-4 h-4 mr-2" />
                            Download Invoice
                        </Button>
                        <Button className="w-full" onClick={onClose}>
                            Tutup
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
