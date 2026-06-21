'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const { t, lang, dir } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-accent-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
          style={{ direction: dir }}
        >
          <div className="glass-card rounded-3xl p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6"
              >
                <svg className="w-7 h-7 text-surface-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </motion.div>

              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">
                      {t('auth.resetSuccess')}
                    </h1>
                    <p className="text-text-muted text-sm">
                      {t('auth.checkEmail')}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">
                      {t('auth.forgotPasswordTitle')}
                    </h1>
                    <p className="text-text-muted text-sm">
                      {t('auth.forgotPasswordSubtitle')}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success-actions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <a
                    href={`/${lang}/login`}
                    className="inline-flex items-center gap-2 text-accent-500 hover:text-accent-400 font-medium transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {t('auth.backToLogin')}
                  </a>
                </motion.div>
              ) : (
                <motion.form
                  key="form-fields"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1.5">
                      {t('auth.email')}
                    </label>
                    <div className="relative">
                      <svg
                        className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim ${lang === 'ar' ? 'right-4' : 'left-4'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={lang === 'ar' ? 'بريدك الإلكتروني' : 'your@email.com'}
                        className={`input-field ${lang === 'ar' ? 'pr-12' : 'pl-12'}`}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    loading={loading}
                  >
                    {t('auth.resetButton')}
                  </Button>

                  <div className="text-center">
                    <a
                      href={`/${lang}/login`}
                      className="inline-flex items-center gap-2 text-accent-500 hover:text-accent-400 font-medium transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      {t('auth.backToLogin')}
                    </a>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
