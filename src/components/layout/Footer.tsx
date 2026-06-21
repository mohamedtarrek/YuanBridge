'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

export function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="relative border-t border-border bg-surface-dark">
      <div className="dot-pattern absolute inset-0 opacity-30" />
      <div className="container-custom relative py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <a href={`/${lang}`} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <span className="text-surface-dark font-bold text-sm">Y</span>
              </div>
              <span className="text-text font-bold text-lg">Yuan<span className="gradient-text">Bridge</span></span>
            </a>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              {['twitter', 'telegram', 'youtube', 'linkedin'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-surface-lighter border border-border flex items-center justify-center text-text-muted hover:text-accent-500 hover:border-accent-500/30 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-text font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3">
              {[
                { href: `/${lang}`, label: t('nav.home') },
                { href: `/${lang}/strategies`, label: t('nav.strategies') },
                { href: `/${lang}/ai-analysis`, label: t('nav.aiAnalysis') },
                { href: `/${lang}/pricing`, label: t('nav.pricing') },
                { href: `/${lang}/about`, label: t('nav.about') },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-text-muted text-sm hover:text-text transition-all duration-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-text font-semibold mb-4">{t('footer.support')}</h3>
            <ul className="space-y-3">
              {[
                { href: `/${lang}/contact`, label: t('footer.contact') },
                { href: `/${lang}/faq`, label: t('footer.faq') },
                { href: '#', label: t('footer.privacy') },
                { href: '#', label: t('footer.terms') },
                { href: '#', label: t('footer.cookies') },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-text-muted text-sm hover:text-text transition-all duration-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-text font-semibold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3 text-text-muted text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@yuanbridge.com
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +1 (555) 123-4567
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-text-muted text-sm">
          <p>&copy; {new Date().getFullYear()} YuanBridge. {t('footer.rights')}</p>
          <p className="flex items-center gap-1">
            {t('footer.madeWith')}
            <svg className="w-4 h-4 text-danger" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {lang === 'ar' ? 'عربياً' : 'Globally'}
          </p>
        </div>
      </div>
    </footer>
  );
}
