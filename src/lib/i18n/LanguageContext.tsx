'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { translations, type TranslationKey } from './translations';

type Language = 'ar' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  dir: 'rtl' | 'ltr';
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLang = 'ar' }: { children: ReactNode; initialLang?: Language }) {
  const [lang, setLangState] = useState<Language>(initialLang);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('yb_lang') as Language | null;
    if (stored && (stored === 'ar' || stored === 'en')) {
      setLangState(stored);
    }
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('yb_lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key: TranslationKey): string => {
    const translation = translations[lang]?.[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${lang}`);
      return translations.en[key] || key;
    }
    return translation;
  }, [lang]);

  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ lang, setLang, t, dir: lang === 'ar' ? 'rtl' : 'ltr', isRTL: lang === 'ar' }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const isRTL = lang === 'ar';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
