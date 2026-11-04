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
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface PendingBookingModalProps {
    booking: any;
    isOpen: boolean;
    onCancel: () => void;
    onResume: () => void;
    isProcessing?: boolean;
}

export const PendingBookingModal = ({ booking, isOpen, onCancel, onResume, isProcessing }: PendingBookingModalProps) => {
    if (!booking) return null;

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Anda memiliki booking pending</AlertDialogTitle>
                    <AlertDialogDescription>
                        Anda masih memiliki booking yang belum dibayar. Mohon selesaikan atau batalkan sebelum membuat booking baru.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="bg-slate-50 p-4 rounded-lg text-sm space-y-2 border">
                    <div className="flex justify-between font-medium">
                        <span>{booking.service_type === 'studio' ? 'Studio' : 'Photobox'}</span>
                        <span className="font-mono">{booking.booking_code}</span>
                    </div>
                    <div className="text-muted-foreground flex justify-between">
                        <span>{format(new Date(booking.booking_date), 'd MMMM yyyy', { locale: id })}</span>
                        <span>{booking.start_time}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                        <span className="text-muted-foreground">Sisa Waktu:</span>
                        <PaymentTimer expiresAt={booking.expires_at} showLabel={false} center={false} />
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel} disabled={isProcessing}>Batalkan Booking Ini</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => { e.preventDefault(); onResume(); }} disabled={isProcessing} className="bg-[#849283] hover:bg-[#6b7a6a]">
                        {isProcessing ? 'Memproses...' : 'Lanjut Bayar'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
