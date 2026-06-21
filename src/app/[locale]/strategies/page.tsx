'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import type { Strategy } from '@/lib/types';

const CURRENCY_PAIRS = ['All', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP', 'USD/CHF', 'GBP/JPY', 'EUR/JPY'];
const RISK_LEVELS = ['All', 'Low', 'Medium', 'High'] as const;
const SORT_OPTIONS = ['newest', 'oldest', 'highest_confidence', 'lowest_confidence'] as const;

const ITEMS_PER_PAGE = 6;

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

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
        active
          ? 'bg-accent-500/20 text-accent-500 border border-accent-500/40 shadow-lg shadow-accent-500/5'
          : 'glass text-text-muted border border-border hover:border-border-light hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}

function SelectInput({ value, onChange, options, className = '' }: { value: string; onChange: (v: string) => void; options: readonly string[]; className?: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`input-field text-sm appearance-none cursor-pointer ${className}`}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function StrategyCard({ strategy, index }: { strategy: Strategy; index: number }) {
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';

  return (
    <motion.a
      href={`/${lang}/strategies/${strategy.id}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl p-5 group block"
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
          transition={{ duration: 1, delay: index * 0.08, ease: 'easeOut' }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-text-dim">
          {new Date(strategy.publishedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        {strategy.isPremium && (
          <span className="flex items-center gap-1 text-accent-500 font-medium">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {t('pricing.premium')}
          </span>
        )}
      </div>
    </motion.a>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-20 rounded bg-surface-lighter" />
        <div className="h-5 w-12 rounded-lg bg-surface-lighter" />
      </div>
      <div className="h-4 w-3/4 rounded bg-surface-lighter mb-4" />
      <div className="grid grid-cols-2 gap-3 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-3 w-full rounded bg-surface-lighter" />
        ))}
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-16 rounded bg-surface-lighter" />
        <div className="h-4 w-20 rounded bg-surface-lighter" />
      </div>
      <div className="h-1.5 w-full rounded-full bg-surface-lighter mb-4" />
      <div className="h-3 w-24 rounded bg-surface-lighter" />
    </div>
  );
}

function Pagination({ current, total, onPage }: { current: number; total: number; onPage: (n: number) => void }) {
  if (total <= 1) return null;
  const pages: (number | string)[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPage(current - 1)}
        disabled={current === 1}
        className="w-10 h-10 rounded-xl glass border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-border-light transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {pages.map((p, i) =>
        typeof p === 'string' ? (
          <span key={`ellipsis-${i}`} className="w-10 text-center text-text-dim text-sm">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
              p === current
                ? 'bg-accent-500/20 text-accent-500 border border-accent-500/40'
                : 'glass border border-border text-text-muted hover:text-text hover:border-border-light'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPage(current + 1)}
        disabled={current === total}
        className="w-10 h-10 rounded-xl glass border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-border-light transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default function StrategiesPage() {
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';
  const [loading, setLoading] = useState(true);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [directionFilter, setDirectionFilter] = useState<'All' | 'BUY' | 'SELL'>('All');
  const [premiumFilter, setPremiumFilter] = useState<'All' | 'Premium' | 'Free'>('All');
  const [currencyPair, setCurrencyPair] = useState('All');
  const [riskFilter, setRiskFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<string>('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(ITEMS_PER_PAGE));

    if (directionFilter !== 'All') {
      params.set('direction', directionFilter);
    }
    if (riskFilter !== 'All') {
      params.set('risk', riskFilter.toUpperCase());
    }
    if (premiumFilter !== 'All') {
      params.set('isPremium', premiumFilter === 'Premium' ? 'true' : 'false');
    }
    if (currencyPair !== 'All') {
      params.set('currencyPair', currencyPair);
    }
    if (search.trim()) {
      params.set('search', search);
    }
    params.set('sort', sort);

    setLoading(true);
    fetch(`/api/strategies?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setStrategies(data.strategies);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch(() => {
        setStrategies([]);
        setTotal(0);
        setTotalPages(0);
      })
      .finally(() => setLoading(false));
  }, [directionFilter, premiumFilter, currencyPair, riskFilter, search, sort, page]);

  useEffect(() => {
    setPage(1);
  }, [directionFilter, premiumFilter, currencyPair, riskFilter, search, sort]);

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-16 relative">
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="absolute top-40 right-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl" />

      <div className="container-custom relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-text mb-4">{t('strategies.title')}</h1>
          <p className="text-text-muted max-w-2xl mx-auto text-lg">{t('strategies.subtitle')}</p>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4 md:p-6 mb-8 border border-border"
        >
          {/* Direction + Premium Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <FilterButton active={directionFilter === 'All'} onClick={() => setDirectionFilter('All')}>
              {t('strategies.filterAll')}
            </FilterButton>
            <FilterButton active={directionFilter === 'BUY'} onClick={() => setDirectionFilter('BUY')}>
              {t('strategies.filterBuy')}
            </FilterButton>
            <FilterButton active={directionFilter === 'SELL'} onClick={() => setDirectionFilter('SELL')}>
              {t('strategies.filterSell')}
            </FilterButton>
            <span className="w-px h-6 bg-border mx-2 hidden sm:block" />
            <FilterButton active={premiumFilter === 'Premium'} onClick={() => setPremiumFilter('Premium')}>
              {t('strategies.filterPremium')}
            </FilterButton>
            <FilterButton active={premiumFilter === 'Free'} onClick={() => setPremiumFilter('Free')}>
              {t('strategies.filterFree')}
            </FilterButton>
          </div>

          {/* Selects + Search + Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SelectInput value={currencyPair} onChange={(v) => setCurrencyPair(v)} options={CURRENCY_PAIRS} />

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as 'All' | 'Low' | 'Medium' | 'High')}
              className="input-field text-sm appearance-none cursor-pointer"
            >
              {RISK_LEVELS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === 'All' ? t('strategies.filterAll') : t(`strategies.filter${opt}Risk` as any)}
                </option>
              ))}
            </select>

            <div className="relative">
              <svg className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim ${isRTL ? 'right-3' : 'left-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('strategies.search')}
                className={`input-field text-sm ${isRTL ? 'pr-10' : 'pl-10'}`}
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-field text-sm appearance-none cursor-pointer"
            >
              <option value="newest">{t('strategies.sortNewest')}</option>
              <option value="oldest">{t('strategies.sortOldest')}</option>
              <option value="highest_confidence">{t('strategies.sortHighestConfidence')}</option>
              <option value="lowest_confidence">{t('strategies.sortLowestConfidence')}</option>
            </select>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && strategies.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-12 text-center border border-border"
          >
            <svg className="w-16 h-16 text-text-dim mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-text-muted text-lg">{t('strategies.noResults')}</p>
          </motion.div>
        )}

        {/* Grid */}
        {!loading && strategies.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {strategies.map((strategy, i) => (
                <StrategyCard key={strategy.id} strategy={strategy} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Pagination current={page} total={totalPages} onPage={setPage} />
        )}

        {/* Results Count */}
        {!loading && total > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-6 text-text-dim text-sm"
          >
            {total} {t('common.status')}
          </motion.div>
        )}
      </div>
    </div>
  );
}
