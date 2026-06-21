'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminProfilePage() {
  const { lang } = useLanguage();
  const { data: session } = useSession();

  const [form, setForm] = useState({
    name: '',
    language: 'ar',
    theme: 'dark',
    emailNotifications: true,
    pushNotifications: true,
  });

  useEffect(() => {
    if (session?.user) {
      setForm(prev => ({ ...prev, name: session.user.name || '' }));
    }
  }, [session]);

  const handleSave = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/admin/users/${session.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) toast.success(lang === 'ar' ? 'تم الحفظ' : 'Saved');
      else toast.error(data.message);
    } catch { toast.error('Failed'); }
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-border text-text text-sm focus:outline-none focus:border-accent-500/50';

  return (
    <div>
      <h1 className="text-2xl font-bold gradient-text mb-6">{lang === 'ar' ? 'الملف الشخصي' : 'Profile'}</h1>

      <div className="max-w-2xl space-y-6">
        <div className="glass rounded-2xl p-5 border border-border">
          <h3 className="text-lg font-bold text-text mb-4">{lang === 'ar' ? 'معلومات الحساب' : 'Account Info'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-text-dim text-xs font-medium mb-1.5">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
              <input type="email" value={session?.user?.email || ''} disabled className={`${inputClass} opacity-50`} />
            </div>
            <div>
              <label className="block text-text-dim text-xs font-medium mb-1.5">{lang === 'ar' ? 'الاسم' : 'Name'}</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-text-dim text-xs font-medium mb-1.5">{lang === 'ar' ? 'اللغة' : 'Language'}</label>
              <select value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))} className={inputClass}>
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-text-dim text-xs font-medium mb-1.5">{lang === 'ar' ? 'السمة' : 'Theme'}</label>
              <select value={form.theme} onChange={e => setForm(p => ({ ...p, theme: e.target.value }))} className={inputClass}>
                <option value="dark">{lang === 'ar' ? 'داكن' : 'Dark'}</option>
                <option value="light">{lang === 'ar' ? 'فاتح' : 'Light'}</option>
              </select>
            </div>
          </div>
          <button onClick={handleSave} className="btn-primary mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold">
            {lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
          </button>
        </div>

        <div className="glass rounded-2xl p-5 border border-border">
          <h3 className="text-lg font-bold text-text mb-4">{lang === 'ar' ? 'الإشعارات' : 'Notifications'}</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.emailNotifications} onChange={e => setForm(p => ({ ...p, emailNotifications: e.target.checked }))} className="w-4 h-4 rounded border-border" />
              <span className="text-text text-sm">{lang === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.pushNotifications} onChange={e => setForm(p => ({ ...p, pushNotifications: e.target.checked }))} className="w-4 h-4 rounded border-border" />
              <span className="text-text text-sm">{lang === 'ar' ? 'إشعارات المتصفح' : 'Push Notifications'}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
