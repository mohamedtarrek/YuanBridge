'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { motion } from 'framer-motion';

export function TrustedBy() {
  const { t } = useLanguage();

  const logos = [
    'MetaTrader', 'TradingView', 'Bloomberg', 'Reuters', 'Investing.com', 'ForexFactory'
  ];

  return (
    <section className="py-16 border-y border-border/50 relative">
      <div className="container-custom">
        <p className="text-center text-text-muted text-sm font-medium mb-10 uppercase tracking-widest">
          {t('trusted.title')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {logos.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-text-muted/40 hover:text-text-muted/60 transition-colors duration-300"
            >
              <span className="text-xl md:text-2xl font-bold tracking-tight">{name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
