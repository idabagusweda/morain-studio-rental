import { Calendar, Clock, Camera, MapPin, CreditCard, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const WhyChooseSection = () => {
  const { t } = useTranslation(['landing']);

  const features = [
    {
      id: 'easyBooking',
      icon: Calendar,
      title: t('whyChoose.items.easyBooking.title'),
      description: t('whyChoose.items.easyBooking.description'),
    },
    {
      id: 'realtimeCalendar',
      icon: Clock,
      title: t('whyChoose.items.realtimeCalendar.title'),
      description: t('whyChoose.items.realtimeCalendar.description'),
    },
    {
      id: 'minimalistAesthetic',
      icon: Camera,
      title: t('whyChoose.items.minimalistAesthetic.title'),
      description: t('whyChoose.items.minimalistAesthetic.description'),
    },
    {
      id: 'strategicLocation',
      icon: MapPin,
      title: t('whyChoose.items.strategicLocation.title'),
      description: t('whyChoose.items.strategicLocation.description'),
    },
    {
      id: 'transparentPricing',
      icon: CreditCard,
      title: t('whyChoose.items.transparentPricing.title'),
      description: t('whyChoose.items.transparentPricing.description'),
    },
    {
      id: 'funPhotobox',
      icon: Sparkles,
      title: t('whyChoose.items.funPhotobox.title'),
      description: t('whyChoose.items.funPhotobox.description'),
    },
  ];

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
              key={feature.id}
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
