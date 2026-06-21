'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
  adminProfile?: {
    isActive: boolean;
    isPermanent: boolean;
    expiresAt: string | null;
  } | null;
  _count?: { adminLogs: number };
}

export default function AdminAdminsPage() {
  const { lang } = useLanguage();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', isPermanent: true, expiresAt: '' });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/admins');
      const data = await res.json();
      if (data.success) setAdmins(data.admins);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(lang === 'ar' ? 'تم إنشاء المشرف' : 'Admin created');
        setShowCreate(false);
        setCreateForm({ name: '', email: '', password: '', isPermanent: true, expiresAt: '' });
        fetchAdmins();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/admins/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isActive ? 'Admin suspended' : 'Admin activated');
        fetchAdmins();
      }
    } catch {
      toast.error('Failed');
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(lang === 'ar' ? `حذف المشرف ${email}؟` : `Delete admin ${email}?`)) return;
    try {
      const res = await fetch(`/api/admin/admins/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Deleted');
        fetchAdmins();
      }
    } catch {
      toast.error('Failed');
    }
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-border text-text text-sm focus:outline-none focus:border-accent-500/50';

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">{lang === 'ar' ? 'إدارة المشرفين' : 'Admins Management'}</h1>
          <p className="text-text-dim text-sm">{lang === 'ar' ? 'إدارة المشرفين (المشرف العام فقط)' : 'Manage admins (Super Admin only)'}</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {lang === 'ar' ? 'إضافة مشرف' : 'Add Admin'}
        </button>
      </div>

      {showCreate && (
        <div className="glass rounded-2xl p-5 border border-border mb-6">
          <h3 className="text-lg font-bold text-text mb-4">{lang === 'ar' ? 'إنشاء مشرف جديد' : 'Create New Admin'}</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-dim text-xs font-medium mb-1.5">{lang === 'ar' ? 'الاسم' : 'Name'}</label>
              <input type="text" value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} className={inputClass} required />
            </div>
            <div>
              <label className="block text-text-dim text-xs font-medium mb-1.5">Email</label>
              <input type="email" value={createForm.email} onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))} className={inputClass} required />
            </div>
            <div>
              <label className="block text-text-dim text-xs font-medium mb-1.5">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
              <input type="password" value={createForm.password} onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))} className={inputClass} required />
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input type="checkbox" id="isPermanent" checked={createForm.isPermanent} onChange={e => setCreateForm(p => ({ ...p, isPermanent: e.target.checked }))} className="w-4 h-4" />
              <label htmlFor="isPermanent" className="text-text text-sm">{lang === 'ar' ? 'دائم' : 'Permanent'}</label>
            </div>
            {!createForm.isPermanent && (
              <div>
                <label className="block text-text-dim text-xs font-medium mb-1.5">{lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiration Date'}</label>
                <input type="datetime-local" value={createForm.expiresAt} onChange={e => setCreateForm(p => ({ ...p, expiresAt: e.target.value }))} className={inputClass} />
              </div>
            )}
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost px-4 py-2 rounded-xl text-sm">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
              <button type="submit" className="btn-primary px-6 py-2 rounded-xl text-sm">{lang === 'ar' ? 'إنشاء' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                <th className="text-left py-3 px-4 text-text-dim font-medium">Email</th>
                <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الدور' : 'Role'}</th>
                <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'دائم' : 'Permanent'}</th>
                <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الإجراءات' : 'Logs'}</th>
                <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th className="text-right py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center"><div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-text-dim">{lang === 'ar' ? 'لا يوجد مشرفين' : 'No admins'}</td></tr>
              ) : admins.map((a) => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-accent-500/20 text-accent-500 text-xs font-bold flex items-center justify-center">{(a.name || '?').charAt(0)}</div>
                      <span className="text-text font-medium">{a.name || '—'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-text-dim">{a.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${a.role === 'SUPER_ADMIN' ? 'bg-accent-500/20 text-accent-500' : 'bg-info/10 text-info'}`}>{a.role}</span>
                  </td>
                  <td className="py-3 px-4">
                    {a.adminProfile?.isActive === false ? (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-danger/10 text-danger">{lang === 'ar' ? 'موقوف' : 'Suspended'}</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-success/10 text-success">{lang === 'ar' ? 'نشط' : 'Active'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-text-dim text-xs">{a.adminProfile?.isPermanent ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No')}</td>
                  <td className="py-3 px-4 text-text-dim text-xs">{a._count?.adminLogs || 0}</td>
                  <td className="py-3 px-4 text-text-dim text-xs">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleToggleActive(a.id, a.adminProfile?.isActive ?? true)} className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${a.adminProfile?.isActive === false ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-warning/10 text-warning hover:bg-warning/20'}`}>
                        {a.adminProfile?.isActive === false ? (lang === 'ar' ? 'تفعيل' : 'Activate') : (lang === 'ar' ? 'إيقاف' : 'Suspend')}
                      </button>
                      <button onClick={() => handleDelete(a.id, a.email)} className="px-2 py-1 rounded-lg bg-danger/10 text-danger text-xs font-semibold hover:bg-danger/20 transition-colors">{lang === 'ar' ? 'حذف' : 'Delete'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
