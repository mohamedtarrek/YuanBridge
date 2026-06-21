'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  isBanned: boolean;
  bannedAt: string | null;
  banReason: string | null;
  createdAt: string;
  subscription?: { plan: string; status: string } | null;
}

export default function AdminUsersPage() {
  const { lang } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleBanToggle = async (user: User) => {
    const action = user.isBanned ? 'unban' : 'ban';
    const reason = !user.isBanned ? prompt(lang === 'ar' ? 'سبب الحظر:' : 'Ban reason:') : null;
    if (!user.isBanned && !reason) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: !user.isBanned, banReason: reason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(action === 'ban' ? 'User banned' : 'User unbanned');
        fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Role updated');
        fetchUsers();
      }
    } catch {
      toast.error('Failed');
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(lang === 'ar' ? `حذف ${email}؟` : `Delete ${email}?`)) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('User deleted');
        fetchUsers();
      }
    } catch {
      toast.error('Failed');
    }
  };

  const roleBadge = (role: string) => {
    const config: Record<string, string> = {
      SUPER_ADMIN: 'bg-accent-500/20 text-accent-500',
      ADMIN: 'bg-info/10 text-info',
      USER: 'bg-white/5 text-text-dim',
    };
    return config[role] || 'bg-white/5 text-text-dim';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold gradient-text">{lang === 'ar' ? 'إدارة المستخدمين' : 'Users Management'}</h1>
        <p className="text-text-dim text-sm">{total} {lang === 'ar' ? 'مستخدم' : 'users'}</p>
      </div>

      <div className="glass rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'ar' ? 'بحث بالاسم أو البريد...' : 'Search name or email...'} className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-border text-text text-sm focus:outline-none focus:border-accent-500/50" />
              <button type="submit" className="btn-primary px-4 py-2 rounded-xl text-sm">{lang === 'ar' ? 'بحث' : 'Search'}</button>
            </form>
            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="px-4 py-2 rounded-xl bg-white/5 border border-border text-text text-sm">
              <option value="">{lang === 'ar' ? 'جميع الأدوار' : 'All Roles'}</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                <th className="text-left py-3 px-4 text-text-dim font-medium">Email</th>
                <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الدور' : 'Role'}</th>
                <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الاشتراك' : 'Sub'}</th>
                <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th className="text-right py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center"><div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-text-dim">{lang === 'ar' ? 'لا يوجد مستخدمين' : 'No users found'}</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-accent-500/20 text-accent-500 text-xs font-bold flex items-center justify-center">
                        {(u.name || '?').charAt(0)}
                      </div>
                      <span className="text-text font-medium">{u.name || '—'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-text-dim">{u.email}</td>
                  <td className="py-3 px-4">
                    <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)} className={`px-2 py-0.5 rounded-lg text-xs font-semibold border-0 cursor-pointer ${roleBadge(u.role)}`}>
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    {u.isBanned ? (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-danger/10 text-danger">Banned</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-success/10 text-success">Active</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-text-dim text-xs">
                    {u.subscription ? `${u.subscription.plan} (${u.subscription.status})` : '—'}
                  </td>
                  <td className="py-3 px-4 text-text-dim text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleBanToggle(u)} className={`px-2 py-1 rounded-lg text-xs font-semibold ${u.isBanned ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-warning/10 text-warning hover:bg-warning/20'} transition-colors`}>
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </button>
                      <button onClick={() => handleDelete(u.id, u.email)} className="px-2 py-1 rounded-lg bg-danger/10 text-danger text-xs font-semibold hover:bg-danger/20 transition-colors">
                        {lang === 'ar' ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl bg-white/5 border border-border text-text text-sm disabled:opacity-50">{lang === 'ar' ? 'السابق' : 'Previous'}</button>
            <span className="text-text-dim text-sm">{lang === 'ar' ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-xl bg-white/5 border border-border text-text text-sm disabled:opacity-50">{lang === 'ar' ? 'التالي' : 'Next'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
