import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type GalleryItem = {
  src: string;
  category: string;
  desc: string;
};

const STUDIO_IMAGES: GalleryItem[] = [
  { src: '/images/gallery/studio_sq_portrait_01.webp', category: 'Portrait', desc: 'Natural candid moment' },
  { src: '/images/gallery/studio_sq_portrait_02.webp', category: 'Portrait', desc: 'Professional headshot' },
  { src: '/images/gallery/studio-corporate-1.webp', category: 'Corporate', desc: 'Team synergy & style' },
  { src: '/images/gallery/studio_sq_family_01.webp', category: 'Family', desc: 'Warm family memories' },
  { src: '/images/gallery/studio-campus-1.webp', category: 'Group', desc: 'Campus friendship goals' },
  { src: '/images/gallery/studio_sq_product_01.webp', category: 'Product', desc: 'Aesthetic composition' },
  { src: '/images/gallery/studio_couple.webp', category: 'Couple', desc: 'Romantic session' },
  { src: '/images/gallery/studio_portrait.webp', category: 'Portrait', desc: 'Personal branding' },
  { src: '/images/gallery/studio_sq_couple_01.webp', category: 'Couple', desc: 'Two hearts' },
  { src: '/images/gallery/studio-family-1.webp', category: 'Family', desc: 'Joyful generation' },
  { src: '/images/gallery/studio-product-1.webp', category: 'Product', desc: 'Brand showcase' },
  { src: '/images/gallery/studio-product-2.webp', category: 'Product', desc: 'Detail oriented' },
];

const PHOTOBOX_IMAGES: GalleryItem[] = [
  { src: '/images/gallery/fotobox-cowboy-2.webp', category: 'Cowboy', desc: 'Western vibes only' },
  { src: '/images/photoBox-2.webp', category: 'Retro Film', desc: 'Classic vintage film' },
  { src: '/images/photoBox-3.webp', category: 'Minimal', desc: 'Clean & modern look' },
  { src: '/images/gallery/fotobox-cyberpunk-2.webp', category: 'Cyberpunk', desc: 'Neon future aesthetic' },
  { src: '/images/gallery/fotobox-cute-4.webp', category: 'Cute Pastel', desc: 'Soft & dreamy colors' },
  { src: '/images/gallery/fotobox-minimal-1.webp', category: 'Minimal', desc: 'Simple elegance' },
  { src: '/images/gallery/fotobox-cute-2.webp', category: 'Cute Pastel', desc: 'Pink aesthetics' },
  { src: '/images/gallery/fotobox-cute-3.webp', category: 'Cute Pastel', desc: 'Kawaii pose' },
  { src: '/images/gallery/fotobox-cowboy-1.webp', category: 'Cowboy', desc: 'Western fun' },
  { src: '/images/gallery/fotobox-cowboy-3.webp', category: 'Cowboy', desc: 'Wild west vibes' },
  { src: '/images/gallery/fotobox-cyberpunk-1.webp', category: 'Cyberpunk', desc: 'Neon city lights' },
  { src: '/images/gallery/fotobox-retro-2.webp', category: 'Retro Film', desc: 'Vintage grain' },
  { src: '/images/gallery/fotobox-minimal-2.webp', category: 'Minimal', desc: 'Simple elegance' },
  { src: '/images/gallery/fotobox-retro-1.webp', category: 'Retro Film', desc: '90s Nostalgia' },
];

export const PortfolioSection = () => {
  const { t } = useTranslation(['landing', 'common']);
  const [activeMainTab, setActiveMainTab] = useState<'studio' | 'photobox'>('studio');

  const currentImages = activeMainTab === 'studio' ? STUDIO_IMAGES : PHOTOBOX_IMAGES;

  return (
    <section id="gallery" className="section-padding bg-warm-gray/30 overflow-hidden">
      <div className="container-wide">
        <div className="text-center max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            {t('gallery.sectionTag')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold mt-3 mb-4">
            {t('gallery.title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('gallery.description')}
          </p>
        </div>

        {/* 1. Main Tabs (Studio vs Photobox) */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1 bg-white/50 backdrop-blur-sm rounded-full border border-border/50 shadow-sm">
            <button
              onClick={() => setActiveMainTab('studio')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                ${activeMainTab === 'studio'
                  ? 'bg-primary text-primary-foreground shadow-md transform scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                }`}
            >
              <Camera className="w-4 h-4" />
              {t('common:navigation.studio')}
            </button>
            <button
              onClick={() => setActiveMainTab('photobox')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                ${activeMainTab === 'photobox'
                  ? 'bg-primary text-primary-foreground shadow-md transform scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                }`}
            >
              <Sparkles className="w-4 h-4" />
              {t('common:navigation.photobox')}
            </button>
          </div>
        </div>

        {/* 2. Marquee Slider (Full Width) */}
        <div className="relative w-full py-8">
          {/* Gradient Masks for seamless edges */}
          <div className="absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-warm-gray/30 via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-warm-gray/30 via-white/80 to-transparent z-10 pointer-events-none" />

          {/* Marquee Container */}
          <div className="flex items-center overflow-hidden">
            <div
              key={activeMainTab} // Key forces re-render/animation reset on tab change
              className="flex animate-marquee w-fit"
            >
              {/* Render 4 sets to ensure full coverage (2 for view, 2 for loop buffer with -50% start) */}
              {[...currentImages, ...currentImages, ...currentImages, ...currentImages].map((item, i) => (
                <div
                  key={i}
                  className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] mx-4 flex-shrink-0 rounded-2xl overflow-hidden shadow-sm border border-white/50 hover:shadow-medium transition-all duration-500 will-change-transform bg-secondary/30 group"
                >
                  <img
                    src={item.src}
                    alt={`${item.category} - ${item.desc}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    width="320"
                    height="320"
                    fetchPriority="low"
                  />

                  {/* Hover Overlay with Metadata */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                    <span className="inline-block px-2 py-1 mb-2 text-xs font-semibold tracking-wider text-white uppercase bg-white/20 backdrop-blur-md rounded-md w-fit border border-white/10">
                      {item.category}
                    </span>
                    <p className="text-white font-medium text-sm leading-tight drop-shadow-md">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instagram CTA */}
        <div className="text-center mt-12 animate-in fade-in duration-700 delay-200">
          <p className="text-muted-foreground mb-4">Lihat lebih banyak update terbaru</p>
          <Button variant="outline" asChild className="rounded-full hover:bg-white hover:text-foreground transition-all duration-300 px-8 border-primary/20">
            <a href="https://instagram.com/morain.id" target="_blank" rel="noopener noreferrer">
              @morain.id
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};
