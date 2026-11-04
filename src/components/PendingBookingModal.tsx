import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PaymentTimer } from "@/components/PaymentTimer";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/i18nUtils";

interface PendingBookingModalProps {
    booking: any;
    isOpen: boolean;
    onCancel: () => void;
    onResume: () => void;
    isProcessing?: boolean;
}

export const PendingBookingModal = ({ booking, isOpen, onCancel, onResume, isProcessing }: PendingBookingModalProps) => {
    const { t, i18n } = useTranslation(['booking', 'common']);
    if (!booking) return null;

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('booking:pendingModal.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('booking:pendingModal.description')}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="bg-slate-50 p-4 rounded-lg text-sm space-y-2 border">
                    <div className="flex justify-between font-medium">
                        <span>{booking.service_type === 'studio' ? t('common:services.studio', 'Studio') : t('common:services.photobox', 'Photobox')}</span>
                        <span className="font-mono">{booking.booking_code}</span>
                    </div>
                    <div className="text-muted-foreground flex justify-between">
                        <span>{formatDate(new Date(booking.booking_date), 'd MMMM yyyy', i18n.language)}</span>
                        <span>{booking.start_time}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                        <span className="text-muted-foreground">{t('booking:payment.timeLeft')}:</span>
                        <PaymentTimer expiresAt={booking.expires_at} showLabel={false} center={false} />
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel} disabled={isProcessing}>{t('booking:pendingModal.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => { e.preventDefault(); onResume(); }} disabled={isProcessing} className="bg-[#849283] hover:bg-[#6b7a6a]">
                        {isProcessing ? t('booking:summary.processing') : t('booking:pendingModal.continuePay')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
