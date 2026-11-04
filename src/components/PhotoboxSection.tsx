import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Users, Clock, Zap, Download, Printer, QrCode, Smile, Calendar, CreditCard, Camera, Check } from 'lucide-react';
import { PhotoboxBookingModal } from './PhotoboxBookingModal';

const photoboxStyles = [
  {
    id: 'cowboy',
    name: 'Cowboy',
    description: 'Nuansa western yang maskulin dan petualang dengan properti topi & laras.',
    color: 'bg-gradient-to-r from-amber-700/20 via-orange-800/20 to-amber-700/20 animate-gradient-x',
  },
  {
    id: 'retro-film',
    name: 'Retro Film',
    description: 'Estetika klasik analog dengan tone hangat dan nostalgik.',
    color: 'bg-gradient-to-r from-orange-400/20 via-amber-200/20 to-orange-400/20 animate-gradient-x',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Futuristik dengan lampu neon dan nuansa digital modern.',
    color: 'bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 animate-gradient-x',
  },
  {
    id: 'cute-pastel',
    name: 'Cute Pastel',
    description: 'Warna-warni lembut yang manis dan ceria untuk hasil foto cute.',
    color: 'bg-gradient-to-r from-pink-200/30 via-blue-200/30 to-pink-200/30 animate-gradient-x',
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Tampilan bersih dan modern yang fokus pada subjek foto.',
    color: 'bg-secondary/50',
  },
];

const outputs = [
  { icon: Download, text: 'File digital instan (Google Drive)' },
  { icon: Printer, text: 'Cetak foto strip / 4R' },
  { icon: Sparkles, text: 'Template frame custom' },
  { icon: QrCode, text: 'Akses download QR Code' },
  { icon: Clock, text: 'Durasi 15 Menit' },
  { icon: Users, text: 'Maksimal 5 orang' },
];

export const PhotoboxSection = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('');

  const handleBookNow = () => {
    setIsBookingOpen(true);
  };

  return (
    <section id="photobox" className="section-padding bg-secondary/30">
      <div className="container-wide">

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* 1. Intro (Left Top) */}
          <div className="fade-in-section space-y-4">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Fast Booking
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold">
              Photobox Experience
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Foto seru, cepat, dan terjangkau. Cocok untuk teman, pasangan, atau foto sendiri dengan hasil instan.
            </p>
          </div>

          {/* 2. Package Card (Right - Narrower & Centered) */}
          <div className="fade-in-section w-full lg:max-w-md lg:mx-auto lg:row-span-2">
            <div className="relative p-8 rounded-2xl border-2 border-primary bg-card shadow-medium hover-lift flex flex-col h-fit">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Fun & Quick
              </span>

              <h3 className="font-display text-xl font-semibold mb-2 mt-4 text-left w-full pl-2">
                Paket Photobox
              </h3>

              <div className="flex items-baseline justify-start gap-1 mb-4 pl-2">
                <span className="font-display text-4xl font-bold text-primary">
                  Rp 30.000
                </span>
                <span className="text-muted-foreground">/ sesi</span>
              </div>

              <p className="text-muted-foreground mb-6 text-sm text-left pl-2">
                Pengalaman foto studio mandiri dengan hasil instan dan properti menarik.
              </p>

              <div className="w-full h-px bg-border/50 mb-6"></div>

              <ul className="space-y-3 mb-8">
                {[
                  "File digital instan (Google Drive)",
                  "Cetak foto strip / 4R",
                  "Template frame custom",
                  "Akses download QR Code",
                  "Durasi 15 menit",
                  "Maksimal 5 orang"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 min-w-[16px] flex justify-center">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Style Selection - Embedded */}
              <div className="mb-8">
                <label className="text-sm font-semibold mb-3 block text-left text-foreground/80 tracking-normal pl-2">
                  Pilih Style Photobox
                </label>
                <div className="flex flex-wrap gap-2 justify-start">
                  {photoboxStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 flex items-center gap-1.5
                        ${selectedStyle === style.id
                          ? `border-[#849283] ${style.color} text-foreground ring-1 ring-[#849283]/20 shadow-sm`
                          : `border-border bg-white text-muted-foreground hover:border-[#849283]/50 hover:bg-secondary/50`
                        }`}
                    >
                      {selectedStyle === style.id && <Check className="w-3 h-3 text-[#849283]" />}
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="hero"
                className="w-full mt-auto"
                onClick={handleBookNow}
              >
                <Zap className="mr-2" />
                Pesan Photobox
              </Button>
            </div>
          </div>

          {/* 3. Features & Timeline (Left Bottom - Under Intro) */}
          <div className="fade-in-section space-y-8" style={{ transitionDelay: '150ms' }}>
            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Zap, title: "Instant Result", desc: "Langsung jadi digital & cetak" },
                { icon: Smile, title: "Fun Props Ready", desc: "Aksesoris lucu gratis" },
                { icon: Printer, title: "High Quality", desc: "Kertas foto premium anti-air" },
                { icon: Users, title: "Max 5 People", desc: "Muat bareng bestie/keluarga" }
              ].map((feature, i) => (
                <div key={i} className="p-4 bg-white rounded-xl border border-border hover:border-[#849283] hover:shadow-soft transition-all duration-300 group">
                  <div className="w-10 h-10 bg-[#849283]/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#849283] transition-colors">
                    <feature.icon className="w-5 h-5 text-[#849283] group-hover:text-white transition-colors" />
                  </div>
                  <h5 className="font-medium text-sm mb-1">{feature.title}</h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Mini Timeline */}
            <div className="bg-white p-6 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-6">
                <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Cara Booking Simple</h5>
              </div>

              <div className="relative flex justify-between mt-2 px-2">
                {/* Connecting Line */}
                <div className="absolute top-4 left-0 w-full h-[1px] bg-border z-0"></div>

                {[
                  { icon: Calendar, text: "Pilih Jadwal" },
                  { icon: CreditCard, text: "Bayar DP/Full" },
                  { icon: Camera, text: "Datang & Foto" }
                ].map((step, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center gap-3 bg-white px-2">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#849283] flex items-center justify-center text-[#849283]">
                      <step.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-center">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <PhotoboxBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        styles={photoboxStyles}
        initialSelectedStyle={selectedStyle}
      />
    </section>
  );
};
