import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher = ({ className = '' }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();

  // Normalize language to 'id' | 'en'
  const getNormalizedLang = useCallback((lng?: string): 'id' | 'en' => {
    return lng?.toLowerCase().startsWith('en') ? 'en' : 'id';
  }, []);

  const [activeLang, setActiveLang] = useState<'id' | 'en'>(() =>
    getNormalizedLang(i18n.language)
  );

  // Sync with external language updates
  useEffect(() => {
    setActiveLang(getNormalizedLang(i18n.language));
  }, [i18n.language, getNormalizedLang]);

  const handleSwitch = (lang: 'id' | 'en') => {
    if (activeLang === lang) return;
    setActiveLang(lang);
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem('morain-language', lang);
    } catch {
      // Safe fallback when localStorage is restricted
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleSwitch('en');
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      handleSwitch('id');
    }
  };

  const isEn = activeLang === 'en';

  return (
    <div
      role="radiogroup"
      aria-label="Pilih bahasa / Select language"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center h-8 w-[88px] p-1 rounded-full bg-[#FAF8F5] border border-[#E7E2D8] shadow-[0_1px_2px_rgba(0,0,0,0.04)] select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#849283] focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
    >
      {/* Sliding Pill Indicator */}
      <div
        aria-hidden="true"
        className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-[#849283] shadow-sm pointer-events-none transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          isEn ? 'translate-x-full' : 'translate-x-0'
        }`}
      />

      {/* ID Option */}
      <button
        type="button"
        role="radio"
        aria-checked={!isEn}
        aria-label="Bahasa Indonesia"
        tabIndex={-1}
        onClick={() => handleSwitch('id')}
        className={`relative z-10 flex-1 h-full flex items-center justify-center rounded-full text-xs font-semibold tracking-wider font-body transition-colors duration-200 cursor-pointer ${
          !isEn
            ? 'text-white font-bold'
            : 'text-[#2C302E]/75 hover:text-[#2C302E]'
        }`}
      >
        ID
      </button>

      {/* EN Option */}
      <button
        type="button"
        role="radio"
        aria-checked={isEn}
        aria-label="English"
        tabIndex={-1}
        onClick={() => handleSwitch('en')}
        className={`relative z-10 flex-1 h-full flex items-center justify-center rounded-full text-xs font-semibold tracking-wider font-body transition-colors duration-200 cursor-pointer ${
          isEn
            ? 'text-white font-bold'
            : 'text-[#2C302E]/75 hover:text-[#2C302E]'
        }`}
      >
        EN
      </button>
    </div>
  );
};
