'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const actionLabels: Record<string, { en: string; ar: string }> = {
  CREATE_STRATEGY: { en: 'Create Strategy', ar: 'إنشاء استراتيجية' },
  UPDATE_STRATEGY: { en: 'Update Strategy', ar: 'تحديث استراتيجية' },
  DELETE_STRATEGY: { en: 'Delete Strategy', ar: 'حذف استراتيجية' },
  CREATE_USER: { en: 'Create User', ar: 'إنشاء مستخدم' },
  UPDATE_USER: { en: 'Update User', ar: 'تحديث مستخدم' },
  DELETE_USER: { en: 'Delete User', ar: 'حذف مستخدم' },
  BAN_USER: { en: 'Ban User', ar: 'حظر مستخدم' },
  UNBAN_USER: { en: 'Unban User', ar: 'إلغاء حظر مستخدم' },
  CREATE_ADMIN: { en: 'Create Admin', ar: 'إنشاء مشرف' },
  DELETE_ADMIN: { en: 'Delete Admin', ar: 'حذف مشرف' },
  SUSPEND_ADMIN: { en: 'Suspend Admin', ar: 'إيقاف مشرف' },
  ACTIVATE_ADMIN: { en: 'Activate Admin', ar: 'تفعيل مشرف' },
  CHANGE_USER_ROLE: { en: 'Change Role', ar: 'تغيير الدور' },
  RESET_PASSWORD: { en: 'Reset Password', ar: 'إعادة تعيين كلمة المرور' },
  CREATE_CATEGORY: { en: 'Create Category', ar: 'إنشاء تصنيف' },
  UPDATE_CATEGORY: { en: 'Update Category', ar: 'تحديث تصنيف' },
  DELETE_CATEGORY: { en: 'Delete Category', ar: 'حذف تصنيف' },
  UPDATE_SETTINGS: { en: 'Update Settings', ar: 'تحديث الإعدادات' },
};

export default function AdminLogsPage() {
  const { lang } = useLanguage();
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (actionFilter) params.set('action', actionFilter);

    fetch(`/api/admin/logs?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setLogs(data.logs);
          setTotal(data.total);
          setTotalPages(data.totalPages);
        }
      })
      .finally(() => setLoading(false));
  }, [page, actionFilter]);

  const getLabel = (action: string) => {
    const mapped = actionLabels[action];
    return mapped ? (lang === 'ar' ? mapped.ar : mapped.en) : action;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">{lang === 'ar' ? 'سجل الإجراءات' : 'Audit Log'}</h1>
          <p className="text-text-dim text-sm">{total} {lang === 'ar' ? 'إجراء' : 'entries'}</p>
        </div>
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }} className="px-4 py-2 rounded-xl bg-white/5 border border-border text-text text-sm">
          <option value="">{lang === 'ar' ? 'جميع الإجراءات' : 'All Actions'}</option>
          {Object.keys(actionLabels).map(a => (
            <option key={a} value={a}>{actionLabels[a].en}</option>
          ))}
        </select>
      </div>

      <div className="glass rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'المشرف' : 'Admin'}</th>
              <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الإجراء' : 'Action'}</th>
              <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'التفاصيل' : 'Details'}</th>
              <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-12 text-center"><div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={4} className="py-12 text-center text-text-dim">{lang === 'ar' ? 'لا توجد إجراءات' : 'No logs'}</td></tr>
            ) : logs.map((log: any) => (
              <tr key={log.id} className="border-b border-border/50 hover:bg-white/5">
                <td className="py-3 px-4">
                  <span className="text-text">{log.admin?.name || log.admin?.email}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-accent-500/10 text-accent-500">
                    {getLabel(log.action)}
                  </span>
                </td>
                <td className="py-3 px-4 text-text-dim text-xs max-w-[300px] truncate">{log.details}</td>
                <td className="py-3 px-4 text-text-dim text-xs">{new Date(log.createdAt).toLocaleString()}</td>
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
