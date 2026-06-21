'use client';

import { useState, use, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import type { Strategy } from '@/lib/types';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-16 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" />
        <p className="text-text-dim text-sm">Loading strategy...</p>
      </div>
    </div>
  );
}

function DirectionBadge({ direction }: { direction: 'BUY' | 'SELL' }) {
  const { t } = useLanguage();
  const isBuy = direction === 'BUY';
  return (
    <span className={`px-3 py-1.5 rounded-xl text-sm font-bold ${
      isBuy ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
    }`}>
      {isBuy ? t('latest.buy') : t('latest.sell')}
    </span>
  );
}

function TrendBadge({ trend }: { trend: 'Bullish' | 'Bearish' | 'Neutral' }) {
  const color = trend === 'Bullish' ? 'text-success border-success/30 bg-success/5' :
    trend === 'Bearish' ? 'text-danger border-danger/30 bg-danger/5' :
    'text-warning border-warning/30 bg-warning/5';
  const icon = trend === 'Bullish' ? (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  ) : trend === 'Bearish' ? (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ) : (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${color}`}>
      {icon}
      {trend}
    </span>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const color = risk === 'Low' ? 'text-success border-success/30 bg-success/5' :
    risk === 'Medium' ? 'text-warning border-warning/30 bg-warning/5' :
    'text-danger border-danger/30 bg-danger/5';
  return (
    <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold border ${color}`}>
      {risk}
    </span>
  );
}

function ConfidenceGauge({ value }: { value: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 85 ? '#00c853' : value >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-3xl font-bold gradient-text"
        >
          {value}%
        </motion.span>
        <span className="text-text-dim text-xs mt-0.5">AI Score</span>
      </div>
    </div>
  );
}

function SectionCard({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card rounded-2xl p-5 md:p-6"
    >
      <h3 className="text-text font-semibold text-base mb-4 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-accent-500" />
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

function PriceLevelBar({ label, price, color }: { label: string; price: number; color: string }) {
  return (
    <div className="flex items-center gap-3 group">
      <span className="text-text-dim text-xs w-20 shrink-0">{label}</span>
      <div className="flex-1 h-8 rounded-lg bg-surface-lighter/50 relative overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-lg ${color}`}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <span className="absolute inset-0 flex items-center px-3 text-xs font-medium text-text">
          {price}
        </span>
      </div>
    </div>
  );
}

function IndicatorCard({ name, value, status }: { name: string; value: string | number; status?: 'Bullish' | 'Bearish' | 'Neutral' | string }) {
  const statusColor = status === 'Bullish' ? 'text-success' :
    status === 'Bearish' ? 'text-danger' :
    status === 'Neutral' ? 'text-warning' : 'text-text';

  return (
    <div className="glass rounded-xl p-4 border border-border">
      <div className="text-text-dim text-xs mb-1">{name}</div>
      <div className="text-text font-semibold text-base">{value}</div>
      {status && (
        <div className={`text-xs font-medium mt-1 ${statusColor}`}>{status}</div>
      )}
    </div>
  );
}

function SectionDivider() {
  return <div className="h-px bg-border my-2" />;
}

export default function StrategyDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';

  const { id } = use(params);

  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresPremium, setRequiresPremium] = useState(false);

  useEffect(() => {
    setLoading(true);
    setRequiresPremium(false);
    fetch(`/api/strategies/${id}`)
      .then(res => {
        if (res.status === 403) return res.json().then(d => { setRequiresPremium(true); throw new Error(d.message); });
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        if (data.strategy) setStrategy(data.strategy);
        else setStrategy(null);
      })
      .catch(() => setStrategy(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!strategy) {
    if (requiresPremium) {
      return (
        <div className="min-h-screen pt-24 md:pt-28 pb-16 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 rounded-2xl bg-accent-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-accent-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-3">
              {lang === 'ar' ? 'هذه الاستراتيجية متاحة فقط للأعضاء المميزين' : 'Premium Strategy'}
            </h2>
            <p className="text-text-muted mb-8">
              {lang === 'ar'
                ? 'قم بالترقية إلى الاشتراك المميز للوصول إلى هذه الاستراتيجية وجميع الاستراتيجيات الحصرية.'
                : 'Upgrade to a Premium subscription to access this strategy and all exclusive strategies.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="primary" href={`/${lang}/pricing`}>
                {lang === 'ar' ? 'ترقية الآن' : 'Upgrade Now'}
              </Button>
              <Button variant="secondary" href={`/${lang}/strategies`}>
                {t('detail.back')}
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen pt-24 md:pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-text-dim mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-text-muted mb-6">{t('common.noData')}</p>
          <Button variant="secondary" href={`/${lang}/strategies`}>{t('detail.back')}</Button>
        </div>
      </div>
    );
  }

  const title = isRTL ? strategy.titleAr : strategy.title;
  const summary = isRTL ? strategy.summaryAr : strategy.summary;
  const technicalAnalysis = isRTL ? strategy.technicalAnalysisAr : strategy.technicalAnalysis;
  const fundamentalAnalysis = isRTL ? strategy.fundamentalAnalysisAr : strategy.fundamentalAnalysis;
  const notes = isRTL ? strategy.notesAr : strategy.notes;

  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  const handleSave = () => {
    setSaved(!saved);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-16 relative">
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="absolute top-40 right-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl" />

      <div className="container-custom relative">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <a
            href={`/${lang}/strategies`}
            className="inline-flex items-center gap-2 text-text-muted hover:text-text transition-all text-sm group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t('detail.back')}
          </a>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-2xl p-6 md:p-8 border border-border mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-accent-500 font-bold text-lg tracking-wider">{strategy.currencyPair}</span>
              <DirectionBadge direction={strategy.direction} />
              <TrendBadge trend={strategy.trend} />
            </div>
            {strategy.isPremium && (
              <span className="inline-flex items-center gap-1.5 text-accent-500 text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {t('pricing.premium')}
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">{title}</h1>

          <SectionDivider />

          <div className="flex flex-wrap items-center gap-4 text-xs text-text-dim">
            <span>{t('detail.publishedTime')}: {new Date(strategy.publishedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}</span>
            <span className="w-px h-4 bg-border" />
            <span>{strategy.aiModel}</span>
            <span className="w-px h-4 bg-border" />
            <span>{strategy.tradesAnalyzed.toLocaleString()} {t('stats.trades')}</span>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                saved
                  ? 'bg-accent-500/20 text-accent-500 border border-accent-500/40'
                  : 'btn-secondary'
              }`}
            >
              <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {saved ? t('common.save') : t('detail.save')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShare}
              className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {shared ? t('common.copied') : t('detail.share')}
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Summary */}
            <SectionCard title={t('detail.aiSummary')} delay={0.1}>
              <p className="text-text/80 text-sm leading-relaxed">{summary}</p>
            </SectionCard>

            {/* Technical Analysis */}
            <SectionCard title={t('detail.technicalAnalysis')} delay={0.15}>
              <p className="text-text/80 text-sm leading-relaxed">{technicalAnalysis}</p>
            </SectionCard>

            {/* Fundamental Analysis */}
            <SectionCard title={t('detail.fundamentalAnalysis')} delay={0.2}>
              <p className="text-text/80 text-sm leading-relaxed">{fundamentalAnalysis}</p>
            </SectionCard>

            {/* Support & Resistance */}
            <SectionCard title={`${t('detail.support')} & ${t('detail.resistance')}`} delay={0.25}>
              <div className="space-y-3">
                <p className="text-text-dim text-xs font-medium mb-2">{t('detail.resistance')}</p>
                {[...strategy.resistance].reverse().map((price, i) => (
                  <PriceLevelBar key={`res-${i}`} label={`R${strategy.resistance.length - i}`} price={price} color="bg-danger/20" />
                ))}
                <div className="h-px bg-border my-3" />
                <p className="text-text-dim text-xs font-medium mb-2">{t('detail.support')}</p>
                {strategy.support.map((price, i) => (
                  <PriceLevelBar key={`sup-${i}`} label={`S${i + 1}`} price={price} color="bg-success/20" />
                ))}
              </div>
            </SectionCard>

            {/* Indicators Grid */}
            <SectionCard title={t('detail.indicators')} delay={0.3}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <IndicatorCard name="RSI (14)" value={strategy.indicators.rsi} status={strategy.indicators.rsi > 60 ? 'Bullish' : strategy.indicators.rsi < 40 ? 'Bearish' : 'Neutral'} />
                <IndicatorCard name="MACD" value={strategy.indicators.macd} status={strategy.indicators.macd} />
                <IndicatorCard name="EMA" value={strategy.indicators.ema} status={strategy.indicators.ema} />
                <IndicatorCard name="SMA" value={strategy.indicators.sma} status={strategy.indicators.sma.includes('Above') ? 'Bullish' : strategy.indicators.sma.includes('Below') ? 'Bearish' : 'Neutral'} />
                <IndicatorCard name="ATR (14)" value={strategy.indicators.atr} />
                <IndicatorCard
                  name="Bollinger Bands"
                  value={`${strategy.indicators.bollingerBands.upper} / ${strategy.indicators.bollingerBands.middle} / ${strategy.indicators.bollingerBands.lower}`}
                />
              </div>
            </SectionCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Confidence */}
            <SectionCard title={t('detail.confidence')} delay={0.1}>
              <ConfidenceGauge value={strategy.confidence} />
              <div className="w-full h-1.5 rounded-full bg-surface-lighter mt-4 overflow-hidden">
                <motion.div
                  className="h-full rounded-full chart-bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${strategy.confidence}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
            </SectionCard>

            {/* Risk Level */}
            <SectionCard title={t('detail.risk')} delay={0.15}>
              <div className="flex items-center justify-center">
                <RiskBadge risk={strategy.risk} />
              </div>
            </SectionCard>

            {/* Trade Setup */}
            <SectionCard title={t('detail.tradeSetup')} delay={0.2}>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-surface-lighter/50">
                  <span className="text-text-dim text-sm">{t('detail.entryPrice')}</span>
                  <span className="text-text font-semibold">{strategy.entryPrice}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-surface-lighter/50">
                  <span className="text-text-dim text-sm">{t('detail.stopLoss')}</span>
                  <span className="text-danger font-semibold">{strategy.stopLoss}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-surface-lighter/50">
                  <span className="text-text-dim text-sm">{t('detail.takeProfit')} 1</span>
                  <span className="text-success font-semibold">{strategy.takeProfit1}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-surface-lighter/50">
                  <span className="text-text-dim text-sm">{t('detail.takeProfit')} 2</span>
                  <span className="text-success font-semibold">{strategy.takeProfit2}</span>
                </div>
              </div>
            </SectionCard>

            {/* Trade Notes */}
            {notes && (
              <SectionCard title={t('detail.tradeNotes')} delay={0.25}>
                <p className="text-text/80 text-sm leading-relaxed">{notes}</p>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
