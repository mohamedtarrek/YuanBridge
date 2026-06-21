'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Notification } from '@/lib/types';

const allNotifications: Notification[] = [
  { id: '1', userId: 'u1', title: 'New Strategy Published', titleAr: 'استراتيجية جديدة منشورة', message: 'A new EUR/USD Bullish Breakout strategy has been published with 87% confidence.', messageAr: 'تم نشر استراتيجية جديدة لليورو مقابل الدولار بنسبة ثقة 87%.', type: 'strategy', read: false, createdAt: new Date(Date.now() - 600000).toISOString() },
  { id: '2', userId: 'u1', title: 'Subscription Renewed', titleAr: 'تم تجديد الاشتراك', message: 'Your Premium subscription has been successfully renewed until June 21, 2026.', messageAr: 'تم تجديد اشتراكك المميز بنجاح حتى 21 يونيو 2026.', type: 'billing', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', userId: 'u1', title: 'Price Alert: EUR/USD', titleAr: 'تنبيه سعر: EUR/USD', message: 'EUR/USD has reached your alert level at 1.08500. Current price: 1.08480.', messageAr: 'وصل EUR/USD إلى مستوى التنبيه الخاص بك عند 1.08500. السعر الحالي: 1.08480.', type: 'alert', read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '4', userId: 'u1', title: 'System Maintenance', titleAr: 'صيانة النظام', message: 'Scheduled maintenance will occur on June 25, 2026 from 02:00 to 04:00 UTC.', messageAr: 'ستتم الصيانة المجدولة في 25 يونيو 2026 من الساعة 02:00 إلى 04:00 UTC.', type: 'system', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '5', userId: 'u1', title: 'Strategy Updated', titleAr: 'تم تحديث الاستراتيجية', message: 'The AUD/USD Support Bounce strategy has been updated with new technical analysis.', messageAr: 'تم تحديث استراتيجية ارتداد الدعم للاسترالي مقابل الدولار بتحليل فني جديد.', type: 'strategy', read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: '6', userId: 'u1', title: 'Payment Confirmed', titleAr: 'تأكيد الدفع', message: 'Your payment of $14.99 for Premium subscription has been confirmed.', messageAr: 'تم تأكيد دفعتك البالغة 14.99 دولاراً للاشتراك المميز.', type: 'billing', read: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
];

type FilterType = 'all' | 'strategy' | 'billing' | 'system' | 'alert';

const filterTabs: { key: FilterType; label: string; labelAr: string }[] = [
  { key: 'all', label: 'All', labelAr: 'الكل' },
  { key: 'strategy', label: 'Strategy', labelAr: 'استراتيجيات' },
  { key: 'billing', label: 'Billing', labelAr: 'فواتير' },
  { key: 'system', label: 'System', labelAr: 'النظام' },
  { key: 'alert', label: 'Alert', labelAr: 'تنبيهات' },
];

function NotificationIcon({ type }: { type: Notification['type'] }) {
  const icons: Record<string, { path: string; bg: string; color: string }> = {
    strategy: {
      path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      bg: 'bg-info/10', color: 'text-info',
    },
    billing: {
      path: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      bg: 'bg-success/10', color: 'text-success',
    },
    system: {
      path: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      bg: 'bg-warning/10', color: 'text-warning',
    },
    alert: {
      path: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      bg: 'bg-danger/10', color: 'text-danger',
    },
  };
  const icon = icons[type];
  return (
    <div className={`w-10 h-10 rounded-xl ${icon.bg} ${icon.color} flex items-center justify-center flex-shrink-0`}>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon.path} />
      </svg>
    </div>
  );
}

function formatDate(dateStr: string, lang: string) {
  const date = new Date(dateStr);
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (lang === 'ar') {
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  }

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
} as const;
const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
} as const;

export default function NotificationsPage() {
  const { t, lang, isRTL } = useLanguage();
  const [notifications, setNotifications] = useState(allNotifications);
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-1">{t('dashboard.notifications')}</h2>
          <p className="text-text-muted text-sm">
            {lang === 'ar'
              ? `${unreadCount} إشعار غير مقروء`
              : `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="px-4 py-2 rounded-xl text-sm font-semibold btn-secondary"
          >
            {t('dashboard.markAllRead') || 'Mark All as Read'}
          </button>
        )}
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 mb-6">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === tab.key
                ? 'bg-accent-500/20 text-accent-500 border border-accent-500/40 shadow-lg shadow-accent-500/5'
                : 'glass text-text-muted border border-border hover:border-border-light hover:text-text'
            }`}
          >
            {lang === 'ar' ? tab.labelAr : tab.label}
          </button>
        ))}
      </motion.div>

      {/* Notifications List */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="glass rounded-2xl p-12 text-center border border-border"
            >
              <svg className="w-16 h-16 text-text-dim mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-text-muted text-lg">{t('dashboard.noNotifications') || 'No notifications'}</p>
            </motion.div>
          ) : (
            filtered.map((notification) => (
              <motion.div
                key={notification.id}
                layout
                variants={itemVariants}
                onClick={() => markRead(notification.id)}
                className={`glass rounded-2xl p-4 md:p-5 border transition-all cursor-pointer ${
                  notification.read
                    ? 'border-border opacity-70'
                    : 'border-accent-500/20 bg-accent-500/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  <NotificationIcon type={notification.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-sm ${notification.read ? 'text-text-muted' : 'text-text font-semibold'}`}>
                        {isRTL ? notification.titleAr : notification.title}
                      </h4>
                      <span className="text-text-dim text-xs flex-shrink-0">
                        {formatDate(notification.createdAt, lang)}
                      </span>
                    </div>
                    <p className="text-text-dim text-xs leading-relaxed line-clamp-2">
                      {isRTL ? notification.messageAr : notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-accent-500 flex-shrink-0 mt-2" />
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
