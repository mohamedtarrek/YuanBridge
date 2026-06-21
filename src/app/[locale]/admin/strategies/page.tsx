'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import toast from 'react-hot-toast';

interface Strategy {
  id: string;
  title: string;
  titleAr: string | null;
  slug: string;
  currencyPair: string;
  direction: 'BUY' | 'SELL';
  status: 'DRAFT' | 'PUBLISHED' | 'FEATURED';
  confidence: number;
  isPremium: boolean;
  publishedAt: string | null;
  createdAt: string;
  category?: { id: string; name: string; nameAr: string } | null;
  createdBy?: { id: string; name: string | null; email: string } | null;
}

export default function AdminStrategiesPage() {
  const { lang } = useLanguage();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchStrategies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/strategies?${params}`);
      const data = await res.json();
      if (data.success) {
        setStrategies(data.strategies);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch {
      toast.error('Failed to load strategies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStrategies(); }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStrategies();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(lang === 'ar' ? `هل أنت متأكد من حذف "${title}"؟` : `Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/strategies/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted');
        fetchStrategies();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/strategies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(lang === 'ar' ? 'تم التحديث' : 'Updated');
        fetchStrategies();
      }
    } catch {
      toast.error('Failed to update');
    }
  };

  const statusBadge = (status: string) => {
    const config: Record<string, string> = {
      DRAFT: 'bg-warning/10 text-warning',
      PUBLISHED: 'bg-success/10 text-success',
      FEATURED: 'bg-accent-500/20 text-accent-500',
    };
    return config[status] || 'bg-white/5 text-text-dim';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">
            {lang === 'ar' ? 'إدارة الاستراتيجيات' : 'Strategies Management'}
          </h1>
          <p className="text-text-dim text-sm">{total} {lang === 'ar' ? 'استراتيجية' : 'strategies'}</p>
        </div>
        <a href={`/${lang}/admin/strategies/new`} className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {lang === 'ar' ? 'إضافة استراتيجية' : 'Add Strategy'}
        </a>
      </div>

      <div className="glass rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-border text-text text-sm focus:outline-none focus:border-accent-500/50"
              />
              <button type="submit" className="btn-primary px-4 py-2 rounded-xl text-sm">
                {lang === 'ar' ? 'بحث' : 'Search'}
              </button>
            </form>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 rounded-xl bg-white/5 border border-border text-text text-sm focus:outline-none focus:border-accent-500/50"
            >
              <option value="">{lang === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
              <option value="DRAFT">{lang === 'ar' ? 'مسودة' : 'Draft'}</option>
              <option value="PUBLISHED">{lang === 'ar' ? 'منشور' : 'Published'}</option>
              <option value="FEATURED">{lang === 'ar' ? 'مميز' : 'Featured'}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'العنوان' : 'Title'}</th>
                <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الزوج' : 'Pair'}</th>
                <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الاتجاه' : 'Dir'}</th>
                <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الثقة' : 'Conf.'}</th>
                <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th className="text-right py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-dim">
                    <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : strategies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-dim">
                    {lang === 'ar' ? 'لا توجد استراتيجيات' : 'No strategies found'}
                  </td>
                </tr>
              ) : strategies.map((s) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="text-text font-medium truncate max-w-[200px]">{lang === 'ar' && s.titleAr ? s.titleAr : s.title}</div>
                  </td>
                  <td className="py-3 px-4 text-text-dim font-mono">{s.currencyPair}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                      s.direction === 'BUY' ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
                    }`}>
                      {s.direction}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={s.status}
                      onChange={e => handleStatusChange(s.id, e.target.value)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-semibold border-0 cursor-pointer ${statusBadge(s.status)}`}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="FEATURED">Featured</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-text-dim">{s.confidence}%</td>
                  <td className="py-3 px-4 text-text-dim text-xs">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/${lang}/admin/strategies/${s.id}`}
                        className="px-3 py-1.5 rounded-lg bg-accent-500/10 text-accent-500 text-xs font-semibold hover:bg-accent-500/20 transition-colors"
                      >
                        {lang === 'ar' ? 'تعديل' : 'Edit'}
                      </a>
                      <button
                        onClick={() => handleDelete(s.id, s.title)}
                        className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-semibold hover:bg-danger/20 transition-colors"
                      >
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
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white/5 border border-border text-text text-sm disabled:opacity-50"
            >
              {lang === 'ar' ? 'السابق' : 'Previous'}
            </button>
            <span className="text-text-dim text-sm">
              {lang === 'ar' ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-white/5 border border-border text-text text-sm disabled:opacity-50"
            >
              {lang === 'ar' ? 'التالي' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
