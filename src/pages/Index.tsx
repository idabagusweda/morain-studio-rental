import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { WhyChooseSection } from '@/components/WhyChooseSection';
import { PackagesSection } from '@/components/PackagesSection';
import { PhotoboxSection } from '@/components/PhotoboxSection';
import { PortfolioSection } from '@/components/PortfolioSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { FAQSection } from '@/components/FAQSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Index = () => {
  const { t } = useTranslation(['landing']);
  useScrollAnimation();

  return (
    <>
      <Helmet>
        <title>{t('landing:meta.title')}</title>
        <meta
          name="description"
          content={t('landing:meta.description')}
        />
        <meta name="keywords" content="photo studio rental, photobox denpasar, studio foto bali, photography studio, studio rental bali" />
        <link rel="canonical" href="https://morain.studio" />

        <meta property="og:title" content={t('landing:meta.ogTitle')} />
        <meta property="og:description" content={t('landing:meta.ogDescription')} />
        <meta property="og:type" content="website" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Morain Studio",
            "description": "Professional photo studio rental and photobox services in Denpasar, Bali",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Jl. Teuku Umar",
              "addressLocality": "Denpasar",
              "addressRegion": "Bali",
              "addressCountry": "ID"
            },
            "telephone": "+6289531511894",
            "email": "officialmorain@gmail.com",
            "openingHours": "Mo-Su 09:00-20:00",
            "priceRange": "Rp 30.000 - Rp 400.000"
          })}
        </script>
      </Helmet>

      <div className="min-h-screen">
        <Header />
        <main>
          <HeroSection />
          <WhyChooseSection />
          <section id="services">
            <PackagesSection />
          </section>
          <PhotoboxSection />
          <PortfolioSection />
          <TestimonialsSection />
          <FAQSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
