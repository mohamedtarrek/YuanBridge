'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';

interface AdminLink {
  key: string;
  label: string;
  href: string;
  icon: string;
}

const sidebarLinks: AdminLink[] = [
  { key: 'dashboard', label: 'admin.title', href: '', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { key: 'users', label: 'admin.users', href: '/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
  { key: 'strategies', label: 'admin.strategies', href: '/strategies', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { key: 'subscriptions', label: 'admin.subscriptions', href: '/subscriptions', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { key: 'analytics', label: 'admin.analytics', href: '/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { key: 'settings', label: 'admin.settings', href: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];

const adminStats = [
  { key: 'totalUsers', value: '12,847', change: '+12%', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', color: 'text-info', bg: 'bg-info/10' },
  { key: 'activeSubscriptions', value: '3,421', change: '+8%', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', color: 'text-success', bg: 'bg-success/10' },
  { key: 'monthlyRevenue', value: '$48,294', change: '+15%', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-accent-500', bg: 'bg-accent-500/10' },
  { key: 'strategiesToday', value: '8', change: '+3', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'text-warning', bg: 'bg-warning/10' },
  { key: 'totalStrategies', value: '2,156', change: '+22%', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z', color: 'text-primary-400', bg: 'bg-primary-400/10' },
];

const recentSignups = [
  { name: 'Omar Hassan', nameAr: 'عمر حسن', email: 'omar@example.com', status: 'active', date: new Date(Date.now() - 3600000) },
  { name: 'Sara Khalid', nameAr: 'سارة خالد', email: 'sara@example.com', status: 'active', date: new Date(Date.now() - 7200000) },
  { name: 'Mohammed Ali', nameAr: 'محمد علي', email: 'mohammed@example.com', status: 'pending', date: new Date(Date.now() - 14400000) },
  { name: 'Nora Ahmed', nameAr: 'نورا أحمد', email: 'nora@example.com', status: 'active', date: new Date(Date.now() - 28800000) },
  { name: 'Faisal Al-Rashid', nameAr: 'فيصل الرشيد', email: 'faisal@example.com', status: 'suspended', date: new Date(Date.now() - 57600000) },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
} as const;
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
} as const;

function StatusDot({ status }: { status: string }) {
  const config: Record<string, string> = {
    active: 'bg-success',
    pending: 'bg-warning',
    suspended: 'bg-danger',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium ${
      status === 'active' ? 'text-success bg-success/10' :
      status === 'pending' ? 'text-warning bg-warning/10' :
      'text-danger bg-danger/10'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config[status] || 'bg-text-dim'}`} />
      {status}
    </span>
  );
}

export default function AdminPage() {
  const { t, lang, isRTL } = useLanguage();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <h1 className="text-xl font-bold gradient-text">{t('admin.title')}</h1>
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
              <div className="flex items-center gap-2 px-3 mb-4">
                <span className="px-2 py-0.5 rounded-md bg-accent-500/20 text-accent-500 text-xs font-bold uppercase tracking-wider">
                  Admin
                </span>
                <h2 className="text-lg font-bold gradient-text">{t('admin.title')}</h2>
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
                    {t(link.label as any)}
                  </a>
                ))}
              </nav>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 min-w-0"
          >
            {/* Page Title */}
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h1 className="text-2xl md:text-4xl font-bold gradient-text mb-2">{t('admin.title')}</h1>
              <p className="text-text-muted">{t('admin.subtitle') || 'Monitor and manage your platform'}</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
              {adminStats.map((stat) => (
                <div key={stat.key} className="glass-card rounded-2xl p-5 border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                      </svg>
                    </div>
                    <span className="text-text-dim text-xs">{(t as any)(`admin.${stat.key}`) || stat.key}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold gradient-text">{stat.value}</span>
                    <span className={`text-xs font-semibold ${
                      stat.change.startsWith('+') ? 'text-success' : 'text-danger'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Recent Signups + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div variants={itemVariants} className="lg:col-span-2 glass rounded-2xl p-5 md:p-6 border border-border">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-text">{t('admin.recentSignups') || 'Recent Signups'}</h3>
                  <a href={`/${lang}/admin/users`} className="text-accent-500 text-sm font-semibold hover:text-accent-400 transition-colors">
                    {t('common.viewAll')}
                  </a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 pr-4 text-text-dim font-medium">{t('auth.name')}</th>
                        <th className="text-left py-3 pr-4 text-text-dim font-medium">{t('auth.email')}</th>
                        <th className="text-left py-3 pr-4 text-text-dim font-medium">{t('common.status')}</th>
                        <th className="text-left py-3 text-text-dim font-medium">{t('common.date') || 'Date'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSignups.map((user, i) => (
                        <motion.tr
                          key={user.email}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-border/50 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 pr-4 text-text font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-accent-500/20 text-accent-500 text-xs font-bold flex items-center justify-center">
                                {(lang === 'ar' ? user.nameAr : user.name).charAt(0)}
                              </div>
                              {lang === 'ar' ? user.nameAr : user.name}
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-text-dim">{user.email}</td>
                          <td className="py-3 pr-4">
                            <StatusDot status={user.status} />
                          </td>
                          <td className="py-3 text-text-dim text-xs">
                            {user.date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
                              month: 'short', day: 'numeric',
                            })}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass rounded-2xl p-5 md:p-6 border border-border">
                <h3 className="text-lg font-bold text-text mb-5">{t('admin.quickActions') || 'Quick Actions'}</h3>
                <div className="flex flex-col gap-3">
                  <Button variant="primary" className="w-full">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('admin.approve')} {t('admin.strategies')}
                  </Button>
                  <Button variant="secondary" className="w-full">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {t('admin.viewReports') || 'View Reports'}
                  </Button>
                  <Button variant="ghost" className="w-full">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('admin.systemHealth') || 'System Health'}
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
