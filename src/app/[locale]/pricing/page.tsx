'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';

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

const pricingFaqs = [
  { q: 'pricing.faqQ1', a: 'pricing.a1' },
  { q: 'pricing.faqQ2', a: 'pricing.a2' },
  { q: 'pricing.faqQ3', a: 'pricing.a3' },
  { q: 'pricing.faqQ4', a: 'pricing.a4' },
];

export default function PricingPage() {
  const { t, lang, dir } = useLanguage();
  const [yearly, setYearly] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const plans = [
    {
      id: 'free',
      name: t('pricing.free'),
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: lang === 'ar' ? 'ابدأ رحلة التداول مجاناً' : 'Start your trading journey for free',
      features: [
        t('pricing.freePlan1'),
        t('pricing.freePlan2'),
        t('pricing.freePlan3'),
        t('pricing.freePlan4'),
        t('pricing.freePlan5'),
      ],
      highlighted: false,
      cta: t('pricing.getStarted'),
    },
    {
      id: 'premium',
      name: t('pricing.premium'),
      monthlyPrice: 15,
      yearlyPrice: 144,
      description: lang === 'ar' ? 'أطلق العنان للإمكانات الكاملة للتداول بالذكاء الاصطناعي' : 'Unlock the full potential of AI trading',
      features: [
        t('pricing.premium1'),
        t('pricing.premium2'),
        t('pricing.premium3'),
        t('pricing.premium4'),
        t('pricing.premium5'),
        t('pricing.premium6'),
        t('pricing.premium7'),
        t('pricing.premium8'),
        t('pricing.premium9'),
        t('pricing.premium10'),
        t('pricing.premium11'),
        t('pricing.premium12'),
      ],
      highlighted: true,
      cta: t('pricing.subscribe'),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
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
              {t('pricing.title')}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-10"
            >
              {t('pricing.subtitle')}
            </motion.p>

            {/* Toggle */}
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 mb-16">
              <span
                className={`text-sm font-medium transition-colors ${
                  !yearly ? 'text-text' : 'text-text-muted'
                }`}
              >
                {t('pricing.monthly')}
              </span>
              <button
                onClick={() => setYearly(!yearly)}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                  yearly ? 'bg-accent-500' : 'bg-surface-lighter'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-300 ${
                    yearly ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium transition-colors ${
                  yearly ? 'text-text' : 'text-text-muted'
                }`}
              >
                {t('pricing.yearly')}
              </span>
              {yearly && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-accent-500/20 text-accent-500 border border-accent-500/30"
                >
                  {t('pricing.saveBadge')}
                </motion.span>
              )}
            </motion.div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto" dir={dir}>
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  variants={itemVariants}
                  className={`relative rounded-3xl p-8 flex flex-col ${
                    plan.highlighted
                      ? 'glow-card bg-gradient-to-b from-surface-lighter to-surface border border-accent-500/30'
                      : 'glass-card'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-bg text-xs font-bold text-surface-dark whitespace-nowrap">
                      {t('pricing.popular')}
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-text mb-2">{plan.name}</h3>
                    <p className="text-text-muted text-sm mb-6">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      {plan.monthlyPrice === 0 ? (
                        <span className="text-5xl font-bold gradient-text">
                          {lang === 'ar' ? 'مجاناً' : 'Free'}
                        </span>
                      ) : (
                        <>
                          <span className="text-5xl font-bold gradient-text">
                            ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                          </span>
                          <span className="text-text-muted text-sm">
                            {yearly ? t('pricing.perYear') : t('pricing.perMonth')}
                          </span>
                        </>
                      )}
                    </div>
                    {yearly && plan.monthlyPrice > 0 && (
                      <p className="text-text-dim text-xs mt-2">
                        ${plan.monthlyPrice}{t('pricing.perMonth')} {t('pricing.saveBadge').toLowerCase()}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <svg className="w-4 h-4 text-accent-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-text-muted">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.highlighted ? 'primary' : 'secondary'}
                    size="lg"
                    className="w-full"
                    href={`/${lang}/register`}
                  >
                    {plan.cta}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Pricing FAQ Section */}
        <section className="section-padding pt-0">
          <div className="container-custom max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
                {t('pricing.faqTitle')}
              </h2>
              <p className="text-text-muted max-w-2xl mx-auto">
                {t('pricing.faqSubtitle')}
              </p>
            </motion.div>

            <div className="space-y-3">
              {pricingFaqs.map((faq, i) => (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                    style={{ direction: dir }}
                  >
                    <span className="text-text font-medium text-sm flex-1 pr-4">
                      {t(faq.q as any)}
                    </span>
                    <svg
                      className={`w-4 h-4 text-accent-500 shrink-0 transition-transform duration-300 ${
                        faqOpen === i ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {faqOpen === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p
                          className="px-5 pb-5 text-text-muted text-sm leading-relaxed"
                          style={{ direction: dir }}
                        >
                          {t(faq.a as any)}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
