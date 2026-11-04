import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslation } from 'react-i18next';

const faqs = [
  {
    question: 'Apakah harga sudah termasuk fotografer?',
    answer: 'Ya, semua paket sudah termasuk fotografer profesional Morain. Anda tidak perlu membawa fotografer sendiri.',
  },
  {
    question: 'Bisakah membawa fotografer sendiri?',
    answer: 'Tidak, karena setiap sesi sudah termasuk jasa fotografer internal Morain untuk memastikan kualitas hasil foto yang konsisten.',
  },
  {
    question: 'Apakah boleh membawa properti sendiri?',
    answer: 'Ya, selama aman dan tidak merusak fasilitas studio. Silakan koordinasikan terlebih dahulu jika membawa properti besar.',
  },
  {
    question: 'Berapa jumlah maksimum orang per ruangan?',
    answer: 'Studio Small: max 5 orang, Studio Medium: max 15 orang, Studio Large: max 30 orang. Untuk Photobox max 5 orang.',
  },
  {
    question: 'Apakah bisa reschedule?',
    answer: 'Bisa, reschedule dapat dilakukan hingga H-1 tergantung ketersediaan jadwal. Silakan hubungi kami via WhatsApp.',
  },
  {
    question: 'Bagaimana kebijakan refund?',
    answer: 'Pembatalan akan menerima refund sebagian sesuai terms & conditions. Pembatalan H-1 mendapat refund 50% dari DP.',
  },
  {
    question: 'Metode pembayaran apa saja yang tersedia?',
    answer: 'Kami menerima pembayaran via BCA, BNI, QRIS, Dana, dan GoPay. DP minimal 50% untuk mengamankan slot booking.',
  },
  {
    question: 'Apakah hasil photobox bisa dicetak?',
    answer: 'Bisa! Tersedia pilihan photo strip dan 4R print. Anda juga mendapat digital file dan QR download untuk akses instan.',
  },
  {
    question: 'Berapa lama waktu per sesi photobox?',
    answer: 'Setiap sesi photobox adalah 15 menit, termasuk waktu persiapan dan pengambilan foto.',
  },
  {
    question: 'Apakah ada biaya tambahan selain yang tertera?',
    answer: 'Tidak ada biaya tersembunyi. Harga yang tertera sudah all-in termasuk fotografer, lighting, dan fasilitas studio.',
  },
];

export const FAQSection = () => {
  const { t } = useTranslation(['landing']);
  
  return (
    <section id="faq" className="section-padding">
      <div className="container-wide">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            {t('faq.sectionTag')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold mt-3 mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('faq.description')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-soft transition-shadow"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="font-medium pr-4">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
