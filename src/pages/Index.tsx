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

import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Index = () => {
  useScrollAnimation();

  return (
    <>
      <Helmet>
        <title>Morain Studio | Professional Photo Studio Rental & Photobox in Denpasar, Bali</title>
        <meta
          name="description"
          content="Morain Studio - Your trusted studio rental & photobox in Denpasar, Bali. Book online for clean, bright, and cinematic photography. Professional photographer included."
        />
        <meta name="keywords" content="photo studio rental, photobox denpasar, studio foto bali, photography studio, studio rental bali" />
        <link rel="canonical" href="https://morain.studio" />

        <meta property="og:title" content="Morain Studio | Professional Photo Studio in Denpasar" />
        <meta property="og:description" content="Frame Your Story with our clean, bright, and cinematic studio experience. Easy online booking available." />
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
