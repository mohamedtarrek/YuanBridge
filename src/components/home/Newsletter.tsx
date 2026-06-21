'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';

export function Newsletter() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent" />
      </div>
      <div className="container-custom relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto"
        >
          <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6">
            <svg className="w-6 h-6 text-surface-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h3 className="text-2xl font-bold text-text mb-3">{t('newsletter.title')}</h3>
          <p className="text-text-muted text-sm mb-8 max-w-md mx-auto">{t('newsletter.subtitle')}</p>

          {status === 'success' ? (
            <p className="text-success font-medium">{t('newsletter.success')}</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('newsletter.placeholder')}
                required
                className="input-field flex-1"
              />
              <Button type="submit" variant="primary" loading={status === 'loading'}>
                {t('newsletter.button')}
              </Button>
            </form>
          )}

          {status === 'error' && (
            <p className="text-danger text-sm mt-3">{t('newsletter.error')}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
