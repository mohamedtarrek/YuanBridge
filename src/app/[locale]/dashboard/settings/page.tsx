'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
} as const;
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
} as const;

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
        enabled ? 'bg-accent-500' : 'bg-surface-lighter'
      }`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
        enabled ? 'left-[22px]' : 'left-0.5'
      }`} />
    </button>
  );
}

export default function SettingsPage() {
  const { t, lang, isRTL, setLang } = useLanguage();
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [telegramNotif, setTelegramNotif] = useState(false);
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next === 'dark');
    }
  };

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-2">{t('dashboard.settings')}</h2>
      </motion.div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Section */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-bold text-text mb-5">{t('dashboard.profile')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-text-dim text-sm mb-1.5">{t('auth.name')}</label>
              <input
                type="text"
                defaultValue={lang === 'ar' ? 'أحمد محمد' : 'Ahmed Mohammed'}
                disabled
                className="input-field text-sm opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-text-dim text-sm mb-1.5">{t('auth.email')}</label>
              <input
                type="email"
                defaultValue="ahmed@example.com"
                disabled
                className="input-field text-sm opacity-60 cursor-not-allowed"
              />
            </div>
          </div>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-bold text-text mb-5">{t('dashboard.notificationPrefs') || 'Notification Preferences'}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-text text-sm font-medium">{t('dashboard.emailNotif') || 'Email Notifications'}</span>
                <p className="text-text-dim text-xs">{t('dashboard.emailNotifDesc') || 'Receive strategy updates via email'}</p>
              </div>
              <ToggleSwitch enabled={emailNotif} onChange={setEmailNotif} />
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-text text-sm font-medium">{t('dashboard.pushNotif') || 'Push Notifications'}</span>
                <p className="text-text-dim text-xs">{t('dashboard.pushNotifDesc') || 'Receive browser push alerts'}</p>
              </div>
              <ToggleSwitch enabled={pushNotif} onChange={setPushNotif} />
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-text text-sm font-medium">{t('dashboard.telegramNotif') || 'Telegram Notifications'}</span>
                <p className="text-text-dim text-xs">{t('dashboard.telegramNotifDesc') || 'Receive alerts on Telegram'}</p>
              </div>
              <ToggleSwitch enabled={telegramNotif} onChange={setTelegramNotif} />
            </div>
          </div>
        </motion.div>

        {/* Language & Theme */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-bold text-text mb-5">{t('dashboard.preferences') || 'Preferences'}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-text text-sm font-medium">{t('dashboard.language') || 'Language'}</span>
                <p className="text-text-dim text-xs">{t('dashboard.languageDesc') || 'Choose your preferred language'}</p>
              </div>
              <button
                onClick={toggleLanguage}
                className="px-4 py-2 rounded-xl text-sm font-semibold btn-secondary"
              >
                {lang === 'ar' ? 'English' : 'العربية'}
              </button>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-text text-sm font-medium">{t('dashboard.theme') || 'Theme'}</span>
                <p className="text-text-dim text-xs">{t('dashboard.themeDesc') || 'Choose between dark and light mode'}</p>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-xl text-sm font-semibold btn-secondary"
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <>
                      <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                      {t('dashboard.light') || 'Light'}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-info" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                      {t('dashboard.dark') || 'Dark'}
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <Button variant="primary" onClick={handleSave}>
            {saved ? (
              <>
                <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t('common.saved') || 'Saved!'}
              </>
            ) : (
              t('common.save')
            )}
          </Button>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6 border border-danger/20">
          <h3 className="text-lg font-bold text-danger mb-5">{t('dashboard.dangerZone') || 'Danger Zone'}</h3>
          <p className="text-text-dim text-sm mb-4">
            {t('dashboard.dangerZoneDesc') || 'Once you delete your account, there is no going back. Please be certain.'}
          </p>
          {!showDeleteConfirm ? (
            <Button
              variant="ghost"
              className="text-danger border-danger/30 hover:bg-danger/10 hover:border-danger/50"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {t('dashboard.deleteAccount') || 'Delete Account'}
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              <span className="text-text-dim text-sm">
                {t('dashboard.deleteConfirm') || 'Are you absolutely sure?'}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="text-danger border-danger/30 hover:bg-danger/10"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  {t('common.confirm') || 'Yes, Delete'}
                </Button>
                <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
