import type { ValidatedStrategy, BacktestResult, ForwardTestResult } from '@/lib/knowledge/types'

const WEIGHTS = {
  backtestPerformance: 0.4,
  forwardTestPerformance: 0.25,
  riskMetrics: 0.15,
  ruleCompleteness: 0.1,
  sourceReliability: 0.1,
} as const

const GRADE_THRESHOLDS = {
  A: 90,
  B: 75,
  C: 60,
  D: 40,
  F: 0,
} as const

function scoreBacktestPerformance(backtest: BacktestResult): number {
  let score = 0

  const winRateScore = Math.min(backtest.winRate * 100, 20)
  const profitFactorScore = Math.min((backtest.profitFactor / 3) * 20, 20)
  const sharpeScore = Math.min((backtest.sharpeRatio / 2) * 15, 15)
  const drawdownPenalty = Math.max(0, 15 - backtest.maxDrawdown * 15)
  const recoveryScore = Math.min(backtest.recoveryFactor * 5, 10)
  const expectancyScore = Math.min(Math.abs(backtest.expectancy) * 10, 10)
  const consistencyScore = backtest.consecutiveLosses > 5
    ? 0
    : Math.max(0, 10 - backtest.consecutiveLosses * 2)

  score = winRateScore + profitFactorScore + sharpeScore + drawdownPenalty
    + recoveryScore + expectancyScore + consistencyScore

  return Math.min(Math.max(score, 0), 100)
}

function scoreForwardTest(forwardTest: ForwardTestResult | null): number {
  if (!forwardTest) return 0

  let score = 0

  const winRateScore = Math.min(forwardTest.winRate * 100, 30)
  const profitFactorScore = Math.min((forwardTest.profitFactor / 3) * 30, 30)
  const sharpeScore = Math.min((forwardTest.sharpeRatio / 2) * 20, 20)
  const drawdownPenalty = Math.max(0, 20 - forwardTest.drawdown * 20)

  score = winRateScore + profitFactorScore + sharpeScore + drawdownPenalty

  return Math.min(Math.max(score, 0), 100)
}

function scoreRiskMetrics(backtest: BacktestResult): number {
  let score = 0

  const maxDrawdownScore = backtest.maxDrawdown < 0.05
    ? 30
    : backtest.maxDrawdown < 0.1
      ? 25
      : backtest.maxDrawdown < 0.15
        ? 20
        : backtest.maxDrawdown < 0.2
          ? 15
          : backtest.maxDrawdown < 0.3
            ? 10
            : 0

  const recoveryFactorScore = backtest.recoveryFactor > 3
    ? 25
    : backtest.recoveryFactor > 2
      ? 20
      : backtest.recoveryFactor > 1
        ? 15
        : backtest.recoveryFactor > 0.5
          ? 10
          : 5

  const sharpeScore = backtest.sharpeRatio > 2
    ? 25
    : backtest.sharpeRatio > 1.5
      ? 20
      : backtest.sharpeRatio > 1
        ? 15
        : backtest.sharpeRatio > 0.5
          ? 10
          : 5

  const profitFactorScore = backtest.profitFactor > 2.5
    ? 20
    : backtest.profitFactor > 2
      ? 15
      : backtest.profitFactor > 1.5
        ? 10
        : backtest.profitFactor > 1
          ? 5
          : 0

  score = maxDrawdownScore + recoveryFactorScore + sharpeScore + profitFactorScore

  return Math.min(Math.max(score, 0), 100)
}

function scoreRuleCompleteness(strategy: ValidatedStrategy): number {
  if (!strategy.extractedRules) return 0

  const rules = strategy.extractedRules
  let totalCategories = 0
  let filledCategories = 0

  const categories: (keyof typeof rules)[] = [
    'entryConditions',
    'exitConditions',
    'stopLossRules',
    'positionSizing',
    'filters',
    'indicators',
    'timeframes',
    'pairs',
    'marketCondition',
  ]

  for (const category of categories) {
    totalCategories++
    const arr = rules[category]
    if (Array.isArray(arr) && arr.length > 0) {
      filledCategories++
    }
  }

  return Math.round((filledCategories / totalCategories) * 100)
}

const RELIABLE_SOURCES: Record<string, number> = {
  tradingview: 90,
  github: 85,
  forum: 70,
  reddit: 60,
  web_page: 50,
  youtube: 45,
  twitter: 40,
  telegram: 35,
  discord: 35,
  rss_feed: 50,
}

function scoreSourceReliability(strategy: ValidatedStrategy): number {
  return RELIABLE_SOURCES[strategy.sourceAttribution] ?? 50
}

export function scoreStrategy(
  strategy: ValidatedStrategy,
  backtest: BacktestResult,
  forwardTest: ForwardTestResult | null,
): number {
  const backtestScore = scoreBacktestPerformance(backtest)
  const forwardTestScore = scoreForwardTest(forwardTest)
  const riskScore = scoreRiskMetrics(backtest)
  const completenessScore = scoreRuleCompleteness(strategy)
  const sourceScore = scoreSourceReliability(strategy)

  const total = forwardTest
    ? backtestScore * WEIGHTS.backtestPerformance
      + forwardTestScore * WEIGHTS.forwardTestPerformance
      + riskScore * WEIGHTS.riskMetrics
      + completenessScore * WEIGHTS.ruleCompleteness
      + sourceScore * WEIGHTS.sourceReliability
    : backtestScore * (WEIGHTS.backtestPerformance + WEIGHTS.forwardTestPerformance)
      + riskScore * WEIGHTS.riskMetrics
      + completenessScore * WEIGHTS.ruleCompleteness
      + sourceScore * WEIGHTS.sourceReliability

  return Math.min(Math.max(Math.round(total), 0), 100)
}

export function getScoreGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= GRADE_THRESHOLDS.A) return 'A'
  if (score >= GRADE_THRESHOLDS.B) return 'B'
  if (score >= GRADE_THRESHOLDS.C) return 'C'
  if (score >= GRADE_THRESHOLDS.D) return 'D'
  return 'F'
}

export function shouldPublish(score: number): boolean {
  const grade = getScoreGrade(score)
  return grade === 'A' || grade === 'B' || grade === 'C'
}

export function shouldBePremium(score: number): boolean {
  const grade = getScoreGrade(score)
  return grade === 'A' || grade === 'B'
}
