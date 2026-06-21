import { BacktestResult } from '@/lib/knowledge/types'

export const QUALITY_THRESHOLDS = {
  minimumWinRate: 45,
  minimumProfitFactor: 1.3,
  maximumDrawdown: 30,
  minimumSharpeRatio: 0.8,
  minimumTrades: 20,
  minimumConfidence: 40,
  targetWinRate: 55,
  targetProfitFactor: 1.8,
} as const

export function meetsMinimumThresholds(result: BacktestResult): boolean {
  if (result.totalTrades < QUALITY_THRESHOLDS.minimumTrades) return false
  if (result.winRate < QUALITY_THRESHOLDS.minimumWinRate) return false
  if (result.profitFactor < QUALITY_THRESHOLDS.minimumProfitFactor) return false
  if (result.maxDrawdown > QUALITY_THRESHOLDS.maximumDrawdown) return false
  if (result.sharpeRatio < QUALITY_THRESHOLDS.minimumSharpeRatio) return false

  return true
}

export function meetsPremiumThresholds(result: BacktestResult): boolean {
  if (!meetsMinimumThresholds(result)) return false
  if (result.winRate < QUALITY_THRESHOLDS.targetWinRate) return false
  if (result.profitFactor < QUALITY_THRESHOLDS.targetProfitFactor) return false

  return true
}

export function getStrategyQuality(result: BacktestResult): 'poor' | 'average' | 'good' | 'excellent' {
  const score = calculateQualityScore(result)

  if (score >= 85) return 'excellent'
  if (score >= 65) return 'good'
  if (score >= 40) return 'average'
  return 'poor'
}

function calculateQualityScore(result: BacktestResult): number {
  let score = 0
  const maxScore = 100

  const winRateScore = normalizeScore(result.winRate, 0, 70, 0, 30)
  score += winRateScore * 0.2

  const profitFactorScore = normalizeScore(result.profitFactor, 0, 3, 0, 25)
  score += profitFactorScore * 0.25

  const drawdownScore = normalizeScore(result.maxDrawdown, 50, 0, 0, 20)
  score += drawdownScore * 0.2

  const sharpeScore = normalizeScore(result.sharpeRatio, -1, 3, 0, 15)
  score += sharpeScore * 0.15

  const tradesScore = normalizeScore(result.totalTrades, 0, 100, 0, 10)
  score += tradesScore * 0.1

  const expectancyScore = normalizeScore(result.expectancy, -100, 200, 0, 10)
  score += expectancyScore * 0.1

  return Math.round(Math.min(score, maxScore))
}

function normalizeScore(
  value: number,
  min: number,
  max: number,
  scoreMin: number,
  scoreMax: number,
): number {
  if (max === min) return scoreMin
  const clamped = Math.max(min, Math.min(max, value))
  return ((clamped - min) / (max - min)) * (scoreMax - scoreMin) + scoreMin
}
