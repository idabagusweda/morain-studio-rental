import { usePaymentCountdown } from '@/hooks/usePaymentLogic';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation(['common']);
    const { timeLeftString, isExpired } = usePaymentCountdown(expiresAt);

    if (isExpired || !expiresAt) {
        return <span className={`text-xs text-red-500 font-medium ${className}`}>{t('common:labels.expired')}</span>;
    }

    return (
        <div className={`flex flex-col ${center ? 'items-center' : 'items-start'} ${className}`}>
            {showLabel && (
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('common:labels.timeLeft')}</span>
            )}
            <span className="text-xs font-mono font-bold text-orange-600 animate-pulse">{timeLeftString}</span>
        </div>
    );
};
