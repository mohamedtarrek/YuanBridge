'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';

export function Pricing() {
  const { t, lang } = useLanguage();

  const plans = [
    {
      id: 'free',
      name: t('pricing.free'),
      price: 0,
      features: [
        t('pricing.freePlan1'),
        t('pricing.freePlan2'),
        t('pricing.freePlan3'),
        t('pricing.freePlan4'),
        t('pricing.freePlan5'),
      ],
      highlighted: false,
    },
    {
      id: 'premium',
      name: t('pricing.premium'),
      price: 15,
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
    },
  ];

  return (
    <section className="section-padding relative overflow-hidden" id="pricing">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-accent-500/5 rounded-full blur-[100px]" />

      <div className="container-custom relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">{t('pricing.title')}</h2>
          <p className="text-text-muted max-w-2xl mx-auto">{t('pricing.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className={`relative rounded-3xl p-8 ${
                plan.highlighted
                  ? 'glow-card bg-gradient-to-b from-surface-lighter to-surface border border-accent-500/30'
                  : 'glass-card'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-bg text-xs font-bold text-surface-dark">
                  {t('pricing.subscribe')}
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-text mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold gradient-text">
                    {plan.price === 0 ? (lang === 'ar' ? 'مجاني' : 'Free') : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-text-muted text-sm">{t('pricing.perMonth')}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
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
                {plan.price === 0 ? t('pricing.getStarted') : t('pricing.subscribe')}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
