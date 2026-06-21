'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const contactInfo = [
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    ),
    label: { en: 'Email', ar: 'البريد الإلكتروني' },
    value: 'support@yuanbridge.com',
    href: 'mailto:support@yuanbridge.com',
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    ),
    label: { en: 'Phone', ar: 'الهاتف' },
    value: '+1 (555) 123-4567',
    href: 'tel:+15551234567',
  },
  {
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ),
    label: { en: 'Location', ar: 'الموقع' },
    value: { en: 'Dubai, UAE', ar: 'دبي، الإمارات العربية المتحدة' },
    href: null,
  },
];

export default function ContactPage() {
  const { t, lang, dir } = useLanguage();
  const [status, setStatus] = useState<FormStatus>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate success
    setStatus('success');
    setFormData({ name: '', email: '', message: '' });

    setTimeout(() => setStatus('idle'), 5000);
  };

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Hero */}
        <section className="section-padding pb-8">
          <motion.div
            className="container-custom text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-text mb-6"
            >
              {t('contact.title')}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-10"
            >
              {t('contact.subtitle')}
            </motion.p>
          </motion.div>
        </section>

        {/* Contact Content */}
        <section className="section-padding pt-0">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12" dir={dir}>
              {/* Form */}
              <motion.div
                className="lg:col-span-3"
                initial={{ opacity: 0, x: lang === 'ar' ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="glass-card rounded-3xl p-8 md:p-10">
                  {status === 'success' ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-text mb-2">{t('contact.success')}</h3>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
                          {t('contact.name')}
                        </label>
                        <input
                          id="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                          className="input-field"
                          placeholder={t('contact.name')}
                          disabled={status === 'loading'}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                          {t('contact.email')}
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                          className="input-field"
                          placeholder={t('contact.email')}
                          disabled={status === 'loading'}
                        />
                      </div>
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-text mb-2">
                          {t('contact.message')}
                        </label>
                        <textarea
                          id="message"
                          required
                          rows={5}
                          value={formData.message}
                          onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                          className="input-field resize-none"
                          placeholder={t('contact.message')}
                          disabled={status === 'loading'}
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        loading={status === 'loading'}
                      >
                        {t('contact.send')}
                      </Button>

                      {status === 'error' && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-danger text-sm text-center"
                        >
                          {t('contact.error')}
                        </motion.p>
                      )}
                    </form>
                  )}
                </div>
              </motion.div>

              {/* Info Sidebar */}
              <motion.div
                className="lg:col-span-2 space-y-6"
                initial={{ opacity: 0, x: lang === 'ar' ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {contactInfo.map((info) => (
                  <div key={info.label.en} className="glass-card rounded-2xl p-6">
                    <div className="flex items-start gap-4" style={{ flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}>
                      <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          {info.icon}
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-text-muted mb-1">
                          {info.label[lang as 'en' | 'ar']}
                        </p>
                        {info.href ? (
                          <a
                            href={info.href}
                            className="text-text font-medium hover:text-accent-500 transition-colors"
                          >
                            {typeof info.value === 'string' ? info.value : info.value[lang as 'en' | 'ar']}
                          </a>
                        ) : (
                          <p className="text-text font-medium">
                            {typeof info.value === 'string' ? info.value : info.value[lang as 'en' | 'ar']}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Map Placeholder */}
                <div className="glass-card rounded-2xl p-6">
                  <p className="text-sm text-text-muted mb-3">
                    {lang === 'ar' ? 'موقعنا' : 'Our Location'}
                  </p>
                  <div className="w-full h-48 rounded-xl bg-surface-lighter flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 grid-pattern opacity-20" />
                    <div className="text-center relative z-10">
                      <svg className="w-10 h-10 text-accent-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-text-dim text-sm">
                        {lang === 'ar' ? 'الخريطة قيد التحميل' : 'Map loading...'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
