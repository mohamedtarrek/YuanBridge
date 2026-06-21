'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const stepIcons = [
  'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
  'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
  'M13 10V3L4 14h7v7l9-11h-7z',
  'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  'M4 16v6h16v-6M4 16l8-8 4 4 8-8M4 16h16',
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function SectionHeading({ label, desc }: { label: string; desc: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-center mb-16"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">{label}</h2>
      <p className="text-text-muted max-w-2xl mx-auto">{desc}</p>
    </motion.div>
  );
}

function StatCard({ label, value, suffix, index }: { label: string; value: string; suffix?: string; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="glass-card rounded-2xl p-6 text-center"
    >
      <div className="text-2xl md:text-3xl font-bold gradient-text mb-2">
        {value}{suffix}
      </div>
      <p className="text-text-muted text-sm">{label}</p>
    </motion.div>
  );
}

export default function AIAnalysisPage() {
  const { t, lang, dir } = useLanguage();
  const isRTL = dir === 'rtl';

  const steps = [
    { key: 'dataCollection', label: t('ai.dataCollection'), desc: t('ai.dataCollectionDesc') },
    { key: 'indicatorAnalysis', label: t('ai.indicatorAnalysis'), desc: t('ai.indicatorAnalysisDesc') },
    { key: 'trendDetection', label: t('ai.trendDetection'), desc: t('ai.trendDetectionDesc') },
    { key: 'patternDetection', label: t('ai.patternDetection'), desc: t('ai.patternDetectionDesc') },
    { key: 'riskScoring', label: t('ai.riskScoring'), desc: t('ai.riskScoringDesc') },
    { key: 'signalGeneration', label: t('ai.signalGeneration'), desc: t('ai.signalGenerationDesc') },
    { key: 'confidenceCalculation', label: t('ai.confidenceCalculation'), desc: t('ai.confidenceCalculationDesc') },
    { key: 'publishing', label: t('ai.publishing'), desc: t('ai.publishingDesc') },
  ];

  const models = [
    { name: t('ai.modelOpenai'), desc: t('ai.modelOpenaiDesc'), color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20', accent: '#10b981' },
    { name: t('ai.modelClaude'), desc: t('ai.modelClaudeDesc'), color: 'from-orange-500/20 to-orange-500/5', border: 'border-orange-500/20', accent: '#f97316' },
    { name: t('ai.modelGemini'), desc: t('ai.modelGeminiDesc'), color: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20', accent: '#3b82f6' },
    { name: t('ai.modelDeepseek'), desc: t('ai.modelDeepseekDesc'), color: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/20', accent: '#a855f7', comingSoon: true },
  ];

  return (
    <div className="min-h-screen bg-surface-dark">
      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-dark via-surface to-surface-dark" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-500/5 rounded-full blur-[128px]" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="container-custom relative text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse-glow" />
            <span className="text-accent-500 text-sm font-medium">{t('nav.aiAnalysis')}</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-text mb-6 leading-tight">
            <span className="gradient-text">{t('ai.title')}</span>
          </h1>

          <p className="text-text-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {t('ai.subtitle')}
          </p>

          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-accent-500/40" />
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-surface-dark bg-gradient-to-br from-accent-500/80 to-accent-500/40 flex items-center justify-center text-surface-dark text-xs font-bold"
                >
                  AI
                </div>
              ))}
            </div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent-500/40" />
          </div>
        </motion.div>
      </section>

      {/* ========== ARCHITECTURE FLOW ========== */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-30" />

        <div className="container-custom relative">
          <SectionHeading label={t('ai.title')} desc={t('ai.subtitle')} />

          <div className="relative max-w-4xl mx-auto">
            <div
              className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-accent-500/40 via-accent-500/20 to-transparent"
              style={{ [isRTL ? 'right' : 'left']: '1.5rem' }}
            />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="space-y-10"
            >
              {steps.map((step, i) => (
                <motion.div
                  key={step.key}
                  variants={fadeUp}
                  className="relative flex items-start gap-5"
                  style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
                >
                  <div className="relative z-10 shrink-0">
                    <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-accent-500/20">
                      <svg className="w-5 h-5 text-surface-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={stepIcons[i]} />
                      </svg>
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-surface-dark border-2 border-accent-500 flex items-center justify-center">
                      <span className="text-accent-500 text-[10px] font-bold">{i + 1}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className="absolute top-12 w-px h-10 bg-gradient-to-b from-accent-500/40 to-transparent"
                        style={{ [isRTL ? 'right' : 'left']: '50%' }}
                      />
                    )}
                  </div>

                  <div className="glass-card rounded-2xl p-5 flex-1 group hover:border-accent-500/30 transition-all duration-300">
                    <h3 className="text-text font-semibold mb-1.5 text-lg">{step.label}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== SYSTEM DIAGRAM ========== */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface-dark to-surface" />
        <div className="absolute inset-0 grid-pattern opacity-20" />

        <div className="container-custom relative">
          <SectionHeading label={t('ai.systemArchitecture')} desc={t('ai.systemArchitectureDesc')} />

          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
              {/* Market Data */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="glass-card rounded-2xl p-8 w-full md:w-72 text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center mx-auto mb-5 group-hover:border-blue-500/40 transition-all duration-300">
                  <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <h3 className="text-text font-semibold text-lg mb-2">{t('ai.marketData')}</h3>
                <p className="text-text-muted text-sm">
                  {lang === 'ar' ? 'بيانات فوركس فورية من الأسواق العالمية' : 'Real-time Forex data from global markets'}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {['EUR/USD', 'GBP/USD', 'USD/JPY'].map((pair) => (
                    <span key={pair} className="px-2.5 py-1 text-xs rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {pair}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Arrow */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="hidden md:flex items-center justify-center shrink-0"
              >
                <svg className={`w-12 h-8 text-accent-500/60 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 48 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h38m0 0l-6-6m6 6l-6 6" />
                </svg>
              </motion.div>

              {/* AI Engine */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="glass-card rounded-2xl p-8 w-full md:w-80 text-center group glow-card"
              >
                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-5 shadow-lg shadow-accent-500/20">
                  <svg className="w-8 h-8 text-surface-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>
                <h3 className="text-text font-semibold text-lg mb-2 gradient-text">{t('ai.aiEngine')}</h3>
                <p className="text-text-muted text-sm">
                  {lang === 'ar' ? 'AI يحلل ويعالج البيانات متعددة المصادر' : 'AI analyzes and processes multi-source data'}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="px-2.5 py-1 text-xs rounded-md bg-accent-500/10 text-accent-400 border border-accent-500/20">
                    {lang === 'ar' ? 'تحليل' : 'Analysis'}
                  </span>
                  <span className="px-2.5 py-1 text-xs rounded-md bg-accent-500/10 text-accent-400 border border-accent-500/20">
                    {lang === 'ar' ? 'معالجة' : 'Processing'}
                  </span>
                  <span className="px-2.5 py-1 text-xs rounded-md bg-accent-500/10 text-accent-400 border border-accent-500/20">
                    {lang === 'ar' ? 'توليد' : 'Generation'}
                  </span>
                </div>
              </motion.div>

              {/* Arrow */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="hidden md:flex items-center justify-center shrink-0"
              >
                <svg className={`w-12 h-8 text-accent-500/60 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 48 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h38m0 0l-6-6m6 6l-6 6" />
                </svg>
              </motion.div>

              {/* Strategy Output */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="glass-card rounded-2xl p-8 w-full md:w-72 text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 flex items-center justify-center mx-auto mb-5 group-hover:border-green-500/40 transition-all duration-300">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                  </svg>
                </div>
                <h3 className="text-text font-semibold text-lg mb-2">{t('ai.strategyOutput')}</h3>
                <p className="text-text-muted text-sm">
                  {lang === 'ar' ? 'يولد استراتيجيات تداول كاملة' : 'Generates complete trading strategies'}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="px-2.5 py-1 text-xs rounded-md bg-green-500/10 text-green-400 border border-green-500/20">
                    {t('common.buy')}
                  </span>
                  <span className="px-2.5 py-1 text-xs rounded-md bg-green-500/10 text-green-400 border border-green-500/20">
                    {t('common.sell')}
                  </span>
                  <span className="px-2.5 py-1 text-xs rounded-md bg-green-500/10 text-green-400 border border-green-500/20">
                    TP/SL
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Mobile arrows */}
            <div className="flex md:hidden items-center justify-center gap-2 mt-2">
              <motion.svg
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className={`w-6 h-6 text-accent-500/60 ${isRTL ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </motion.svg>
              <motion.svg
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className={`w-6 h-6 text-accent-500/60 ${isRTL ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </motion.svg>
            </div>
          </div>
        </div>
      </section>

      {/* ========== MODEL ARCHITECTURE ========== */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-30" />

        <div className="container-custom relative">
          <SectionHeading label={t('ai.modelsTitle')} desc={t('ai.modelsSubtitle')} />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          >
            {models.map((model, i) => (
              <motion.div
                key={model.name}
                variants={fadeUp}
                className="glass-card rounded-2xl p-6 text-center group relative overflow-hidden"
              >
                {model.comingSoon && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30">
                      {t('ai.comingSoon')}
                    </span>
                  </div>
                )}

                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${model.color} border ${model.border} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <svg className="w-8 h-8" style={{ color: model.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>

                <h3 className={`text-text font-semibold text-lg mb-2 ${model.comingSoon ? 'opacity-60' : ''}`}>
                  {model.name}
                </h3>
                <p className={`text-text-muted text-sm leading-relaxed ${model.comingSoon ? 'opacity-40' : ''}`}>
                  {model.desc}
                </p>

                {model.comingSoon && (
                  <div className="mt-4 h-1.5 rounded-full bg-surface-lighter overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '60%' }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-accent-500 to-accent-300"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface-dark to-surface" />
        <div className="absolute inset-0 grid-pattern opacity-20" />

        <div className="container-custom relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <StatCard label={t('ai.dataPoints')} value="50" suffix="M+" index={0} />
            <StatCard label={t('ai.modelsActive')} value="4" index={1} />
            <StatCard label={t('ai.uptime')} value="99.9" suffix="%" index={2} />
            <StatCard label={t('ai.avgResponse')} value="&lt;200" suffix="ms" index={3} />
          </div>
        </div>
      </section>
    </div>
  );
}
