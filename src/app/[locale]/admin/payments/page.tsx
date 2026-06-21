'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AdminPaymentsPage() {
  const { lang } = useLanguage();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/subscriptions?limit=50')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const allPayments = data.subscriptions.flatMap((s: any) =>
            (s.payments || []).map((p: any) => ({ ...p, userName: s.user?.name || s.user?.email }))
          ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setPayments(allPayments);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold gradient-text mb-6">{lang === 'ar' ? 'المدفوعات' : 'Payments'}</h1>
      <div className="glass rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'المستخدم' : 'User'}</th>
              <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
              <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
              <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'المزود' : 'Provider'}</th>
              <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center"><div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-text-dim">{lang === 'ar' ? 'لا توجد مدفوعات' : 'No payments'}</td></tr>
            ) : payments.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-white/5">
                <td className="py-3 px-4 text-text">{p.userName}</td>
                <td className="py-3 px-4 text-text font-semibold">${p.amount?.toFixed(2)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                    p.status === 'SUCCEEDED' ? 'bg-success/10 text-success' :
                    p.status === 'FAILED' ? 'bg-danger/10 text-danger' :
                    p.status === 'REFUNDED' ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'
                  }`}>{p.status}</span>
                </td>
                <td className="py-3 px-4 text-text-dim text-xs">{p.provider}</td>
                <td className="py-3 px-4 text-text-dim text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
