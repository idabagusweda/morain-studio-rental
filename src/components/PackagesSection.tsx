import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Square, Check, Sparkles } from 'lucide-react';
import { BookingModal } from './BookingModal';

const facilities = [
  '2-3 lighting softbox',
  'Pilihan background beragam',
  'Stool / kursi estetik',
  'Cermin standing full body',
  'Ruangan ber-AC dingin',
  'Stop kontak tersedia',
  'Termasuk fotografer profesional',
];

const packages = [
  {
    id: 'basic',
    name: 'Paket Foto Studio – Basic',
    price: 150000,
    priceDisplay: 'Rp 150.000',
    unit: '/ jam',
    capacity: 5,
    size: '3×4 m',
    description: 'Cocok untuk foto personal, couple, atau produk kecil dengan hasil maksimal.',
    popular: false,
  },
  {
    id: 'standard',
    name: 'Paket Foto Studio – Standard',
    price: 250000,
    priceDisplay: 'Rp 250.000',
    unit: '/ jam',
    capacity: 15,
    size: '4×6 m',
    description: 'Pilihan tepat untuk keluarga kecil, potret grup, dan konten kreator.',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Paket Foto Studio – Premium',
    price: 400000,
    priceDisplay: 'Rp 400.000',
    unit: '/ jam',
    capacity: 30,
    size: '6×8 m',
    description: 'Solusi terbaik untuk grup besar, event kantor, dan sesi foto profesional.',
    popular: false,
  },
];

export const PackagesSection = () => {
  const [selectedPackage, setSelectedPackage] = useState<typeof packages[0] | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleBookNow = (pkg: typeof packages[0]) => {
    setSelectedPackage(pkg);
    setIsBookingOpen(true);
  };

  return (
    <section id="packages" className="section-padding">
      <div className="container-wide">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Our Packages
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold mt-3 mb-4">
            Studio Photo Package
          </h2>
          <p className="text-muted-foreground text-lg">
            Pilih paket studio sesuai kebutuhan Anda. Semua paket sudah termasuk fotografer profesional.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`fade-in-section relative p-8 rounded-2xl border-2 transition-all duration-300 hover-lift transform hover:-translate-y-1 ${pkg.popular
                ? 'border-primary bg-card shadow-medium'
                : 'border-border bg-card hover:border-primary/50'
                }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Paling Laris
                </span>
              )}

              <h3 className="font-display text-xl font-semibold mb-2 min-h-[56px] flex items-center">
                {pkg.name}
              </h3>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-display text-4xl font-bold text-primary">
                  {pkg.priceDisplay}
                </span>
                <span className="text-muted-foreground">{pkg.unit}</span>
              </div>

              <p className="text-muted-foreground mb-6 text-sm">
                {pkg.description}
              </p>

              <div className="flex items-center gap-4 mb-6 py-4 border-y border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Max {pkg.capacity} org</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Square className="w-4 h-4 text-primary" />
                  <span>{pkg.size}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {facilities.map((facility) => (
                  <li key={facility} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{facility}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={pkg.popular ? 'hero' : 'outline'}
                className="w-full"
                onClick={() => handleBookNow(pkg)}
              >
                Pesan {pkg.name.split(' – ')[1]}
              </Button>
            </div>
          ))}
        </div>

        {/* Facilities note */}
        <p className="text-center text-sm text-muted-foreground">
          Semua fasilitas sudah termasuk dalam setiap paket. Properti tambahan dapat dibawa sendiri.
        </p>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedPackage={selectedPackage}
      />
    </section>
  );
};
