'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AdminSubscriptionsPage() {
  const { lang } = useLanguage();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/subscriptions?page=${page}&limit=20`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setSubscriptions(data.subscriptions);
          setTotal(data.total);
          setTotalPages(data.totalPages);
        }
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold gradient-text">{lang === 'ar' ? 'الاشتراكات' : 'Subscriptions'}</h1>
        <p className="text-text-dim text-sm">{total} {lang === 'ar' ? 'اشتراك' : 'subscriptions'}</p>
      </div>

      <div className="glass rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'المستخدم' : 'User'}</th>
              <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الخطة' : 'Plan'}</th>
              <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
              <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'تاريخ البدء' : 'Start'}</th>
              <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'تاريخ الانتهاء' : 'End'}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center"><div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
            ) : subscriptions.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-text-dim">{lang === 'ar' ? 'لا توجد اشتراكات' : 'No subscriptions'}</td></tr>
            ) : subscriptions.map((s: any) => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-white/5">
                <td className="py-3 px-4 text-text">{s.user?.name || s.user?.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                    s.plan === 'LIFETIME' ? 'bg-purple-500/20 text-purple-400' :
                    s.plan === 'YEARLY' ? 'bg-blue-500/20 text-blue-400' :
                    s.plan === 'QUARTERLY' ? 'bg-info/10 text-info' :
                    s.plan === 'MONTHLY' || s.plan === 'PREMIUM' ? 'bg-accent-500/20 text-accent-500' : 'bg-white/5 text-text-dim'
                  }`}>{s.plan}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                    s.status === 'ACTIVE' ? 'bg-success/10 text-success' :
                    s.status === 'EXPIRED' ? 'bg-danger/10 text-danger' :
                    s.status === 'TRIALING' ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'
                  }`}>{s.status}</span>
                </td>
                <td className="py-3 px-4 text-text-dim text-xs">{new Date(s.startedAt).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-text-dim text-xs">{s.endsAt ? new Date(s.endsAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl bg-white/5 border border-border text-text text-sm disabled:opacity-50">Previous</button>
            <span className="text-text-dim text-sm">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-xl bg-white/5 border border-border text-text text-sm disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
