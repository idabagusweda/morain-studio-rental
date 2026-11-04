import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CreditCard, AlertTriangle, ShieldCheck, ChevronDown, Check } from 'lucide-react';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TermsModal = ({ isOpen, onClose }: TermsModalProps) => {
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
                        Terms & Conditions
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
                            Mohon scroll ke bawah untuk membaca seluruh syarat dan ketentuan sebelum melanjutkan.
                        </p>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
                                <div className="p-1.5 bg-[#849283]/10 rounded-lg text-[#849283]">
                                    <Clock className="w-4 h-4" />
                                </div>
                                1. Booking & Jadwal
                            </h3>
                            <ul className="list-disc pl-11 space-y-2 text-muted-foreground marker:text-[#849283]">
                                <li>Booking wajib dilakukan minimal <strong>H-1</strong> sebelum sesi pemotretan.</li>
                                <li>Reschedule jadwal diperbolehkan maksimal <strong>1 (satu) kali</strong> dengan pemberitahuan minimal 24 jam sebelum sesi dimulai.</li>
                                <li>Diharapkan hadir <strong>15 menit sebelum</strong> jadwal sesi dimulai untuk persiapan makeup dan fitting.</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
                                <div className="p-1.5 bg-[#849283]/10 rounded-lg text-[#849283]">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                2. Kebijakan DP & Pembayaran
                            </h3>
                            <ul className="list-disc pl-11 space-y-2 text-muted-foreground marker:text-[#849283]">
                                <li>Wajib melakukan <strong>DP (Down Payment) sebesar 50%</strong> untuk mengamankan slot jadwal.</li>
                                <li>Pelunasan sisa pembayaran wajib dilakukan di studio <strong>setelah sesi foto selesai</strong>.</li>
                                <li>Kami menerima pembayaran via Transfer Bank (BCA/BNI), E-Wallet (Dana/GoPay), dan QRIS.</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
                                <div className="p-1.5 bg-[#849283]/10 rounded-lg text-[#849283]">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                                3. Pembatalan & Keterlambatan
                            </h3>
                            <ul className="list-disc pl-11 space-y-2 text-muted-foreground marker:text-[#849283]">
                                <li>DP (Down Payment) <span className="text-red-500 font-medium bg-red-50 px-1 rounded">tidak dapat dikembalikan (non-refundable)</span> jika terjadi pembatalan sepihak dari klien.</li>
                                <li>Toleransi keterlambatan maksimal <strong>15 menit</strong>. Jika lebih dari itu, durasi sesi foto akan dipotong sesuai sisa waktu agar tidak mengganggu jadwal klien berikutnya.</li>
                                <li>Jika tidak ada kabar (No-Show) melebihi 30 menit, booking dianggap hangus.</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
                                <div className="p-1.5 bg-[#849283]/10 rounded-lg text-[#849283]">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                4. Tanggung Jawab & Properti
                            </h3>
                            <ul className="list-disc pl-11 space-y-2 text-muted-foreground marker:text-[#849283]">
                                <li>Klien bertanggung jawab penuh atas kerusakan atau kehilangan properti studio yang disebabkan oleh kelalaian klien.</li>
                                <li>Morain Studio tidak bertanggung jawab atas kehilangan barang pribadi klien di area studio.</li>
                                <li>File foto original (softcopy) akan disimpan di database kami selama maksimal <strong>1 bulan</strong>. Harap segera diunduh karena kami tidak bertanggung jawab setelah periode tersebut.</li>
                            </ul>
                        </div>

                        {/* Spacing at bottom to ensure scroll triggers */}
                        <div className="h-4"></div>
                        <p className="text-center text-xs text-muted-foreground pt-4 border-t">
                            -- Akhir dari Syarat & Ketentuan --
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-4 border-t bg-white shrink-0 flex flex-col gap-2 sm:flex-row sm:justify-between items-center relative">

                    <div className="text-xs text-muted-foreground order-2 sm:order-1">
                        {hasRead ? (
                            <span className="text-[#849283] flex items-center gap-1 font-medium">
                                <Check className="w-3 h-3" /> Sudah dibaca seluruhnya
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 opacity-70">
                                <ChevronDown className="w-3 h-3 animate-bounce" /> Scroll ke bawah
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
                        Saya Mengerti
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
