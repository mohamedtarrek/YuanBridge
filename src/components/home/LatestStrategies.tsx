'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import { PremiumBlur } from '@/components/ui/PremiumBlur';
import { type Strategy } from '@/lib/types';

const mockStrategies: Strategy[] = [
  {
    id: '1',
    title: 'EUR/USD Bullish Breakout',
    titleAr: 'انفراج صاعد لليورو مقابل الدولار',
    currencyPair: 'EUR/USD',
    direction: 'BUY',
    entryPrice: 1.08450,
    stopLoss: 1.07800,
    takeProfit1: 1.09200,
    takeProfit2: 1.09800,
    risk: 'Low',
    confidence: 87,
    publishedAt: new Date().toISOString(),
    summary: 'Strong bullish momentum detected with RSI divergence.',
    summaryAr: 'تم اكتشاف زخم صاعد قوي مع تباعد في مؤشر RSI.',
    isPremium: false,
    technicalAnalysis: '',
    technicalAnalysisAr: '',
    fundamentalAnalysis: '',
    fundamentalAnalysisAr: '',
    trend: 'Bullish',
    support: [1.07800, 1.07500, 1.07000],
    resistance: [1.09200, 1.09800, 1.10500],
    indicators: { rsi: 62, macd: 'Bullish', ema: 'Bullish', sma: 'Above SMA50', atr: 0.0015, bollingerBands: { upper: 1.095, middle: 1.085, lower: 1.075 } },
    notes: '',
    notesAr: '',
    tradesAnalyzed: 3421,
    aiModel: 'YuanBridge AI v2.4',
  },
  {
    id: '2',
    title: 'GBP/USD Bearish Reversal',
    titleAr: 'انعكاس هابط للجنيه مقابل الدولار',
    currencyPair: 'GBP/USD',
    direction: 'SELL',
    entryPrice: 1.26500,
    stopLoss: 1.27100,
    takeProfit1: 1.25700,
    takeProfit2: 1.25100,
    risk: 'Medium',
    confidence: 82,
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    summary: 'Bearish engulfing pattern on daily timeframe with overbought RSI.',
    summaryAr: 'نمط ابتلاع هابط على الإطار الزمني اليومي مع RSI في منطقة ذروة الشراء.',
    isPremium: true,
    technicalAnalysis: '',
    technicalAnalysisAr: '',
    fundamentalAnalysis: '',
    fundamentalAnalysisAr: '',
    trend: 'Bearish',
    support: [1.25700, 1.25100, 1.24500],
    resistance: [1.27100, 1.27500, 1.28200],
    indicators: { rsi: 72, macd: 'Bearish', ema: 'Bearish', sma: 'Below SMA50', atr: 0.0018, bollingerBands: { upper: 1.275, middle: 1.265, lower: 1.255 } },
    notes: '',
    notesAr: '',
    tradesAnalyzed: 2810,
    aiModel: 'YuanBridge AI v2.4',
  },
  {
    id: '3',
    title: 'USD/JPY Range Breakout',
    titleAr: 'انفراج نطاق الدولار مقابل الين',
    currencyPair: 'USD/JPY',
    direction: 'BUY',
    entryPrice: 149.350,
    stopLoss: 148.700,
    takeProfit1: 150.200,
    takeProfit2: 150.800,
    risk: 'High',
    confidence: 76,
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    summary: 'Breaking above resistance with increased volume and momentum.',
    summaryAr: 'اختراق فوق المقاومة مع زيادة في الحجم والزخم.',
    isPremium: false,
    technicalAnalysis: '',
    technicalAnalysisAr: '',
    fundamentalAnalysis: '',
    fundamentalAnalysisAr: '',
    trend: 'Bullish',
    support: [148.700, 148.300, 147.800],
    resistance: [150.200, 150.800, 151.500],
    indicators: { rsi: 58, macd: 'Bullish', ema: 'Bullish', sma: 'Above SMA50', atr: 0.45, bollingerBands: { upper: 150.5, middle: 149.3, lower: 148.1 } },
    notes: '',
    notesAr: '',
    tradesAnalyzed: 1890,
    aiModel: 'YuanBridge AI v2.4',
  },
  {
    id: '4',
    title: 'AUD/USD Support Bounce',
    titleAr: 'ارتداد الدعم للاسترالي مقابل الدولار',
    currencyPair: 'AUD/USD',
    direction: 'BUY',
    entryPrice: 0.65200,
    stopLoss: 0.64800,
    takeProfit1: 0.65800,
    takeProfit2: 0.66200,
    risk: 'Low',
    confidence: 91,
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    summary: 'Strong support level holding with bullish hammer pattern.',
    summaryAr: 'مستوى دعم قوي متماسك مع نمط المطرقة الصاعدة.',
    isPremium: true,
    technicalAnalysis: '',
    technicalAnalysisAr: '',
    fundamentalAnalysis: '',
    fundamentalAnalysisAr: '',
    trend: 'Bullish',
    support: [0.64800, 0.64500, 0.64000],
    resistance: [0.65800, 0.66200, 0.66800],
    indicators: { rsi: 45, macd: 'Neutral', ema: 'Bullish', sma: 'Above SMA50', atr: 0.0012, bollingerBands: { upper: 0.660, middle: 0.652, lower: 0.644 } },
    notes: '',
    notesAr: '',
    tradesAnalyzed: 4156,
    aiModel: 'YuanBridge AI v2.4',
  },
];

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

  return (
    <section className="section-padding relative">
      <div className="absolute inset-0 dot-pattern opacity-30" />
      <div className="container-custom relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">{t('latest.title')}</h2>
          <p className="text-text-muted max-w-2xl mx-auto">{t('latest.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {mockStrategies.map((strategy, i) => (
            <StrategyCard key={strategy.id} strategy={strategy} index={i} />
          ))}
        </div>

        <div className="text-center">
          <Button variant="secondary" href={`/${lang}/strategies`}>
            {t('latest.viewAll')}
          </Button>
        </div>
      </div>
    </section>
  );
}
