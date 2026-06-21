'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { motion } from 'framer-motion';

export default function AdminAnalyticsPage() {
  const { lang } = useLanguage();
  const [analytics, setAnalytics] = useState<any>(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?period=${period}`)
      .then(r => r.json())
      .then(data => { if (data.success) setAnalytics(data.analytics); })
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold gradient-text">{lang === 'ar' ? 'التحليلات' : 'Analytics'}</h1>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="px-4 py-2 rounded-xl bg-white/5 border border-border text-text text-sm">
          <option value="week">{lang === 'ar' ? 'أسبوع' : 'Week'}</option>
          <option value="month">{lang === 'ar' ? 'شهر' : 'Month'}</option>
          <option value="year">{lang === 'ar' ? 'سنة' : 'Year'}</option>
          <option value="all">{lang === 'ar' ? 'الكل' : 'All Time'}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-5 border border-border">
          <h3 className="text-lg font-bold text-text mb-4">{lang === 'ar' ? 'توزيع الأزواج' : 'Pair Distribution'}</h3>
          <div className="space-y-2">
            {analytics?.pairDistribution?.slice(0, 10).map((p: any) => (
              <div key={p.currencyPair} className="flex items-center justify-between py-1">
                <span className="text-text text-sm font-mono">{p.currencyPair}</span>
                <span className="text-text-dim text-sm">{p._count.id}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-border">
          <h3 className="text-lg font-bold text-text mb-4">{lang === 'ar' ? 'حالة الاستراتيجيات' : 'Strategy Status'}</h3>
          <div className="space-y-3">
            {analytics?.statusDistribution?.map((s: any) => (
              <div key={s.status} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                  s.status === 'PUBLISHED' ? 'bg-success/10 text-success' :
                  s.status === 'FEATURED' ? 'bg-accent-500/20 text-accent-500' :
                  'bg-warning/10 text-warning'
                }`}>{s.status}</span>
                <span className="text-text font-semibold">{s._count.id}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 glass rounded-2xl p-5 border border-border">
          <h3 className="text-lg font-bold text-text mb-4">{lang === 'ar' ? 'آخر الاستراتيجيات' : 'Recent Strategies'}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-text-dim font-medium">{lang === 'ar' ? 'العنوان' : 'Title'}</th>
                  <th className="text-left py-2 px-3 text-text-dim font-medium">{lang === 'ar' ? 'الزوج' : 'Pair'}</th>
                  <th className="text-left py-2 px-3 text-text-dim font-medium">{lang === 'ar' ? 'الاتجاه' : 'Dir'}</th>
                  <th className="text-left py-2 px-3 text-text-dim font-medium">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="text-left py-2 px-3 text-text-dim font-medium">{lang === 'ar' ? 'الثقة' : 'Conf.'}</th>
                  <th className="text-left py-2 px-3 text-text-dim font-medium">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.recentStrategies?.map((s: any) => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-white/5">
                    <td className="py-2 px-3 text-text truncate max-w-[200px]">{s.title}</td>
                    <td className="py-2 px-3 text-text-dim font-mono">{s.currencyPair}</td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${s.direction === 'BUY' ? 'text-success bg-success/10' : 'text-danger bg-danger/10'}`}>{s.direction}</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                        s.status === 'PUBLISHED' ? 'bg-success/10 text-success' :
                        s.status === 'FEATURED' ? 'bg-accent-500/20 text-accent-500' : 'bg-warning/10 text-warning'
                      }`}>{s.status}</span>
                    </td>
                    <td className="py-2 px-3 text-text-dim">{s.confidence}%</td>
                    <td className="py-2 px-3 text-text-dim text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
