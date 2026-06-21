'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';

export function CTA() {
  const { t, lang } = useLanguage();

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-500/5 rounded-full blur-[150px]" />
      </div>
      <div className="container-custom relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 via-surface-lighter to-surface-dark" />
          <div className="absolute inset-0 dot-pattern opacity-50" />
          <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-text mb-6 max-w-2xl mx-auto">
              {t('cta.title')}
            </h2>
            <p className="text-text-muted text-lg mb-10 max-w-xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" size="lg" href={`/${lang}/register`}>
                {t('cta.button')}
              </Button>
              <Button variant="secondary" size="lg" href={`/${lang}/pricing`}>
                {t('nav.pricing')}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
