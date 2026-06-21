import type { TradingRules, ContentSource, ValidatedStrategy } from '@/lib/knowledge/types'

const SOURCE_MULTIPLIERS: Record<ContentSource, number> = {
  tradingview: 0.9,
  rss_feed: 0.8,
  twitter: 0.6,
  telegram: 0.6,
  discord: 0.5,
  reddit: 0.5,
  youtube: 0.6,
  github: 0.7,
  web_page: 0.7,
  forum: 0.5,
}

const MAX_RULE_SCORE = 10

function countNonEmptyRules(rules: TradingRules): number {
  let count = 0
  if (rules.entryConditions.length > 0) count += 2
  if (rules.exitConditions.length > 0) count += 2
  if (rules.stopLossRules.length > 0) count += 2
  if (rules.positionSizing.length > 0) count += 1
  if (rules.filters.length > 0) count += 1
  if (rules.indicators.length > 0) count += 1
  if (rules.timeframes.length > 0) count += 0.5
  if (rules.pairs.length > 0) count += 0.5
  return count
}

export function calculateExtractionConfidence(rules: TradingRules): number {
  const rawScore = countNonEmptyRules(rules)
  const baseConfidence = Math.min(rawScore / MAX_RULE_SCORE, 1)

  const detailsScore =
    (rules.entryConditions.length > 0 && rules.exitConditions.length > 0 ? 0.2 : 0) +
    (rules.stopLossRules.length > 0 ? 0.15 : 0) +
    (rules.positionSizing.length > 0 ? 0.1 : 0) +
    (rules.indicators.length > 0 ? 0.05 : 0) +
    (rules.timeframes.length > 0 ? 0.05 : 0) +
    (rules.pairs.length > 0 ? 0.05 : 0)

  const confidence = baseConfidence * 0.6 + detailsScore * 0.4

  return Math.round(Math.min(confidence, 1) * 100) / 100
}

export function getSourceMultiplier(source: ContentSource): number {
  return SOURCE_MULTIPLIERS[source] ?? 0.5
}

export function calculateSourceConfidence(source: ContentSource): number {
  return getSourceMultiplier(source)
}

export function calculateStrategyConfidence(strategy: ValidatedStrategy): number {
  const extractionConfidence = calculateExtractionConfidence(
    strategy.extractedRules ?? {
      entryConditions: [],
      exitConditions: [],
      stopLossRules: [],
      positionSizing: [],
      filters: [],
      indicators: [],
      timeframes: [],
      pairs: [],
      riskLevel: 'medium',
      marketCondition: [],
    },
  )

  const sourceConfidence = calculateSourceConfidence(strategy.sourceAttribution as ContentSource)

  const hasSL = strategy.stopLoss > 0
  const hasTP1 = strategy.takeProfit1 > 0
  const hasTP2 = strategy.takeProfit2 > 0
  const hasIndicators =
    strategy.indicators.rsi > 0 ||
    strategy.indicators.atr > 0 ||
    strategy.indicators.macd !== '' ||
    strategy.indicators.ema !== ''

  const structureScore =
    (strategy.entryPrice > 0 ? 0.15 : 0) +
    (hasSL ? 0.15 : 0) +
    (hasTP1 ? 0.1 : 0) +
    (hasTP2 ? 0.05 : 0) +
    (strategy.currencyPair !== '' ? 0.05 : 0) +
    (hasIndicators ? 0.1 : 0)

  const rrRatio = strategy.takeProfit1 - strategy.entryPrice !== 0
    ? Math.abs((strategy.takeProfit2 - strategy.entryPrice) / (strategy.stopLoss - strategy.entryPrice))
    : 0
  const rrScore = rrRatio >= 1.5 ? 0.1 : rrRatio >= 1 ? 0.05 : 0

  const confidence =
    extractionConfidence * 0.3 +
    sourceConfidence * 0.15 +
    structureScore * 0.4 +
    rrScore * 0.15

  return Math.round(Math.min(confidence, 1) * 100) / 100
}
