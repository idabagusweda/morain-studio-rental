import { Button } from '@/components/ui/button';
import { MessageCircle, Mail, Instagram, MapPin, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ContactSection = () => {
  const { t } = useTranslation(['landing', 'common']);
  
  const handleWhatsApp = () => {
    const message = encodeURIComponent(t('contact.whatsappMessage'));
    window.open(`https://wa.me/6289531511894?text=${message}`, '_blank');
  };

  return (
    <section id="contact" className="section-padding bg-secondary/50">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Info */}
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              {t('contact.sectionTag')}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold mt-3 mb-6">
              {t('contact.title')}
              <br />
              {t('contact.titleHighlight')}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              {t('contact.description')}
            </p>

            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">WhatsApp</p>
                  <a href="tel:+6289531511894" className="text-muted-foreground hover:text-primary transition-colors">
                    0895-3151-1894
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Email</p>
                  <a href="mailto:officialmorain@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                    officialmorain@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Instagram className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Instagram</p>
                  <a 
                    href="https://instagram.com/morain.id" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    @morain.id
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">{t('contact.locationLabel')}</p>
                  <p className="text-muted-foreground">
                    Jl. Teuku Umar, Denpasar, Bali
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">{t('contact.hoursLabel')}</p>
                  <p className="text-muted-foreground">
                    {t('contact.hoursValue')}
                  </p>
                </div>
              </div>
            </div>

            <Button variant="hero" size="xl" onClick={handleWhatsApp}>
              <MessageCircle className="mr-2" />
              {t('contact.whatsappButton')}
            </Button>
          </div>

          {/* Map / Image */}
          <div className="relative">
            <div className="aspect-square lg:aspect-auto lg:h-full rounded-2xl overflow-hidden bg-muted">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15777.548890694675!2d115.20684!3d-8.670458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd2409b0e3f357f%3A0x54c87cf538e82fc3!2sJl.%20Teuku%20Umar%2C%20Denpasar%2C%20Bali!5e0!3m2!1sen!2sid!4v1699999999999!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Morain Studio Location"
              />
            </div>
            
            {/* Floating card */}
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-card/95 backdrop-blur-sm rounded-xl shadow-medium">
              <p className="font-display font-semibold mb-1">{t('contact.floatingCardTitle')}</p>
              <p className="text-sm text-muted-foreground">
                {t('contact.floatingCardSubtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
