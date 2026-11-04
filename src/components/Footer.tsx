import { Instagram, Mail, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const { t } = useTranslation(['landing', 'common']);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container-wide">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <span className="font-display text-3xl font-semibold">Morain</span>
              <p className="text-sm text-background/60 tracking-widest uppercase mt-1">
                Frame Your Story
              </p>
            </div>
            <p className="text-background/70 max-w-md mb-6">
              {t('footer.about.description')}
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/morain.id"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="mailto:officialmorain@gmail.com"
                className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/6289531511894"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              {['Services', 'Studio', 'Photobox', 'Gallery', 'FAQ'].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {t(`common:navigation.${link.toLowerCase()}`) || link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t('contact.info.phone')}</h4>
            <ul className="space-y-3 text-background/70">
              <li>Jl. Teuku Umar, Denpasar</li>
              <li>0895-3151-1894</li>
              <li>officialmorain@gmail.com</li>
              <li>09:00 - 20:00 WITA</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-background/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/60">
            {t('footer.copyright')}
          </p>
          <p className="text-sm text-background/60">
            {t('footer.madeWith')}
          </p>
        </div>
      </div>
    </footer>
  );
};
