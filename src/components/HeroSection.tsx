import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Image, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// import { CalendarModal } from './CalendarModal'; // Remove import

const slides = [
  {
    id: 1,
    image: '/images/fotoStudio-1.webp',
    alt: 'Professional photography studio with softbox lighting',
  },
  {
    id: 2,
    image: '/images/fotoStudio-2.webp',
    alt: 'Clean minimal photo studio setup',
  },
  {
    id: 3,
    image: '/images/cowboy-3.webp',
    alt: 'Cowboy Photobox',
  },
  {
    id: 4,
    image: '/images/photoBox-2.webp',
    alt: 'Retro Film Vibes',
  },
];

export const HeroSection = () => {
  const { t } = useTranslation(['landing']);
  const [currentSlide, setCurrentSlide] = useState(0);
  // const [isCalendarOpen, setIsCalendarOpen] = useState(false); // Remove state

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Slider */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "low"}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/40" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="container-wide relative z-10 pt-24 pb-16">
        <div className="max-w-2xl">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 animate-fade-up">
            ⚲ {t('hero.location')}
          </span>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            {t('hero.title')}
            <br />
            <span className="text-primary">{t('hero.titleHighlight')}</span>
            <br />
            {t('hero.titleEnd')}
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {t('hero.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button
              variant="hero"
              size="xl"
              onClick={() => scrollToSection('#packages')}
            >
              {t('hero.viewPackages')}
              <ArrowRight className="ml-2" />
            </Button>
            <Button
              variant="heroOutline"
              size="xl"
              onClick={() => scrollToSection('#gallery')}
            >
              <Image className="mr-2" />
              {t('hero.ourGallery')}
            </Button>
          </div>
        </div>
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
        <button
          onClick={prevSlide}
          className="p-2 rounded-full bg-card/50 backdrop-blur-sm text-foreground hover:bg-card transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                ? 'bg-primary w-8'
                : 'bg-foreground/30 hover:bg-foreground/50'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="p-2 rounded-full bg-card/50 backdrop-blur-sm text-foreground hover:bg-card transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>
      </div>

    </section>
  );
};
