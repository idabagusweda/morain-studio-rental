import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { InvoiceTemplate } from './InvoiceTemplate';
import { useTranslation } from 'react-i18next';

interface BookingDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any;
}

export const BookingDetailModal = ({ isOpen, onClose, booking }: BookingDetailModalProps) => {
    const { t } = useTranslation(['dashboard', 'booking', 'common']);
    if (!booking) return null;

    const handleDownloadInvoice = () => {
        // print window for now
        window.print();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50">
                <DialogHeader>
                    <div className="flex items-center justify-between mb-2">
                        <DialogTitle className="text-xl font-display">{t('dashboard:history.actions.invoice')} Booking</DialogTitle>
                    </div>
                    <DialogDescription>
                        {t('booking:paymentReturn.bookingCode')}: <span className="font-mono font-medium text-foreground">{booking.booking_code}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <InvoiceTemplate booking={booking} />

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="w-full" onClick={handleDownloadInvoice}>
                            <FileText className="w-4 h-4 mr-2" />
                            {t('dashboard:history.downloadInvoice')}
                        </Button>
                        <Button className="w-full" onClick={onClose}>
                            {t('common:buttons.close')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
