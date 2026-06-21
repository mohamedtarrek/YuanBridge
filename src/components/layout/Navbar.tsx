'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSwitch } from '@/components/shared/LanguageSwitch';
import { Button } from '@/components/ui/Button';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function Navbar() {
  const { t, lang } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = status === 'authenticated';
  const user = session?.user;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success(lang === 'ar' ? 'تم تسجيل الخروج' : 'Logged out');
    router.push(`/${lang}`);
    router.refresh();
  };

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
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <a
                      href={`/${lang}/admin`}
                      className="px-3 py-2 text-sm text-accent-500 hover:text-accent-400 rounded-lg hover:bg-accent-500/10 transition-all duration-300 font-medium"
                    >
                      {lang === 'ar' ? 'لوحة الإدارة' : 'Admin'}
                    </a>
                  )}
                  <a
                    href={`/${lang}/dashboard`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text rounded-lg hover:bg-white/5 transition-all duration-300"
                  >
                    <div className="w-6 h-6 rounded-full bg-accent-500/20 text-accent-500 text-xs font-bold flex items-center justify-center">
                      {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{user?.name || user?.email?.split('@')[0]}</span>
                  </a>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-text-muted hover:text-danger transition-all duration-300"
                  >
                    {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                  </button>
                </>
              ) : (
                <>
                  <a
                    href={`/${lang}/login`}
                    className="px-4 py-2 text-sm text-text-muted hover:text-text transition-all duration-300"
                  >
                    {t('nav.login')}
                  </a>
                  <Button variant="primary" size="sm" href={`/${lang}/register`}>
                    {t('nav.register')}
                  </Button>
                </>
              )}
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
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <a
                      href={`/${lang}/admin`}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 text-accent-500 font-medium rounded-lg hover:bg-accent-500/5 transition-all"
                    >
                      {lang === 'ar' ? 'لوحة الإدارة' : 'Admin Dashboard'}
                    </a>
                  )}
                  <a
                    href={`/${lang}/dashboard`}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-text-muted hover:text-text rounded-lg hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-accent-500/20 text-accent-500 text-xs font-bold flex items-center justify-center">
                        {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <span>{user?.name || user?.email || lang === 'ar' ? 'حسابي' : 'My Account'}</span>
                    </div>
                  </a>
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="px-4 py-3 text-danger font-medium rounded-lg hover:bg-danger/5 transition-all text-left"
                  >
                    {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
