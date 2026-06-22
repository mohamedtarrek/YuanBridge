'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { usePathname, useRouter } from 'next/navigation';

interface AdminLink {
  key: string;
  label: string;
  labelAr: string;
  href: string;
  icon: string;
  minRole: string;
}

const allSidebarLinks: AdminLink[] = [
  { key: 'dashboard', label: 'Overview', labelAr: 'نظرة عامة', href: '', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', minRole: 'MODERATOR' },
  { key: 'users', label: 'Users', labelAr: 'المستخدمون', href: '/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', minRole: 'ADMIN' },
  { key: 'admins', label: 'Admins', labelAr: 'المشرفون', href: '/admins', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', minRole: 'SUPER_ADMIN' },
  { key: 'strategies', label: 'Strategies', labelAr: 'الاستراتيجيات', href: '/strategies', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', minRole: 'MODERATOR' },
  { key: 'categories', label: 'Categories', labelAr: 'التصنيفات', href: '/categories', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', minRole: 'MODERATOR' },
  { key: 'subscriptions', label: 'Subscriptions', labelAr: 'الاشتراكات', href: '/subscriptions', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', minRole: 'ADMIN' },
  { key: 'payments', label: 'Payments', labelAr: 'المدفوعات', href: '/payments', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', minRole: 'ADMIN' },
  { key: 'analytics', label: 'Analytics', labelAr: 'التحليلات', href: '/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', minRole: 'MODERATOR' },
  { key: 'logs', label: 'Audit Log', labelAr: 'سجل الإجراءات', href: '/logs', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', minRole: 'MODERATOR' },
  { key: 'settings', label: 'Settings', labelAr: 'الإعدادات', href: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', minRole: 'SUPER_ADMIN' },
  { key: 'profile', label: 'Profile', labelAr: 'الملف الشخصي', href: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', minRole: 'MODERATOR' },
];

const roleHierarchy: Record<string, number> = {
  MODERATOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { lang, isRTL } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) setUserRole(data.user.role);
      })
      .catch(() => {});
  }, []);

  const sidebarLinks = allSidebarLinks.filter(link => {
    if (!userRole) return true
    const required = roleHierarchy[link.minRole] || 0
    const current = roleHierarchy[userRole] || 0
    return current >= required
  })

  const currentPath = pathname.replace(`/${lang}/admin`, '') || '/';
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
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-md bg-accent-500/20 text-accent-500 text-xs font-bold uppercase tracking-wider">
                Admin
              </span>
              <h1 className="text-xl font-bold gradient-text">
                {lang === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
              </h1>
            </div>
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
                  {sidebarLinks.map((link) => (
                    <a
                      key={link.key}
                      href={`/${lang}/admin${link.href}`}
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
                      {lang === 'ar' ? link.labelAr : link.label}
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
              <div className="flex items-center gap-2 px-3 mb-4">
                <span className="px-2 py-0.5 rounded-md bg-accent-500/20 text-accent-500 text-xs font-bold uppercase tracking-wider">
                  Admin
                </span>
                <h2 className="text-lg font-bold gradient-text">
                  {lang === 'ar' ? 'الإدارة' : 'Dashboard'}
                </h2>
              </div>
              <nav className="flex flex-col gap-1">
                {sidebarLinks.map((link) => (
                  <a
                    key={link.key}
                    href={`/${lang}/admin${link.href}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(link.href)
                        ? 'bg-accent-500/20 text-accent-500 shadow-lg shadow-accent-500/5'
                        : 'text-text-muted hover:text-text hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                    </svg>
                    {lang === 'ar' ? link.labelAr : link.label}
                  </a>
                ))}
              </nav>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 min-w-0"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
