'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function LanguageSwitch() {
  const { lang, setLang } = useLanguage();

  return (
    <motion.button
      onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      className="relative w-10 h-10 rounded-xl bg-surface-lighter border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-border-light transition-all duration-300 text-xs font-bold uppercase tracking-wider"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Switch language"
    >
      {lang === 'ar' ? 'EN' : 'AR'}
    </motion.button>
  );
}
