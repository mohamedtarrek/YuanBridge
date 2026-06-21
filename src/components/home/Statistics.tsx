'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

export function Statistics() {
  const { t, dir } = useLanguage();

  const stats = [
    { value: 15420, label: t('stats.strategies'), suffix: '+' },
    { value: 2890000, label: t('stats.trades'), suffix: '+' },
    { value: 82.5, label: t('stats.accuracy'), suffix: '%', decimals: 1 },
    { value: 8450, label: t('stats.members'), suffix: '+' },
    { value: 120, label: t('stats.countries'), suffix: '+' },
  ];

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="container-custom relative">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <div className="text-2xl md:text-3xl font-bold gradient-text mb-2">
                <AnimatedCounter
                  end={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals || 0}
                />
              </div>
              <p className="text-text-muted text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
