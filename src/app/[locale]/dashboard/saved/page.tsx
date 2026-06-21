'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Strategy } from '@/lib/types';

const savedStrategies: Strategy[] = [
  { id: '1', title: 'EUR/USD Bullish Breakout', titleAr: 'انفراج صاعد لليورو مقابل الدولار', currencyPair: 'EUR/USD', direction: 'BUY', entryPrice: 1.08450, stopLoss: 1.07800, takeProfit1: 1.09200, takeProfit2: 1.09800, risk: 'Low', confidence: 87, publishedAt: new Date(Date.now() - 86400000).toISOString(), summary: 'Strong bullish momentum detected with RSI divergence.', summaryAr: 'تم اكتشاف زخم صاعد قوي مع تباعد في مؤشر RSI.', isPremium: false, technicalAnalysis: '', technicalAnalysisAr: '', fundamentalAnalysis: '', fundamentalAnalysisAr: '', trend: 'Bullish', support: [], resistance: [], indicators: { rsi: 62, macd: 'Bullish', ema: 'Bullish', sma: 'Above SMA50', atr: 0.0015, bollingerBands: { upper: 1.095, middle: 1.085, lower: 1.075 } }, notes: '', notesAr: '', tradesAnalyzed: 3421, aiModel: 'YuanBridge AI v2.4' },
  { id: '4', title: 'AUD/USD Support Bounce', titleAr: 'ارتداد الدعم للاسترالي مقابل الدولار', currencyPair: 'AUD/USD', direction: 'BUY', entryPrice: 0.65200, stopLoss: 0.64800, takeProfit1: 0.65800, takeProfit2: 0.66200, risk: 'Low', confidence: 91, publishedAt: new Date(Date.now() - 172800000).toISOString(), summary: 'Strong support level holding with bullish hammer pattern.', summaryAr: 'مستوى دعم قوي متماسك مع نمط المطرقة الصاعدة.', isPremium: true, technicalAnalysis: '', technicalAnalysisAr: '', fundamentalAnalysis: '', fundamentalAnalysisAr: '', trend: 'Bullish', support: [], resistance: [], indicators: { rsi: 45, macd: 'Neutral', ema: 'Bullish', sma: 'Above SMA50', atr: 0.0012, bollingerBands: { upper: 0.660, middle: 0.652, lower: 0.644 } }, notes: '', notesAr: '', tradesAnalyzed: 4156, aiModel: 'YuanBridge AI v2.4' },
  { id: '6', title: 'NZD/USD Double Bottom', titleAr: 'قاع مزدوج للنيوزيلندي مقابل الدولار', currencyPair: 'NZD/USD', direction: 'BUY', entryPrice: 0.60900, stopLoss: 0.60400, takeProfit1: 0.61550, takeProfit2: 0.62000, risk: 'Low', confidence: 85, publishedAt: new Date(Date.now() - 259200000).toISOString(), summary: 'Double bottom pattern confirmed with bullish RSI divergence.', summaryAr: 'تم تأكيد نمط القاع المزدوج مع تباعد صاعد لمؤشر RSI.', isPremium: true, technicalAnalysis: '', technicalAnalysisAr: '', fundamentalAnalysis: '', fundamentalAnalysisAr: '', trend: 'Bullish', support: [], resistance: [], indicators: { rsi: 52, macd: 'Neutral', ema: 'Bullish', sma: 'Above SMA50', atr: 0.0014, bollingerBands: { upper: 0.618, middle: 0.609, lower: 0.600 } }, notes: '', notesAr: '', tradesAnalyzed: 3120, aiModel: 'YuanBridge AI v2.4' },
  { id: '8', title: 'USD/CHF Trend Continuation', titleAr: 'استمرارية اتجاه الدولار مقابل الفرنك', currencyPair: 'USD/CHF', direction: 'BUY', entryPrice: 0.89300, stopLoss: 0.88800, takeProfit1: 0.89900, takeProfit2: 0.90400, risk: 'Low', confidence: 88, publishedAt: new Date(Date.now() - 345600000).toISOString(), summary: 'Strong uptrend with pullback to EMA50 support.', summaryAr: 'اتجاه صاعد قوي مع تراجع إلى دعم EMA50.', isPremium: true, technicalAnalysis: '', technicalAnalysisAr: '', fundamentalAnalysis: '', fundamentalAnalysisAr: '', trend: 'Bullish', support: [], resistance: [], indicators: { rsi: 55, macd: 'Bullish', ema: 'Bullish', sma: 'Above SMA50', atr: 0.0013, bollingerBands: { upper: 0.902, middle: 0.893, lower: 0.884 } }, notes: '', notesAr: '', tradesAnalyzed: 3640, aiModel: 'YuanBridge AI v2.5' },
];

function DirectionBadge({ direction }: { direction: 'BUY' | 'SELL' }) {
  const { t } = useLanguage();
  const isBuy = direction === 'BUY';
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
      isBuy ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
    }`}>
      {isBuy ? t('latest.buy') : t('latest.sell')}
    </span>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const color = risk === 'Low' ? 'text-success border-success/30 bg-success/5' :
    risk === 'Medium' ? 'text-warning border-warning/30 bg-warning/5' :
    'text-danger border-danger/30 bg-danger/5';
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${color}`}>
      {risk}
    </span>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
} as const;
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
} as const;

export default function SavedStrategiesPage() {
  const { t, lang, isRTL } = useLanguage();
  const [strategies, setStrategies] = useState(savedStrategies);

  const removeStrategy = (id: string) => {
    setStrategies((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-2">{t('dashboard.saved')}</h2>
        <p className="text-text-muted">
          {lang === 'ar'
            ? `لديك ${strategies.length} استراتيجيات محفوظة`
            : `You have ${strategies.length} saved ${strategies.length === 1 ? 'strategy' : 'strategies'}`}
        </p>
      </motion.div>

      {strategies.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="glass rounded-2xl p-12 text-center border border-border"
        >
          <svg className="w-16 h-16 text-text-dim mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p className="text-text-muted text-lg mb-2">{t('dashboard.noSavedStrategies') || 'No saved strategies yet'}</p>
          <p className="text-text-dim text-sm">{t('dashboard.savedStrategiesHint') || 'Browse strategies and save your favorites for quick access'}</p>
          <a
            href={`/${lang}/strategies`}
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl btn-primary text-sm font-semibold"
          >
            {t('dashboard.viewStrategies') || 'Browse Strategies'}
          </a>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {strategies.map((strategy, i) => (
              <motion.div
                key={strategy.id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-2xl p-5 border border-border group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-accent-500 font-bold text-sm tracking-wider">{strategy.currencyPair}</span>
                  <DirectionBadge direction={strategy.direction} />
                </div>

                <h3 className="text-text font-semibold text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                  {isRTL ? strategy.titleAr : strategy.title}
                </h3>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-text-dim">{t('latest.entry')}:</span>
                    <span className="text-text font-medium">{strategy.entryPrice}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-text-dim">{t('latest.sl')}:</span>
                    <span className="text-danger font-medium">{strategy.stopLoss}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-text-dim">{t('latest.tp1')}:</span>
                    <span className="text-success font-medium">{strategy.takeProfit1}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-text-dim">{t('latest.tp2')}:</span>
                    <span className="text-success font-medium">{strategy.takeProfit2}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <RiskBadge risk={strategy.risk} />
                  <div className="text-xs">
                    <span className="text-text-dim">{t('latest.confidence')}: </span>
                    <span className="font-bold gradient-text">{strategy.confidence}%</span>
                  </div>
                </div>

                <div className="w-full h-1.5 rounded-full bg-surface-lighter mb-4 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full chart-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${strategy.confidence}%` }}
                    transition={{ duration: 1, delay: i * 0.08, ease: 'easeOut' }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-dim text-xs">
                    {new Date(strategy.publishedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  <button
                    onClick={() => removeStrategy(strategy.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-danger bg-danger/10 border border-danger/20 hover:bg-danger/20 transition-all"
                  >
                    {t('common.remove') || 'Remove'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
