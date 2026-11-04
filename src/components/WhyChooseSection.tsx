import { Calendar, Clock, Camera, MapPin, CreditCard, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const features = [
  {
    icon: Calendar,
    title: 'Pemesanan Online Mudah',
    description: 'Pesan sesi foto dalam hitungan menit dengan sistem pemesanan yang sederhana.',
  },
  {
    icon: Clock,
    title: 'Kalender Real-time',
    description: 'Lihat jadwal yang tersedia secara instan dan amankan waktu pilihan Anda.',
  },
  {
    icon: Camera,
    title: 'Minimalis & Estetik',
    description: 'Desain studio yang bersih dan cocok untuk segala jenis pemotretan.',
  },
  {
    icon: MapPin,
    title: 'Lokasi Strategis',
    description: 'Mudah ditemukan di Jalan Teuku Umar, pusat kota Denpasar.',
  },
  {
    icon: CreditCard,
    title: 'Harga Transparan',
    description: 'Tidak ada biaya tersembunyi. Semua harga sudah termasuk fotografer.',
  },
  {
    icon: Sparkles,
    title: 'Photobox Menyenangkan',
    description: 'Sesi foto yang cepat & menyenangkan dengan hasil digital + cetak instan.',
  },
];

export const WhyChooseSection = () => {
  const { t } = useTranslation(['landing']);
  
  return (
    <section className="section-padding bg-secondary/50">
      <div className="container-wide">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            {t('whyChoose.sectionTag')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold mt-3 mb-4">
            {t('whyChoose.title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('whyChoose.description')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="fade-in-section group p-8 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-medium transition-all duration-500"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
