'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSwitch } from '@/components/shared/LanguageSwitch';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { t, lang } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: `/${lang}`, label: t('nav.home') },
    { href: `/${lang}/strategies`, label: t('nav.strategies') },
    { href: `/${lang}/ai-analysis`, label: t('nav.aiAnalysis') },
    { href: `/${lang}/pricing`, label: t('nav.pricing') },
    { href: `/${lang}/about`, label: t('nav.about') },
    { href: `/${lang}/contact`, label: t('nav.contact') },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href={`/${lang}`} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-surface-dark font-bold text-sm">Y</span>
            </div>
            <span className="text-text font-bold text-lg hidden sm:block">
              Yuan<span className="gradient-text">Bridge</span>
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-text-muted hover:text-text rounded-lg hover:bg-white/5 transition-all duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitch />
            <div className="hidden md:flex items-center gap-2">
              <a
                href={`/${lang}/login`}
                className="px-4 py-2 text-sm text-text-muted hover:text-text transition-all duration-300"
              >
                {t('nav.login')}
              </a>
              <Button variant="primary" size="sm" href={`/${lang}/register`}>
                {t('nav.register')}
              </Button>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 rounded-xl bg-surface-lighter border border-border flex items-center justify-center text-text"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-border overflow-hidden"
          >
            <div className="container-custom py-4 flex flex-col gap-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-text-muted hover:text-text rounded-lg hover:bg-white/5 transition-all"
                >
                  {link.label}
                </a>
              ))}
              <div className="h-px bg-border my-2" />
              <a
                href={`/${lang}/login`}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-text-muted hover:text-text rounded-lg hover:bg-white/5 transition-all"
              >
                {t('nav.login')}
              </a>
              <a
                href={`/${lang}/register`}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-accent-500 font-medium rounded-lg hover:bg-accent-500/5 transition-all"
              >
                {t('nav.register')}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
