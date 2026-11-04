import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import commonId from './locales/id/common.json';
import commonEn from './locales/en/common.json';
import landingId from './locales/id/landing.json';
import landingEn from './locales/en/landing.json';
import authId from './locales/id/auth.json';
import authEn from './locales/en/auth.json';
import dashboardId from './locales/id/dashboard.json';
import dashboardEn from './locales/en/dashboard.json';
import adminId from './locales/id/admin.json';
import adminEn from './locales/en/admin.json';
import bookingId from './locales/id/booking.json';
import bookingEn from './locales/en/booking.json';

const resources = {
  id: {
    common: commonId,
    landing: landingId,
    auth: authId,
    dashboard: dashboardId,
    admin: adminId,
    booking: bookingId,
  },
  en: {
    common: commonEn,
    landing: landingEn,
    auth: authEn,
    dashboard: dashboardEn,
    admin: adminEn,
    booking: bookingEn,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'id',
    defaultNS: 'common',
    ns: ['common', 'landing', 'auth', 'dashboard', 'admin', 'booking'],
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'morain-language',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
