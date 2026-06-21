'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { usePathname } from 'next/navigation';

interface SidebarLink {
  key: string;
  label: string;
  href: string;
  icon: string;
}

const links: SidebarLink[] = [
  { key: 'overview', label: 'dashboard.overview', href: '', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { key: 'saved', label: 'dashboard.saved', href: '/saved', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
  { key: 'notifications', label: 'dashboard.notifications', href: '/notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { key: 'billing', label: 'dashboard.billing', href: '/billing', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { key: 'settings', label: 'dashboard.settings', href: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t, lang, isRTL } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPath = pathname.replace(`/${lang}/dashboard`, '') || '/';
  const isActive = (href: string) => {
    if (href === '') return currentPath === '' || currentPath === '/';
    return currentPath.startsWith(href);
  };

  return (
    <div className="min-h-screen pt-20 pb-16 relative" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="absolute top-40 right-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl" />

      <div className="container-custom relative">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between glass rounded-2xl p-4 border border-border">
            <h1 className="text-xl font-bold gradient-text">{t('dashboard.title')}</h1>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-xl glass border border-border flex items-center justify-center text-text-muted hover:text-text"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass rounded-2xl mt-2 overflow-hidden border border-border"
              >
                <div className="p-2">
                  {links.map((link) => (
                    <a
                      key={link.key}
                      href={`/${lang}/dashboard${link.href}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive(link.href)
                          ? 'bg-accent-500/20 text-accent-500'
                          : 'text-text-muted hover:text-text hover:bg-white/5'
                      }`}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                      </svg>
                      {t(link.label as any)}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex flex-col w-64 flex-shrink-0"
          >
            <div className="glass rounded-2xl p-4 border border-border sticky top-28">
              <h2 className="text-lg font-bold gradient-text mb-4 px-3">{t('dashboard.title')}</h2>
              <nav className="flex flex-col gap-1">
                {links.map((link) => (
                  <a
                    key={link.key}
                    href={`/${lang}/dashboard${link.href}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(link.href)
                        ? 'bg-accent-500/20 text-accent-500 shadow-lg shadow-accent-500/5'
                        : 'text-text-muted hover:text-text hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                    </svg>
                    {t(link.label as any)}
                  </a>
                ))}
              </nav>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 min-w-0"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
