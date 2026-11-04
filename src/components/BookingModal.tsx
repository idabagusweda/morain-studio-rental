import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Check, ArrowRight, ArrowLeft, Clock, CreditCard, MessageCircle, CalendarDays, User, Package, Wallet, QrCode, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBookingSlots } from '@/hooks/useBookingSlots';
import { AuthModal } from './AuthModal';
import { supabase } from '@/integrations/supabase/client';
import { TermsModal } from './TermsModal';

import { useToast } from '@/hooks/use-toast';
import { usePaymentLogic } from '@/hooks/usePaymentLogic';
import { PendingBookingModal } from '@/components/PendingBookingModal';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate } from '@/lib/i18nUtils';
import { id } from 'date-fns/locale';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: {
    id: string;
    name: string;
    price: number;
    priceDisplay: string;
    capacity: number;
  } | null;
}

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00'
];

const purposeOptions = [
  { value: 'Portrait', labelKey: 'portrait' },
  { value: 'Couple', labelKey: 'couple' },
  { value: 'Family', labelKey: 'family' },
  { value: 'Product', labelKey: 'product' },
  { value: 'Corporate', labelKey: 'corporate' },
  { value: 'Student', labelKey: 'student' },
  { value: 'Lainnya', labelKey: 'other' },
];

const paymentMethods = [
  { id: 'bca', name: 'BCA Transfer', icon: '🏦' },
  { id: 'bni', name: 'BNI Transfer', icon: '🏦' },
  { id: 'qris', name: 'QRIS', icon: '📱' },
  { id: 'dana', name: 'Dana', icon: '💳' },
  { id: 'gopay', name: 'GoPay', icon: '💳' },
];

export const BookingModal = ({ isOpen, onClose, selectedPackage }: BookingModalProps) => {
  const { t, i18n } = useTranslation(['booking', 'common', 'auth', 'landing']);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { checkActivePendingPayment, resumePayment, cancelBooking, isProcessing: isPaymentProcessing } = usePaymentLogic();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [step, setStep] = useState(1);
  const [duration, setDuration] = useState('1');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    guests: '1',
    purpose: '',
    notes: '',
  });
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'full' | 'dp'>('dp');
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [pendingBooking, setPendingBooking] = useState<any>(null);

  // Check pending on open
  useEffect(() => {
    if (isOpen && user) {
      checkActivePendingPayment(user.id).then(booking => {
        if (booking) {
          setPendingBooking(booking);
        }
      });
    } else {
      // Reset when closed or logged out
      setPendingBooking(null);
    }
  }, [isOpen, user]);

  // Fetch booked slots for selected date
  const { bookedSlots, loading: slotsLoading } = useBookingSlots('studio', selectedDate, selectedPackage?.name);

  // Grouped Payment Methods
  const paymentMethodsList = [
    {
      category: "Instant Payment",
      items: [
        { id: 'qris', name: 'QRIS', icon: <QrCode className="w-6 h-6" /> },
      ]
    },
    {
      category: "Transfer Bank",
      items: [
        { id: 'bca', name: 'BCA Transfer', icon: <CreditCard className="w-6 h-6" /> },
        { id: 'bni', name: 'BNI Transfer', icon: <CreditCard className="w-6 h-6" /> },
      ]
    },
    {
      category: "E-Wallet",
      items: [
        { id: 'dana', name: 'DANA', icon: <Wallet className="w-6 h-6" /> },
        { id: 'gopay', name: 'GoPay', icon: <Wallet className="w-6 h-6" /> },
      ]
    }
  ];

  // Auto-fill form data from profile
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.full_name || prev.name,
        whatsapp: profile.whatsapp || prev.whatsapp,
        email: profile.email || prev.email,
      }));
    }
  }, [profile]);

  // Check auth when modal opens
  useEffect(() => {
    if (isOpen && !user) {
      setShowAuthModal(true);
    }
  }, [isOpen, user]);

  const totalPrice = selectedPackage ? selectedPackage.price * parseInt(duration) : 0;
  const paymentAmount = paymentType === 'full' ? totalPrice : totalPrice * 0.5;

  // Translated display name for the selected package (DB stores the original Indonesian name)
  const packageDisplayName = selectedPackage
    ? t(`landing:packages.${selectedPackage.id}.name`, { defaultValue: selectedPackage.name })
    : '';

  // Translate a stored purpose value (e.g. 'Lainnya') for display/messages
  const purposeLabel = (value: string) => {
    const option = purposeOptions.find(p => p.value === value);
    return option ? t(`booking:data.purposes.${option.labelKey}`, { defaultValue: value }) : value;
  };

  const generateBookingCode = () => {
    const code = `MOR-2025-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setBookingCode(code);
    return code;
  };

  const getEndTime = (startTime: string, hours: number) => {
    if (!startTime) return '00:00';
    const [hour] = startTime.split(':').map(Number);
    const endHour = hour + hours;
    return `${endHour.toString().padStart(2, '0')}:00`;
  };

  // Reset selectedTime when selectedDate changes
  useEffect(() => {
    setSelectedTime('');
  }, [selectedDate]);

  const saveBooking = async (code: string) => {
    if (!user || !selectedPackage || !selectedDate || !selectedTime) {
      toast({
        title: t('booking:messages.incompleteTitle'),
        description: t('booking:messages.incompleteDescription'),
        variant: "destructive"
      });
      return null;
    }

    // Format date as YYYY-MM-DD without timezone conversion
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    // Create booking with PENDING status (payment not yet made)
    const { data, error } = await supabase.from('bookings').insert({
      user_id: user.id,
      booking_code: code,
      service_type: 'studio',
      package_name: selectedPackage.name,
      booking_date: dateString,
      start_time: selectedTime,
      end_time: getEndTime(selectedTime, parseInt(duration)),
      duration_hours: parseInt(duration),
      guest_count: parseInt(formData.guests),
      purpose: formData.purpose,
      notes: formData.notes || null,
      payment_method: paymentMethod || 'midtrans', // Default to midtrans/snap if empty
      payment_status: 'PENDING', // Will be updated by webhook
      booking_status: 'PENDING', // Will be ACTIVE after payment
      payment_option: paymentType === 'full' ? 'FULL' : 'DP',
      dp_amount: 0,
      total_amount: totalPrice,
      paid_amount: 0,
      remaining_amount: totalPrice,
      client_name: formData.name,
      client_whatsapp: formData.whatsapp,
      client_email: formData.email || null,
    }).select('id').single();

    if (error) {
      console.error('Error saving booking:', error);
      // Check for unique constraint violation (double booking)
      if (error.code === '23505' || error.message?.includes('unique') || error.message?.includes('duplicate')) {
        toast({
          title: t('booking:messages.slotTakenTitle'),
          description: t('booking:messages.slotTakenDescription'),
          variant: 'destructive'
        });
      } else {
        toast({
          title: t('booking:messages.saveFailed'),
          description: error.message,
          variant: 'destructive'
        });
      }
      return null;
    }
    return data?.id || null;
  };

  // Call Midtrans Edge Function to get payment URL
  const initiatePayment = async (bookingId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        toast({
          title: t('common:messages.error'),
          description: t('booking:messages.invalidSession'),
          variant: 'destructive'
        });
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-midtrans-transaction`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            booking_id: bookingId,
            payment_type: paymentType === 'full' ? 'FULL' : 'DP',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('booking:messages.transactionFailed'));
      }

      const data = await response.json();
      return data.redirect_url;
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast({
        title: t('booking:messages.paymentFailed'),
        description: error instanceof Error ? error.message : t('common:messages.error'),
        variant: 'destructive'
      });
      return null;
    }
  };

  const handleNext = async () => {
    if (step === 4) {
      setIsProcessing(true);
      try {
        const code = generateBookingCode();
        const bookingId = await saveBooking(code);
        if (!bookingId) {
          setIsProcessing(false);
          return; // Stop if booking failed
        }
        setBookingCode(code);
        setCreatedBookingId(bookingId);

        // Initiate Midtrans payment
        const redirectUrl = await initiatePayment(bookingId);
        if (redirectUrl) {
          // Redirect to Midtrans payment page
          window.location.href = redirectUrl;
          return;
        }
      } finally {
        setIsProcessing(false);
      }
      return; // Don't proceed to step 5 if payment initiation failed
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleConfirmWhatsApp = () => {
    const paymentMethodName = paymentMethodsList
      .flatMap(g => g.items)
      .find(p => p.id === paymentMethod)?.name || 'Midtrans';

    const paymentTypeLabel = paymentType === 'full'
      ? t('booking:whatsapp.fullPayment')
      : t('booking:whatsapp.dpPayment');

    const message = encodeURIComponent(
      t('booking:whatsapp.studioMessage', {
        code: bookingCode,
        package: packageDisplayName,
        duration,
        hours: t('common:time.hours'),
        date: selectedDate ? formatDate(selectedDate, 'd MMMM yyyy', i18n.language) : '',
        time: selectedTime,
        name: formData.name,
        guests: formData.guests,
        people: t('common:labels.people'),
        purpose: purposeLabel(formData.purpose),
        paymentMethod: paymentMethodName,
        paymentType: paymentTypeLabel,
        total: formatCurrency(totalPrice, i18n.language),
        paid: formatCurrency(paymentAmount, i18n.language),
      })
    );
    window.open(`https://wa.me/6289531511894?text=${message}`, '_blank');
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setDuration('1');
    setSelectedDate(undefined);
    setSelectedTime('');
    setFormData({ name: profile?.full_name || '', whatsapp: profile?.whatsapp || '', email: profile?.email || '', guests: '1', purpose: '', notes: '' });
    setPaymentMethod('');
    setBookingCode('');
    onClose();
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
    if (!user) {
      onClose();
    }
  };

  const steps = [
    { num: 1, label: t('booking:steps.schedule'), icon: CalendarDays },
    { num: 2, label: t('booking:steps.package'), icon: Package },
    { num: 3, label: t('booking:steps.data'), icon: User },
    { num: 4, label: t('booking:steps.payment'), icon: Wallet },
    { num: 5, label: t('booking:steps.confirm'), icon: Check },
  ];

  // If not logged in, show auth modal
  if (!user) {
    return (
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  // Common Summary Component for Steps 2, 3, 4
  const OrderSummary = ({ className = '' }: { className?: string }) => (
    <div className={`space-y-4 p-5 bg-[#849283]/5 rounded-xl border border-[#849283]/10 h-fit ${className}`}>
      <h4 className="font-display font-medium text-lg flex items-center gap-2 text-[#849283]">
        <Package className="w-4 h-4" />
        {t('booking:summary.title')}
      </h4>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between py-2 border-b border-dashed border-[#849283]/20">
          <span className="text-muted-foreground">{t('booking:summary.package')}</span>
          <span className="font-medium">{packageDisplayName}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-dashed border-[#849283]/20">
          <span className="text-muted-foreground">{t('booking:summary.duration')}</span>
          <span className="font-medium">{duration} {t('common:time.hours')}</span>
        </div>
        {selectedDate && (
          <div className="flex justify-between py-2 border-b border-dashed border-[#849283]/20">
            <span className="text-muted-foreground">{t('booking:summary.date')}</span>
            <span className="font-medium">{formatDate(selectedDate, 'dd/MM/yyyy', i18n.language)}</span>
          </div>
        )}
        {selectedTime && (
          <div className="flex justify-between py-2 border-b border-dashed border-[#849283]/20">
            <span className="text-muted-foreground">{t('booking:summary.time')}</span>
            <span className="font-medium">{selectedTime} WITA</span>
          </div>
        )}

        {step >= 4 && (
          <div className="flex justify-between py-2 border-b border-dashed border-[#849283]/20">
            <span className="text-muted-foreground">{paymentType === 'full' ? t('booking:payment.full') : t('booking:payment.dp')}</span>
            <span className="font-medium text-[#849283]">{formatCurrency(paymentAmount, i18n.language)}</span>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <span className="text-muted-foreground">{t('booking:summary.estimatedTotal')}</span>
          <span className="font-bold text-lg text-[#849283]">{formatCurrency(totalPrice, i18n.language)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PendingBookingModal
        booking={pendingBooking}
        isOpen={!!pendingBooking}
        onCancel={async () => {
          const success = await cancelBooking(pendingBooking.id);
          if (success) {
            setPendingBooking(null);
          }
        }}
        onResume={() => resumePayment(pendingBooking)}
        isProcessing={isPaymentProcessing}
      />
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-y-auto w-[95vw] p-0 gap-0 rounded-2xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 text-[#B0B0B0] hover:text-gray-600 transition-colors z-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="p-6 border-b sticky top-0 bg-white z-20 flex flex-col gap-6">
            <DialogHeader className="p-0">
              <DialogTitle className="font-display text-2xl">
                {t('booking:modal.bookingTitle', { name: packageDisplayName })}
              </DialogTitle>
            </DialogHeader>

            {/* Stepper UI */}
            <div className="w-full px-6 md:px-12 py-6">
              <div className="flex items-start justify-between relative">
                {steps.map((s, index) => {
                  const isCompleted = step > s.num;
                  const isActive = step === s.num;
                  const isLast = index === steps.length - 1;
                  const Icon = s.icon;

                  return (
                    <div key={s.num} className={`flex items-center ${isLast ? 'flex-none' : 'flex-1'}`}>
                      {/* Step Node */}
                      <div className="relative flex flex-col items-center z-10 min-w-[3rem]">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 border-2 
                                ${isActive
                              ? 'bg-[#849283] border-[#849283] text-white shadow-lg scale-110'
                              : isCompleted
                                ? 'bg-[#849283] border-[#849283] text-white'
                                : 'bg-white border-muted-foreground/20 text-muted-foreground'
                            }`}
                        >
                          {isCompleted ? <Check className="w-5 h-5" /> : <span>{s.num}</span>}
                        </div>
                        <span
                          className={`absolute -bottom-7 text-[10px] sm:text-xs font-medium whitespace-nowrap transition-colors duration-300
                                ${isActive ? 'text-[#849283] translate-y-0' : isCompleted ? 'text-[#849283]' : 'text-muted-foreground'}`}
                        >
                          {s.label}
                        </span>
                      </div>

                      {/* Connector Line */}
                      {!isLast && (
                        <div className="flex-1 mx-2 sm:mx-4 flex items-center relative h-10">
                          <div className="w-full h-[1px] bg-border/50 absolute top-1/2 left-0 -translate-y-1/2 z-0"></div>
                          <div
                            className="h-[1px] bg-[#849283] absolute top-1/2 left-0 -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
                            style={{ width: isCompleted ? '100%' : '0%' }}
                          ></div>
                          {/* Arrow Head */}
                          <div
                            className={`absolute right-0 top-1/2 -translate-y-1/2 transition-colors duration-300 bg-white pl-1
                                    ${isCompleted ? 'text-[#849283]' : 'text-muted-foreground/30'}`}
                          >
                            <div className="w-2 h-2 border-t-2 border-r-2 border-current transform rotate-45"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 min-h-[400px]">
            {/* Step 1: Schedule */}
            {step === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="w-5 h-5 text-[#849283]" />
                    <Label className="text-base font-medium">{t('booking:modal.selectDate')}</Label>
                  </div>
                  <div className="flex justify-center lg:justify-start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={i18n.language === 'en' ? undefined : id}
                      fromDate={new Date()}
                      toDate={new Date(new Date().setMonth(new Date().getMonth() + 2))}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const maxDate = new Date();
                        maxDate.setMonth(maxDate.getMonth() + 2);
                        return date < today || date > maxDate;
                      }}
                      className="rounded-lg border bg-card text-card-foreground shadow-sm w-fit"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-[#849283]" />
                    <Label className="text-base font-medium">{t('booking:modal.selectTime')}</Label>
                  </div>
                  {selectedDate ? (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 p-1">
                        {timeSlots.map((time) => {
                          const isPast = (() => {
                            if (!selectedDate) return false;

                            // Get current time in WITA (UTC+8)
                            const nowWita = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Makassar' }));
                            const todayWita = new Date(nowWita);
                            todayWita.setHours(0, 0, 0, 0);

                            // Compare selected date with today in WITA
                            // We compare the dates (day, month, year)
                            const isToday = selectedDate.getDate() === nowWita.getDate() &&
                              selectedDate.getMonth() === nowWita.getMonth() &&
                              selectedDate.getFullYear() === nowWita.getFullYear();

                            if (isToday) {
                              const [hours, minutes] = time.split(':').map(Number);
                              const slotTime = new Date(todayWita);
                              slotTime.setHours(hours, minutes, 0, 0);
                              return slotTime < nowWita;
                            }

                            // If selected date is before today (in WITA), it's past
                            return selectedDate < todayWita;
                          })();

                          // Check if slot is already booked
                          const isBooked = bookedSlots.includes(time);
                          const isDisabled = isPast || isBooked;

                          return (
                            <button
                              key={time}
                              disabled={isDisabled}
                              onClick={() => !isDisabled && setSelectedTime(time)}
                              className={`py-3 px-2 rounded-xl text-sm border font-medium transition-all duration-200 
                                    ${selectedTime === time
                                  ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2'
                                  : 'hover:border-primary/50 hover:bg-primary/5 bg-white'
                                }
                                    ${isDisabled ? 'opacity-50 cursor-not-allowed bg-slate-50 text-muted-foreground border-slate-100' : ''}
                              `}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-lg text-sm text-muted-foreground flex gap-3 items-start border border-border/50">
                        <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground mb-1">{t('booking:time.infoTitle')}</p>
                          <p>{t('booking:time.infoDescription')}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl p-8 bg-secondary/20">
                      <CalendarDays className="w-10 h-10 mb-2 opacity-50" />
                      <p>{t('booking:time.selectDateFirst')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Package & Duration */}
            {step === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium mb-4 block">{t('booking:package.details')}</Label>
                    <div className="p-6 bg-gradient-to-br from-white to-secondary/30 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Package className="w-32 h-32" />
                      </div>
                      <h3 className="font-display text-2xl font-medium mb-2 relative z-10">{packageDisplayName}</h3>
                      <div className="space-y-2 relative z-10 text-muted-foreground mb-6">
                        <p className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#849283]" />
                          {selectedPackage?.priceDisplay} {t('booking:package.perHour')}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#849283]" />
                          {t('booking:package.capacity', { count: selectedPackage?.capacity })}
                        </p>
                      </div>

                      <div className="space-y-3 relative z-10">
                        <Label>{t('booking:package.selectDuration')}</Label>
                        <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger className="bg-white h-12">
                            <SelectValue placeholder={t('booking:package.selectDuration')} />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((h) => (
                              <SelectItem key={h} value={h.toString()}>
                                {h} {t('common:time.hours')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <OrderSummary />
                </div>
              </div>
            )}

            {/* Step 3: Data */}
            {step === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-5 h-5 text-[#849283]" />
                    <Label className="text-base font-medium">{t('booking:data.title')}</Label>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('common:labels.fullName')} <span className="text-red-500">*</span></Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={t('auth:fields.fullNamePlaceholder')}
                          className="bg-white h-11"
                        />
                        {!formData.name && <p className="text-[10px] text-red-500">{t('common:validation.required')}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">{t('common:labels.whatsapp')} <span className="text-red-500">*</span></Label>
                        <Input
                          id="whatsapp"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                          placeholder={t('auth:fields.whatsappPlaceholder')}
                          className="bg-white h-11"
                        />
                        {!formData.whatsapp && <p className="text-[10px] text-red-500">{t('common:validation.required')}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t('common:labels.email')} <span className="text-red-500">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t('auth:fields.emailPlaceholder')}
                        className="bg-white h-11"
                      />
                      {!formData.email && <p className="text-[10px] text-red-500">{t('common:validation.required')}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="guests">{t('booking:data.guestCount')} <span className="text-red-500">*</span></Label>
                        <Input
                          id="guests"
                          type="number"
                          min="1"
                          max={selectedPackage?.capacity}
                          value={formData.guests}
                          onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                          className="bg-white h-11"
                        />
                        {!formData.guests && <p className="text-[10px] text-red-500">{t('common:validation.required')}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>{t('booking:data.purpose')} <span className="text-red-500">*</span></Label>
                        <Select value={formData.purpose} onValueChange={(v) => setFormData({ ...formData, purpose: v })}>
                          <SelectTrigger className="bg-white h-11">
                            <SelectValue placeholder={t('booking:data.selectCategory')} />
                          </SelectTrigger>
                          <SelectContent>
                            {purposeOptions.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                {t(`booking:data.purposes.${p.labelKey}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!formData.purpose && <p className="text-[10px] text-red-500">{t('common:validation.required')}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">{t('booking:summary.notes')}</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder={t('booking:summary.notesPlaceholder')}
                        rows={3}
                        className="bg-white resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <OrderSummary />
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {step === 4 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-8">

                  {/* Payment Type Selection */}
                  <div>
                    <Label className="text-base font-medium mb-4 flex items-center gap-2">
                      <div className="bg-[#849283] text-white p-1 rounded-md">
                        <CreditCard className="w-3 h-3" />
                      </div>
                      {t('booking:payment.options')}
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        onClick={() => setPaymentType('full')}
                        className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col gap-2 relative overflow-hidden
                            ${paymentType === 'full'
                            ? 'border-[#849283] bg-[#849283]/5 ring-1 ring-[#849283]'
                            : 'border-border hover:border-[#849283]/30 bg-white'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{t('booking:payment.full')}</span>
                          {paymentType === 'full' && <div className="w-4 h-4 rounded-full bg-[#849283] flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                        </div>
                        <p className="text-xs text-muted-foreground">{t('booking:payment.fullDesc')}</p>
                      </div>

                      <div
                        onClick={() => setPaymentType('dp')}
                        className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col gap-2 relative overflow-hidden
                            ${paymentType === 'dp'
                            ? 'border-[#849283] bg-[#849283]/5 ring-1 ring-[#849283]'
                            : 'border-border hover:border-[#849283]/30 bg-white'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{t('booking:payment.dp')}</span>
                          {paymentType === 'dp' && <div className="w-4 h-4 rounded-full bg-[#849283] flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                        </div>
                        <p className="text-xs text-muted-foreground">{t('booking:payment.dpDesc')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods - REMOVED for Midtrans Snap Integration */}
                  {/* Midtrans Snap handles payment method selection automatically */}
                  <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
                    {t('booking:payment.methodNotice')}
                  </div>

                </div>

                <div className="flex flex-col">
                  <div className="space-y-6 p-6 bg-gradient-to-br from-[#849283]/10 to-transparent rounded-2xl border border-[#849283]/20 sticky top-4">
                    <h3 className="font-display font-medium text-xl text-[#849283]">{t('booking:payment.breakdown')}</h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{t('booking:payment.totalBooking')}</span>
                        <span className="font-medium text-foreground">{formatCurrency(totalPrice, i18n.language)}</span>
                      </div>

                      <div className="w-full h-px bg-border/50 border-t border-dashed"></div>

                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-lg">
                            {paymentType === 'full' ? t('booking:payment.fullPaid') : t('booking:payment.dpPaid')}
                          </p>
                          <p className="text-xs text-stone-500">
                            {paymentType === 'full' ? t('booking:payment.fullPaidDesc') : t('booking:payment.dpPaidDesc')}
                          </p>
                        </div>
                        <span className="font-display text-3xl font-bold text-[#849283]">
                          {formatCurrency(paymentAmount, i18n.language)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm pt-2">
                        <span className="text-muted-foreground">{t('booking:payment.remainingPayment')}</span>
                        <span className="font-medium text-foreground">
                          {paymentType === 'full' ? formatCurrency(0, i18n.language) : formatCurrency(totalPrice - paymentAmount, i18n.language)}
                        </span>
                      </div>

                      {paymentType === 'dp' && (
                        <div className="text-xs text-[#849283] bg-[#849283]/5 p-2 rounded-lg border border-[#849283]/10 flex gap-2">
                          <div className="w-1 bg-[#849283] rounded-full shrink-0"></div>
                          <p>{t('booking:payment.dpStudioNote')}</p>
                        </div>
                      )}

                      {/* Terms & Conditions */}
                      <div className="pt-4 mt-4 border-t border-border/50">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center h-5 mt-0.5">
                            <input
                              id="terms"
                              type="checkbox"
                              checked={isTermsAccepted}
                              onChange={(e) => setIsTermsAccepted(e.target.checked)}
                              className="w-4 h-4 text-[#849283] border-gray-300 rounded focus:ring-[#849283]"
                            />
                          </div>
                          <div className="text-sm">
                            <label htmlFor="terms" className="font-medium text-foreground cursor-pointer select-none">
                              {t('booking:payment.termsAgree')} <button type="button" onClick={() => setShowTermsModal(true)} className="text-[#849283] underline hover:text-[#6b7a6a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#849283]/20 rounded px-0.5">{t('booking:payment.termsLink')}</button>
                            </label>
                            <p className="text-muted-foreground text-xs mt-1">
                              {t('booking:payment.termsNote')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {step === 5 && (
              <div className="max-w-xl mx-auto space-y-8 text-center animate-in fade-in zoom-in-95 duration-500 py-8">
                <div className="w-24 h-24 bg-[#849283]/10 rounded-full flex items-center justify-center mx-auto ring-8 ring-[#849283]/5 relative">
                  <div className="absolute inset-0 rounded-full bg-[#849283]/20 animate-ping"></div>
                  <Check className="w-12 h-12 text-[#849283] relative z-10" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold mb-2">{t('booking:confirmation.success')}</h2>
                  <p className="text-muted-foreground">{t('booking:confirmation.successSubtitle')}</p>
                </div>

                <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#849283]"></div>
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest font-medium">{t('booking:confirmation.bookingCode')}</p>
                  <p className="font-display text-4xl font-bold text-foreground tracking-tight mb-6">{bookingCode}</p>

                  <div className="grid grid-cols-2 gap-4 text-left border-t border-dashed pt-4">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">{t('booking:confirmation.packageAndDuration')}</p>
                      <p className="font-medium text-sm">{packageDisplayName} • {duration} {t('common:time.hours')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">{t('booking:confirmation.sessionTime')}</p>
                      <p className="font-medium text-sm">{selectedDate ? formatDate(selectedDate, 'dd/MM/yyyy', i18n.language) : ''}, {selectedTime}</p>
                    </div>
                  </div>
                </div>

                <Button variant="hero" className="w-full h-14 text-base shadow-lg hover:shadow-xl hover:shadow-[#849283]/20 transition-all rounded-xl" onClick={handleConfirmWhatsApp}>
                  <MessageCircle className="mr-2 w-5 h-5" />
                  {t('booking:confirmation.confirmWhatsapp')}
                </Button>
                <button onClick={handleClose} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('booking:confirmation.backHome')}
                </button>
              </div>
            )}

          </div>

          {/* Footer Navigation */}
          {step < 5 && (
            <div className="p-6 border-t bg-white sticky bottom-0 z-20 flex justify-between gap-4">
              {step > 1 ? (
                <Button variant="outline" onClick={handleBack} className="h-12 px-6 border-border/60 hover:bg-secondary/50 hover:text-foreground/70 rounded-xl">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  {t('common:buttons.back')}
                </Button>
              ) : (
                <div></div> // Spacer
              )}

              <Button
                variant="sage"
                onClick={handleNext}
                disabled={
                  (step === 1 && (!selectedDate || !selectedTime)) ||
                  (step === 2 && !duration) ||
                  (step === 3 && (!formData.name || !formData.whatsapp || !formData.email || !formData.purpose || !formData.guests)) ||
                  (step === 4 && (!isTermsAccepted || isProcessing))
                }
                className="h-12 px-8 shadow-md hover:shadow-lg transition-all rounded-xl min-w-[140px]"
              >
                {step === 4 ? (isProcessing ? t('booking:summary.processing') : t('booking:payment.payNow')) : t('common:buttons.continue')}
                {!isProcessing && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
            </div>
          )}

        </DialogContent >
      </Dialog >
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </>
  );
};

