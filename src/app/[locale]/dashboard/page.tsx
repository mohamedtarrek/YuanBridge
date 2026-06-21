'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';

const activities = [
  { id: '1', action: 'Viewed EUR/USD Bullish Breakout strategy', actionAr: 'تم عرض استراتيجية EUR/USD', timestamp: new Date(Date.now() - 60000) },
  { id: '2', action: 'Saved GBP/USD Bearish Reversal strategy', actionAr: 'تم حفظ استراتيجية GBP/USD', timestamp: new Date(Date.now() - 3600000) },
  { id: '3', action: 'Premium subscription activated', actionAr: 'تم تفعيل الاشتراك المميز', timestamp: new Date(Date.now() - 86400000) },
  { id: '4', action: 'Price alert triggered for EUR/USD', actionAr: 'تم تفعيل تنبيه سعر EUR/USD', timestamp: new Date(Date.now() - 172800000) },
  { id: '5', action: 'Shared NZD/USD Double Bottom strategy', actionAr: 'تم مشاركة استراتيجية NZD/USD', timestamp: new Date(Date.now() - 259200000) },
  { id: '6', action: 'Profile information updated', actionAr: 'تم تحديث الملف الشخصي', timestamp: new Date(Date.now() - 604800000) },
];

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function timeAgoAr(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${days} يوم`;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
} as const;
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
} as const;

export default function DashboardOverviewPage() {
  const { t, lang, isRTL } = useLanguage();
  const [user, setUser] = useState<{
    name: string;
    nameAr: string;
    email: string;
    subscription: { plan: string; endsAt: string } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="glass rounded-2xl p-6 md:p-8 border border-border">
          <div className="h-8 w-64 bg-white/10 rounded-lg mb-3" />
          <div className="h-4 w-48 bg-white/10 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card rounded-2xl p-5 border border-border">
              <div className="h-10 w-10 bg-white/10 rounded-xl mb-3" />
              <div className="h-4 w-24 bg-white/10 rounded-lg mb-2" />
              <div className="h-8 w-16 bg-white/10 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass rounded-2xl p-5 md:p-6 border border-border">
            <div className="h-6 w-36 bg-white/10 rounded-lg mb-5" />
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-3">
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <div className="flex-1">
                  <div className="h-4 w-48 bg-white/10 rounded-lg mb-1" />
                  <div className="h-3 w-20 bg-white/10 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
          <div className="glass rounded-2xl p-5 md:p-6 border border-border">
            <div className="h-6 w-28 bg-white/10 rounded-lg mb-5" />
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 w-full bg-white/10 rounded-xl mb-3" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const userName = lang === 'ar' ? user?.nameAr : user?.name;
  const subscriptionPlan = user?.subscription?.plan || 'free';
  const subscriptionEndsAt = user?.subscription?.endsAt || '';
  const subscriptionStatus = subscriptionPlan === 'premium' ? 'active' : 'expired';
  const fmtDate = (d: Date) => d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Welcome */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6 md:p-8 border border-border mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">
              {t('dashboard.welcome') || 'Welcome'}, {userName || (t as any)('dashboard.user') || 'User'}
            </h1>
            <p className="text-text-muted">{t('dashboard.welcomeSub') || 'Here is your trading overview'}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-2 ${
              subscriptionStatus === 'active'
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-danger/10 text-danger border border-danger/20'
            }`}>
              <span className={`w-2 h-2 rounded-full ${subscriptionStatus === 'active' ? 'bg-success' : 'bg-danger'}`} />
              {subscriptionStatus === 'active' ? t('dashboard.active') : t('dashboard.expired')}
            </span>
            {subscriptionPlan === 'premium' && subscriptionEndsAt && (
              <span className="text-xs text-text-dim">
                {t('dashboard.expiresOn')}: {fmtDate(new Date(subscriptionEndsAt))}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-text-dim text-sm">{t('dashboard.strategiesViewed') || 'Strategies Viewed'}</span>
          </div>
          <span className="text-2xl md:text-3xl font-bold gradient-text">0</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <span className="text-text-dim text-sm">{t('dashboard.savedStrategies') || 'Saved Strategies'}</span>
          </div>
          <span className="text-2xl md:text-3xl font-bold gradient-text">0</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span className="text-text-dim text-sm">{t('dashboard.activeAlerts') || 'Active Alerts'}</span>
          </div>
          <span className="text-2xl md:text-3xl font-bold gradient-text">0</span>
        </div>
      </motion.div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 glass rounded-2xl p-5 md:p-6 border border-border">
          <h3 className="text-lg font-bold text-text mb-5">{t('dashboard.recentActivity')}</h3>
          <div className="space-y-1">
            {activities.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-accent-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-text text-sm">
                    {isRTL ? activity.actionAr : activity.action}
                  </p>
                  <span className="text-text-dim text-xs">
                    {isRTL ? timeAgoAr(activity.timestamp) : timeAgo(activity.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass rounded-2xl p-5 md:p-6 border border-border">
          <h3 className="text-lg font-bold text-text mb-5">{t('dashboard.quickActions') || 'Quick Actions'}</h3>
          <div className="flex flex-col gap-3">
            <Button href={`/${lang}/strategies`} variant="primary" className="w-full">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {t('dashboard.viewStrategies') || 'View Strategies'}
            </Button>
            <Button href={`/${lang}/pricing`} variant="secondary" className="w-full">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {t('dashboard.upgrade')}
            </Button>
            <Button href={`/${lang}/dashboard/settings`} variant="ghost" className="w-full">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('dashboard.settings')}
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
