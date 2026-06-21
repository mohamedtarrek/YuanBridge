'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import { PremiumBlur } from '@/components/ui/PremiumBlur';
import { type Strategy } from '@/lib/types';

function StrategyCard({ strategy, index }: { strategy: Strategy; index: number }) {
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="glass-card rounded-2xl p-5 group"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-accent-500 font-bold text-sm">{strategy.currencyPair}</span>
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
          strategy.direction === 'BUY'
            ? 'bg-success/10 text-success'
            : 'bg-danger/10 text-danger'
        }`}>
          {strategy.direction === 'BUY' ? t('latest.buy') : t('latest.sell')}
        </span>
      </div>

      <h3 className="text-text font-semibold text-sm mb-4 line-clamp-2">
        {isRTL ? strategy.titleAr : strategy.title}
      </h3>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div>
          <span className="text-text-muted">{t('latest.entry')}: </span>
          <span className="text-text font-medium">{strategy.entryPrice}</span>
        </div>
        <div>
          <span className="text-text-muted">{t('latest.sl')}: </span>
          <span className="text-danger font-medium">{strategy.stopLoss}</span>
        </div>
        <div>
          <span className="text-text-muted">{t('latest.tp1')}: </span>
          <span className="text-success font-medium">{strategy.takeProfit1}</span>
        </div>
        <div>
          <span className="text-text-muted">{t('latest.tp2')}: </span>
          <span className="text-success font-medium">{strategy.takeProfit2}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-text-muted">{t('latest.risk')}:</span>
          <span className={`font-medium ${
            strategy.risk === 'Low' ? 'text-success' :
            strategy.risk === 'Medium' ? 'text-warning' : 'text-danger'
          }`}>
            {strategy.risk}
          </span>
        </div>
        <div className="text-xs">
          <span className="text-text-muted">{t('latest.confidence')}: </span>
          <span className="font-bold gradient-text">{strategy.confidence}%</span>
        </div>
      </div>

      <div className="w-full h-1.5 rounded-full bg-surface-lighter mb-4 overflow-hidden">
        <div
          className="h-full rounded-full chart-bar transition-all duration-1000"
          style={{ width: `${strategy.confidence}%` }}
        />
      </div>

      <div className="text-xs text-text-muted">
        {t('latest.published')}: {new Date(strategy.publishedAt).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
      </div>

      {strategy.isPremium && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-accent-500 text-xs font-medium mb-2">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {t('pricing.premium')}
          </div>
        </div>
      )}
    </motion.div>
  );

  if (strategy.isPremium) {
    return <PremiumBlur>{card}</PremiumBlur>;
  }

  return card;
}

export function LatestStrategies() {
  const { t, lang } = useLanguage();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/strategies?limit=4')
      .then(res => res.json())
      .then(data => {
        if (data.strategies) setStrategies(data.strategies);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section-padding relative">
      <div className="absolute inset-0 dot-pattern opacity-30" />
      <div className="container-custom relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">{t('latest.title')}</h2>
          <p className="text-text-muted max-w-2xl mx-auto">{t('latest.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
                  <div className="h-4 bg-surface-lighter rounded w-1/3 mb-4" />
                  <div className="h-4 bg-surface-lighter rounded w-2/3 mb-4" />
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="h-3 bg-surface-lighter rounded" />
                    <div className="h-3 bg-surface-lighter rounded" />
                    <div className="h-3 bg-surface-lighter rounded" />
                    <div className="h-3 bg-surface-lighter rounded" />
                  </div>
                  <div className="h-3 bg-surface-lighter rounded w-1/2 mb-3" />
                  <div className="h-1.5 bg-surface-lighter rounded w-full mb-4" />
                  <div className="h-3 bg-surface-lighter rounded w-1/4" />
                </div>
              ))
            : strategies.map((strategy, i) => (
                <StrategyCard key={strategy.id} strategy={strategy} index={i} />
              ))}
        </div>

        {!loading && strategies.length > 0 && (
          <div className="text-center">
            <Button variant="secondary" href={`/${lang}/strategies`}>
              {t('latest.viewAll')}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
