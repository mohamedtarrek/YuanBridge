'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function HowAIWorks() {
  const { t, dir } = useLanguage();

  const steps = [
    { label: t('how.step1'), desc: t('how.step1Desc') },
    { label: t('how.step2'), desc: t('how.step2Desc') },
    { label: t('how.step3'), desc: t('how.step3Desc') },
    { label: t('how.step4'), desc: t('how.step4Desc') },
    { label: t('how.step5'), desc: t('how.step5Desc') },
    { label: t('how.step6'), desc: t('how.step6Desc') },
    { label: t('how.step7'), desc: t('how.step7Desc') },
    { label: t('how.step8'), desc: t('how.step8Desc') },
  ];

  const stepIcons = [
    'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
    'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
    'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    'M13 10V3L4 14h7v7l9-11h-7z',
    'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
  ];

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-dark via-surface to-surface-dark" />
      <div className="container-custom relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">{t('how.title')}</h2>
          <p className="text-text-muted max-w-2xl mx-auto">{t('how.subtitle')}</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute top-0 bottom-0 left-6 md:left-1/2 md:-translate-x-px w-px bg-gradient-to-b from-accent-500/40 via-accent-500/20 to-transparent" />

          <div className="space-y-8 md:space-y-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: dir === 'rtl' ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className={`relative flex items-start gap-6 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="hidden md:flex w-1/2" />

                <div className="relative z-10 shrink-0">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-accent-500/20">
                    <svg className="w-5 h-5 text-surface-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={stepIcons[i]} />
                    </svg>
                  </div>
                </div>

                <div className={`glass-card rounded-2xl p-5 flex-1 ${
                  i % 2 === 0 ? 'md:text-left' : 'md:text-right'
                }`}>
                  <span className="text-accent-500 text-xs font-bold tracking-widest">0{i + 1}</span>
                  <h3 className="text-text font-semibold mt-1 mb-2">{step.label}</h3>
                  <p className="text-text-muted text-sm">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
