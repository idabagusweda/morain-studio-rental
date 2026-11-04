import { useState } from 'react';
import { addDays, isBefore } from 'date-fns';
import { id } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/i18nUtils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarLegend } from './CalendarLegend';
import { TimeSlotGrid } from './TimeSlotGrid';

type TimeSlot = {
  time: string;
  available: boolean;
};

const generateTimeSlots = (date: Date): TimeSlot[] => {
  const day = date.getDay();
  const isWeekend = day === 0 || day === 6; // 0 = Minggu, 6 = Sabtu

  if (isWeekend) {
    return [
      { time: '09:00', available: true },
      { time: '10:00', available: true },
      { time: '11:00', available: true },
      { time: '12:00', available: true },
      { time: '13:00', available: true },
      { time: '14:00', available: true },
      { time: '15:00', available: true },
      { time: '16:00', available: true },
      { time: '17:00', available: true },
      { time: '18:00', available: true },
      { time: '19:00', available: true },
    ];
  } else {
    return [
      { time: '09:00', available: true },
      { time: '10:00', available: false },
      { time: '11:00', available: true },
      { time: '12:00', available: false },
      { time: '13:00', available: true },
      { time: '14:00', available: true },
      { time: '15:00', available: false },
      { time: '16:00', available: true },
      { time: '17:00', available: true },
      { time: '18:00', available: true },
      { time: '19:00', available: false },
    ];
  }
};
interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueBooking?: (date: Date, time: string) => void;
}

export const CalendarModal = ({ isOpen, onClose, onContinueBooking }: CalendarModalProps) => {
  const { t, i18n } = useTranslation(['booking', 'common']);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const timeSlots = generateTimeSlots(selectedDate);

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isBefore(date, today);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedSlot(null);
    }
  };

  const handleSlotSelect = (time: string) => {
    setSelectedSlot(time);
  };

  const formatSelectedDate = (date: Date) => {
    return formatDate(date, 'EEEE, d MMMM yyyy', i18n.language);
  };

  const handleContinue = () => {
    if (selectedSlot && onContinueBooking) {
      const [hours, minutes] = selectedSlot.split(':').map(Number);
      const bookingDate = new Date(selectedDate);
      bookingDate.setHours(hours, minutes);
      onContinueBooking(bookingDate, selectedSlot);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {t('booking:calendar.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-8 mt-6">
          {/* Calendar Section */}
          <div className="bg-card p-6 rounded-xl border">
            <h3 className="text-lg font-semibold mb-4">{t('booking:calendar.selectDate')}</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-xl p-4 mx-auto [&_.rdp-button]:rounded-full [&_.rdp-button]:w-10 [&_.rdp-button]:h-10 [&_.rdp-button]:flex [&_.rdp-button]:items-center [&_.rdp-button]:justify-center [&_.rdp-button:hover:not([disabled])]:bg-primary [&_.rdp-button:hover:not([disabled])]:text-white [&_.rdp-button_selected]:bg-primary [&_.rdp-button_selected]:text-white [&_.rdp-button_selected:hover]:bg-primary/90"
              disabled={isDateDisabled}
              locale={i18n.language === 'en' ? undefined : id}
              fromDate={new Date()}
              toDate={addDays(new Date(), 30)}
              modifiers={{
                available: timeSlots.some(slot => slot.available) ? [selectedDate] : []
              }}
              modifiersStyles={{
                available: {
                  fontWeight: '500' // Removed color to confirm to white text on selection
                }
              }}
            />

            <CalendarLegend />
          </div>

          {/* Time Slots Section */}
          <div className="p-1">
            <h3 className="text-lg font-semibold mb-4">{formatSelectedDate(selectedDate)}</h3>

            <TimeSlotGrid
              slots={timeSlots}
              selectedSlot={selectedSlot}
              onSelect={handleSlotSelect}
              formatLabel={(time) => `${time} - ${String(parseInt(time.split(':')[0]) + 1).padStart(2, '0')}:00`}
            />

            <div className="mt-6 pt-4 border-t">
              <Button
                className="w-full"
                size="lg"
                disabled={!selectedSlot}
                onClick={handleContinue}
              >
                {t('booking:calendar.continue')}
              </Button>
              <p className="text-sm text-muted-foreground mt-3 text-center">
                {t('booking:calendar.hint')}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
