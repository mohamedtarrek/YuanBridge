'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  order: number;
  isActive: boolean;
  _count?: { strategies: number };
}

export default function AdminCategoriesPage() {
  const { lang } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', nameAr: '', slug: '', description: '', descriptionAr: '', order: '0', isActive: true });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => {
    setForm({ name: '', nameAr: '', slug: '', description: '', descriptionAr: '', order: '0', isActive: true });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name, nameAr: cat.nameAr, slug: cat.slug, description: '', descriptionAr: '', order: String(cat.order), isActive: cat.isActive });
    setEditing(cat.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...form, order: parseInt(form.order) };
    const url = editing ? `/api/admin/categories/${editing}` : '/api/admin/categories';
    const method = editing ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        toast.success(editing ? 'Updated' : 'Created');
        resetForm();
        fetchCategories();
      } else toast.error(data.message);
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast.success('Deleted'); fetchCategories(); }
    } catch { toast.error('Failed'); }
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-border text-text text-sm focus:outline-none focus:border-accent-500/50';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold gradient-text">{lang === 'ar' ? 'التصنيفات' : 'Categories'}</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold">{showForm ? 'Cancel' : (lang === 'ar' ? 'إضافة' : 'Add')}</button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-5 border border-border mb-6">
          <h3 className="text-lg font-bold text-text mb-4">{editing ? (lang === 'ar' ? 'تعديل تصنيف' : 'Edit Category') : (lang === 'ar' ? 'تصنيف جديد' : 'New Category')}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-dim text-xs font-medium mb-1.5">{lang === 'ar' ? 'الاسم' : 'Name'} *</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputClass} required />
            </div>
            <div>
              <label className="block text-text-dim text-xs font-medium mb-1.5">{lang === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'} *</label>
              <input type="text" value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))} className={inputClass} required />
            </div>
            <div>
              <label className="block text-text-dim text-xs font-medium mb-1.5">Slug *</label>
              <input type="text" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} className={inputClass} required />
            </div>
            <div>
              <label className="block text-text-dim text-xs font-medium mb-1.5">{lang === 'ar' ? 'الترتيب' : 'Order'}</label>
              <input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: e.target.value }))} className={inputClass} />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4" />
              <label htmlFor="isActive" className="text-text text-sm">{lang === 'ar' ? 'نشط' : 'Active'}</label>
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={resetForm} className="btn-ghost px-4 py-2 rounded-xl text-sm">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
              <button type="submit" className="btn-primary px-6 py-2 rounded-xl text-sm">{editing ? (lang === 'ar' ? 'تحديث' : 'Update') : (lang === 'ar' ? 'إنشاء' : 'Create')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
              <th className="text-left py-3 px-4 text-text-dim font-medium">Slug</th>
              <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الترتيب' : 'Order'}</th>
              <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
              <th className="text-left py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'الاستراتيجيات' : 'Strategies'}</th>
              <th className="text-right py-3 px-4 text-text-dim font-medium">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center"><div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
            ) : categories.map(c => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-white/5">
                <td className="py-3 px-4 text-text font-medium">{lang === 'ar' ? c.nameAr : c.name}</td>
                <td className="py-3 px-4 text-text-dim font-mono text-xs">{c.slug}</td>
                <td className="py-3 px-4 text-text-dim">{c.order}</td>
                <td className="py-3 px-4">{c.isActive ? <span className="text-success text-xs font-semibold">{lang === 'ar' ? 'نشط' : 'Active'}</span> : <span className="text-danger text-xs font-semibold">{lang === 'ar' ? 'غير نشط' : 'Inactive'}</span>}</td>
                <td className="py-3 px-4 text-text-dim">{c._count?.strategies || 0}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => handleEdit(c)} className="px-2 py-1 rounded-lg bg-accent-500/10 text-accent-500 text-xs font-semibold mr-1">Edit</button>
                  <button onClick={() => handleDelete(c.id, c.name)} className="px-2 py-1 rounded-lg bg-danger/10 text-danger text-xs font-semibold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
