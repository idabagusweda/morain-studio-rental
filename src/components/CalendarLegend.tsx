import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const CalendarLegend = () => {
    const { t } = useTranslation(['booking']);

    return (
        <div className="mt-6 p-4 bg-muted/10 rounded-lg text-sm">
            <p className="font-medium mb-1">{t('booking:date.legend')}</p>
            <ul className="space-y-1">
                <li className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span>{t('booking:time.available')}</span>
                </li>
                <li className="flex items-center">
                    <X className="w-4 h-4 text-muted-foreground mr-2" />
                    <span>{t('booking:time.booked')}</span>
                </li>
            </ul>
        </div>
    );
};
