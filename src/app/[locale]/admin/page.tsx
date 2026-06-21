'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface DashboardStats {
  totalUsers: number;
  totalPremiumUsers: number;
  totalFreeUsers: number;
  totalAdmins: number;
  totalStrategies: number;
  publishedStrategies: number;
  draftStrategies: number;
  featuredStrategies: number;
  totalCategories: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalPayments: number;
  revenueThisMonth: number;
  usersToday: number;
  strategiesCreatedToday: number;
  totalPremiumStrategies: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function AdminDashboardPage() {
  const { lang } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        if (data.success) setStats(data.stats);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { key: 'totalUsers', label: lang === 'ar' ? 'إجمالي المستخدمين' : 'Total Users', value: stats?.totalUsers || 0, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', color: 'text-info', bg: 'bg-info/10' },
    { key: 'totalPremiumUsers', label: lang === 'ar' ? 'المستخدمون المميزون' : 'Premium Users', value: stats?.totalPremiumUsers || 0, icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', color: 'text-accent-500', bg: 'bg-accent-500/10' },
    { key: 'totalFreeUsers', label: lang === 'ar' ? 'المستخدمون المجانيون' : 'Free Users', value: stats?.totalFreeUsers || 0, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-text-dim', bg: 'bg-white/5' },
    { key: 'activeSubscriptions', label: lang === 'ar' ? 'الاشتراكات النشطة' : 'Active Subs', value: stats?.activeSubscriptions || 0, icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', color: 'text-success', bg: 'bg-success/10' },
    { key: 'publishedStrategies', label: lang === 'ar' ? 'استراتيجيات منشورة' : 'Published', value: stats?.publishedStrategies || 0, icon: 'M5 13l4 4L19 7', color: 'text-success', bg: 'bg-success/10' },
    { key: 'draftStrategies', label: lang === 'ar' ? 'مسودة' : 'Drafts', value: stats?.draftStrategies || 0, icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z', color: 'text-text-dim', bg: 'bg-white/5' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h1 className="text-2xl md:text-4xl font-bold gradient-text mb-2">
          {lang === 'ar' ? 'لوحة الإدارة' : 'Admin Dashboard'}
        </h1>
        <p className="text-text-muted">
          {lang === 'ar' ? 'مراقبة وإدارة المنصة' : 'Monitor and manage your platform'}
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.key} className="glass-card rounded-2xl p-5 border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
              <span className="text-text-dim text-xs">{stat.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold gradient-text">{stat.value}</span>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="glass rounded-2xl p-5 md:p-6 border border-border">
          <h3 className="text-lg font-bold text-text mb-4">
            {lang === 'ar' ? 'إحصائيات سريعة' : 'Quick Statistics'}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-text-dim">{lang === 'ar' ? 'إجمالي الاستراتيجيات' : 'Total Strategies'}</span>
              <span className="text-text font-semibold">{stats?.totalStrategies || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-text-dim">{lang === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}</span>
              <span className="text-text font-semibold">{stats?.totalUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-text-dim">{lang === 'ar' ? 'المشرفون' : 'Admins'}</span>
              <span className="text-text font-semibold">{stats?.totalAdmins || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-text-dim">{lang === 'ar' ? 'التصنيفات' : 'Categories'}</span>
              <span className="text-text font-semibold">{stats?.totalCategories || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-text-dim">{lang === 'ar' ? 'المدفوعات' : 'Payments'}</span>
              <span className="text-text font-semibold">{stats?.totalPayments || 0}</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass rounded-2xl p-5 md:p-6 border border-border">
          <h3 className="text-lg font-bold text-text mb-4">
            {lang === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
          </h3>
          <div className="flex flex-col gap-3">
            <a href={`/${lang}/admin/strategies/new`} className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {lang === 'ar' ? 'إنشاء استراتيجية جديدة' : 'Create New Strategy'}
            </a>
            <a href={`/${lang}/admin/strategies`} className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {lang === 'ar' ? 'إدارة الاستراتيجيات' : 'Manage Strategies'}
            </a>
            <a href={`/${lang}/admin/users`} className="btn-ghost inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              {lang === 'ar' ? 'إدارة المستخدمين' : 'Manage Users'}
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
