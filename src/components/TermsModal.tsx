import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CreditCard, AlertTriangle, ShieldCheck, ChevronDown, Check } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TermsModal = ({ isOpen, onClose }: TermsModalProps) => {
    const { t } = useTranslation(['booking']);
    const [hasRead, setHasRead] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setHasRead(false);
            // Optional: reset scroll position
            if (scrollRef.current) {
                scrollRef.current.scrollTop = 0;
            }
        }
    }, [isOpen]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // Check if user has scrolled near the bottom (within 20px threshold)
        if (scrollHeight - scrollTop <= clientHeight + 20) {
            setHasRead(true);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] h-[600px] p-0 flex flex-col gap-0 rounded-2xl overflow-hidden bg-white">
                <DialogHeader className="p-6 pb-4 border-b bg-white z-10 shrink-0">
                    <DialogTitle className="font-display text-2xl flex items-center gap-2 text-foreground">
                        <FileText className="w-6 h-6 text-[#849283]" />
                        {t('booking:termsModal.title')}
                    </DialogTitle>
                </DialogHeader>

                {/* Scrollable Content Area */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-6 scroll-smooth"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#849283 #f1f1f1'
                    }}
                >
                    <div className="space-y-6 text-sm text-foreground/80 leading-relaxed pb-4">
                        <p className="text-muted-foreground border-l-4 border-[#849283]/20 pl-4 py-1 italic bg-[#849283]/5 rounded-r">
                            {t('booking:termsModal.notice')}
                        </p>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
                                <div className="p-1.5 bg-[#849283]/10 rounded-lg text-[#849283]">
                                    <Clock className="w-4 h-4" />
                                </div>
                                {t('booking:termsModal.section1Title')}
                            </h3>
                            <ul className="list-disc pl-11 space-y-2 text-muted-foreground marker:text-[#849283]">
                                <li><Trans i18nKey="booking:termsModal.sec1Item1">Booking wajib dilakukan minimal <strong>H-1</strong> sebelum sesi pemotretan.</Trans></li>
                                <li><Trans i18nKey="booking:termsModal.sec1Item2">Reschedule jadwal diperbolehkan maksimal <strong>1 (satu) kali</strong> dengan pemberitahuan minimal 24 jam sebelum sesi dimulai.</Trans></li>
                                <li><Trans i18nKey="booking:termsModal.sec1Item3">Diharapkan hadir <strong>15 menit sebelum</strong> jadwal sesi dimulai untuk persiapan makeup dan fitting.</Trans></li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
                                <div className="p-1.5 bg-[#849283]/10 rounded-lg text-[#849283]">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                {t('booking:termsModal.section2Title')}
                            </h3>
                            <ul className="list-disc pl-11 space-y-2 text-muted-foreground marker:text-[#849283]">
                                <li><Trans i18nKey="booking:termsModal.sec2Item1">Wajib melakukan <strong>DP (Down Payment) sebesar 50%</strong> untuk mengamankan slot jadwal.</Trans></li>
                                <li><Trans i18nKey="booking:termsModal.sec2Item2">Pelunasan sisa pembayaran wajib dilakukan di studio <strong>setelah sesi foto selesai</strong>.</Trans></li>
                                <li>{t('booking:termsModal.sec2Item3')}</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
                                <div className="p-1.5 bg-[#849283]/10 rounded-lg text-[#849283]">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                                {t('booking:termsModal.section3Title')}
                            </h3>
                            <ul className="list-disc pl-11 space-y-2 text-muted-foreground marker:text-[#849283]">
                                <li><Trans i18nKey="booking:termsModal.sec3Item1">DP (Down Payment) <span className="text-red-500 font-medium bg-red-50 px-1 rounded">tidak dapat dikembalikan (non-refundable)</span> jika terjadi pembatalan sepihak dari klien.</Trans></li>
                                <li><Trans i18nKey="booking:termsModal.sec3Item2">Toleransi keterlambatan maksimal <strong>15 menit</strong>. Jika lebih dari itu, durasi sesi foto akan dipotong sesuai sisa waktu agar tidak mengganggu jadwal klien berikutnya.</Trans></li>
                                <li>{t('booking:termsModal.sec3Item3')}</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
                                <div className="p-1.5 bg-[#849283]/10 rounded-lg text-[#849283]">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                {t('booking:termsModal.section4Title')}
                            </h3>
                            <ul className="list-disc pl-11 space-y-2 text-muted-foreground marker:text-[#849283]">
                                <li>{t('booking:termsModal.sec4Item1')}</li>
                                <li>{t('booking:termsModal.sec4Item2')}</li>
                                <li><Trans i18nKey="booking:termsModal.sec4Item3">File foto original (softcopy) akan disimpan di database kami selama maksimal <strong>1 bulan</strong>. Harap segera diunduh karena kami tidak bertanggung jawab setelah periode tersebut.</Trans></li>
                            </ul>
                        </div>

                        {/* Spacing at bottom to ensure scroll triggers */}
                        <div className="h-4"></div>
                        <p className="text-center text-xs text-muted-foreground pt-4 border-t">
                            {t('booking:termsModal.endOfTerms')}
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-4 border-t bg-white shrink-0 flex flex-col gap-2 sm:flex-row sm:justify-between items-center relative">

                    <div className="text-xs text-muted-foreground order-2 sm:order-1">
                        {hasRead ? (
                            <span className="text-[#849283] flex items-center gap-1 font-medium">
                                <Check className="w-3 h-3" /> {t('booking:termsModal.readAll')}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 opacity-70">
                                <ChevronDown className="w-3 h-3 animate-bounce" /> {t('booking:termsModal.scrollDown')}
                            </span>
                        )}
                    </div>
                    <Button
                        onClick={onClose}
                        disabled={!hasRead}
                        className={`w-full sm:w-auto transition-all duration-300 order-1 sm:order-2
                            ${hasRead
                                ? 'bg-[#849283] hover:bg-[#6b7a6a] text-white shadow-md'
                                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'}`}
                    >
                        {t('booking:termsModal.iUnderstand')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
