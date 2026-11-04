import { format as dateFnsFormat } from 'date-fns';
import { id, enUS } from 'date-fns/locale';

// Get current language from i18n
export const getCurrentLocale = () => {
  const lang = localStorage.getItem('morain-language') || 'id';
  return lang === 'id' ? id : enUS;
};

// Format currency based on locale
export const formatCurrency = (amount: number, language: string = 'id'): string => {
  if (language === 'id') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
};

// Format date with locale
export const formatDate = (
  date: Date | string,
  formatStr: string = 'd MMMM yyyy',
  language: string = 'id'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = language === 'id' ? id : enUS;
  return dateFnsFormat(dateObj, formatStr, { locale });
};

// Format number based on locale
export const formatNumber = (num: number, language: string = 'id'): string => {
  return new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US').format(num);
};
