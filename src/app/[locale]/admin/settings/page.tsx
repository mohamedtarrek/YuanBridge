'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { lang } = useLanguage();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => { if (data.success) setSettings(data.settings); })
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold gradient-text mb-6">{lang === 'ar' ? 'الإعدادات' : 'Settings'}</h1>
      <div className="glass rounded-2xl p-5 border border-border">
        <p className="text-text-dim text-sm mb-6">
          {lang === 'ar' ? 'إعدادات التطبيق العامة. يمكنك إضافة وإدارة إعدادات التطبيق هنا.' : 'General application settings. You can manage app settings here.'}
        </p>
        <div className="space-y-3">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-text font-mono text-sm">{key}</span>
              <span className="text-text-dim text-sm truncate max-w-[400px]">{value}</span>
            </div>
          ))}
        </div>
        {Object.keys(settings).length === 0 && (
          <p className="text-text-dim text-center py-8">{lang === 'ar' ? 'لا توجد إعدادات' : 'No settings configured'}</p>
        )}
      </div>
    </div>
  );
}
