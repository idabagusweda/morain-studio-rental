import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { History, FileText, ChevronLeft, Download, Printer, Calendar, Clock, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate } from '@/lib/i18nUtils';

interface Booking {
  id: string;
  booking_code: string;
  service_type: string;
  package_name: string | null;
  style_name: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number | null;
  guest_count: number | null;
  purpose: string | null;
  notes: string | null;
  payment_method: string | null;
  payment_status: string;
  dp_amount: number | null;
  total_amount: number;
  client_name: string;
  client_whatsapp: string;
  client_email: string | null;
  created_at: string;
}

interface BookingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingHistoryModal = ({ isOpen, onClose }: BookingHistoryModalProps) => {
  const { t, i18n } = useTranslation(['dashboard', 'booking', 'common']);
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchBookings();
    }
  }, [isOpen, user]);

  const fetchBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'dp':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">DP</Badge>;
      case 'paid':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">{t('common:status.paid')}</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">{t('common:status.pending')}</Badge>;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // For now, trigger print dialog which can save as PDF
    window.print();
  };

  const renderBookingList = () => (
    <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto">
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          {t('common:status.loading')}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t('dashboard:history.noHistory')}
        </div>
      ) : (
        bookings.map((booking) => (
          <div
            key={booking.id}
            className="border border-border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => setSelectedBooking(booking)}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{booking.booking_code}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.service_type === 'photobox' ? t('common:services.photobox', 'Photobox') : booking.package_name || t('common:services.studio', 'Studio Rental')}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {formatDate(new Date(booking.booking_date), 'dd MMMM yyyy', i18n.language)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {booking.start_time} - {booking.end_time}
                </div>
              </div>
              <div className="text-right space-y-2">
                {getStatusBadge(booking.payment_status)}
                <Button variant="ghost" size="sm" className="text-primary">
                  <FileText className="w-4 h-4 mr-1" />
                  {t('dashboard:history.actions.invoice')}
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderInvoice = () => {
    if (!selectedBooking) return null;

    return (
      <div className="py-4 space-y-6 print:p-8" id="invoice-content">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedBooking(null)}
          className="print:hidden"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {t('common:buttons.back')}
        </Button>

        {/* Invoice Header */}
        <div className="text-center border-b border-border pb-4">
          <h2 className="font-display text-2xl font-semibold">Morain Studio</h2>
          <p className="text-sm text-muted-foreground">{t('dashboard:history.actions.invoice')} Booking</p>
        </div>

        {/* Invoice Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{t('booking:paymentReturn.bookingCode')}</p>
              <p className="font-semibold">{selectedBooking.booking_code}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('dashboard:history.table.payment')}</p>
              {getStatusBadge(selectedBooking.payment_status)}
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <h3 className="font-semibold">{t('booking:form.title')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">{t('common:labels.name')}</p>
                <p>{selectedBooking.client_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">WhatsApp</p>
                <p>{selectedBooking.client_whatsapp}</p>
              </div>
              {selectedBooking.client_email && (
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p>{selectedBooking.client_email}</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <h3 className="font-semibold">{t('dashboard:history.table.serviceDetail')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">{t('common:labels.service')}</p>
                <p>{selectedBooking.service_type === 'photobox' ? t('common:services.photobox', 'Photobox') : t('common:services.studio', 'Studio Rental')}</p>
              </div>
              {selectedBooking.package_name && (
                <div>
                  <p className="text-muted-foreground">{t('common:labels.package')}</p>
                  <p>{selectedBooking.package_name}</p>
                </div>
              )}
              {selectedBooking.style_name && (
                <div>
                  <p className="text-muted-foreground">{t('booking:steps.style')}</p>
                  <p>{selectedBooking.style_name}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">{t('common:labels.date')}</p>
                <p>{formatDate(new Date(selectedBooking.booking_date), 'dd MMMM yyyy', i18n.language)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('common:labels.time')}</p>
                <p>{selectedBooking.start_time} - {selectedBooking.end_time}</p>
              </div>
              {selectedBooking.duration_hours && (
                <div>
                  <p className="text-muted-foreground">{t('booking:summary.duration')}</p>
                  <p>{selectedBooking.duration_hours} {t('common:time.hours')}</p>
                </div>
              )}
              {selectedBooking.guest_count && (
                <div>
                  <p className="text-muted-foreground">{t('booking:form.guestsCount')}</p>
                  <p>{selectedBooking.guest_count} {t('common:labels.people', 'orang')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              {t('common:labels.payment')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {selectedBooking.payment_method && (
                <div>
                  <p className="text-muted-foreground">{t('booking:summary.paymentType')}</p>
                  <p className="uppercase">{selectedBooking.payment_method}</p>
                </div>
              )}
              {selectedBooking.dp_amount && (
                <div>
                  <p className="text-muted-foreground">{t('booking:summary.dpAmount')}</p>
                  <p>{formatCurrency(selectedBooking.dp_amount, i18n.language)}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">{t('booking:summary.totalPrice')}</p>
                <p className="font-semibold text-primary">{formatCurrency(selectedBooking.total_amount, i18n.language)}</p>
              </div>
            </div>
          </div>

          {selectedBooking.notes && (
            <div className="border-t border-border pt-4">
              <p className="text-muted-foreground text-sm">{t('booking:form.notes')}</p>
              <p className="text-sm">{selectedBooking.notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 print:hidden">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            {t('dashboard:history.downloadInvoice')}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-2" />
            {t('dashboard:history.printInvoice')}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <History className="w-5 h-5" />
            {selectedBooking ? t('dashboard:history.invoiceDetail') : t('dashboard:history.title')}
          </DialogTitle>
        </DialogHeader>

        {selectedBooking ? renderInvoice() : renderBookingList()}
      </DialogContent>
    </Dialog>
  );
};
