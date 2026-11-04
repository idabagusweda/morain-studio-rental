import { usePaymentCountdown } from '@/hooks/usePaymentLogic';

interface PaymentTimerProps {
    expiresAt: string | null;
    showLabel?: boolean;
    center?: boolean;
    className?: string;
}

export const PaymentTimer = ({
    expiresAt,
    showLabel = true,
    center = true,
    className = ""
}: PaymentTimerProps) => {
    const { timeLeftString, isExpired } = usePaymentCountdown(expiresAt);

    if (isExpired || !expiresAt) {
        return <span className={`text-xs text-red-500 font-medium ${className}`}>Expired</span>;
    }

    return (
        <div className={`flex flex-col ${center ? 'items-center' : 'items-start'} ${className}`}>
            {showLabel && (
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sisa Waktu</span>
            )}
            <span className="text-xs font-mono font-bold text-orange-600 animate-pulse">{timeLeftString}</span>
        </div>
    );
};
