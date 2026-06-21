import type { ValidatedStrategy, BacktestResult } from '@/lib/knowledge/types'
import type { Candle } from '@/lib/market-data/types'

export interface RiskAnalysis {
  var95: number
  expectedShortfall: number
  maxConsecutiveLosses: number
  riskScore: number
  recommendedPositionSize: number
  warnings: string[]
}

export function analyzeRisk(
  strategy: ValidatedStrategy,
  backtest: BacktestResult,
  candles?: Candle[],
): RiskAnalysis {
  const warnings: string[] = []
  const returns = generateReturnsFromBacktest(backtest)

  const var95 = calculateVaR(returns, 0.95)
  const expectedShortfall = calculateExpectedShortfall(returns, 0.95)
  const maxConsecutiveLosses = backtest.consecutiveLosses

  const riskScore = calculateRiskScore(backtest, var95, expectedShortfall)

  const recommendedPositionSize = calculatePositionSize(riskScore, backtest)

  if (backtest.maxDrawdown > 0.2) {
    warnings.push(`Max drawdown of ${(backtest.maxDrawdown * 100).toFixed(1)}% exceeds 20% threshold`)
  }

  if (backtest.consecutiveLosses > 5) {
    warnings.push(`High consecutive losses (${backtest.consecutiveLosses}) detected`)
  }

  if (backtest.profitFactor < 1.5) {
    warnings.push(`Profit factor ${backtest.profitFactor.toFixed(2)} is below 1.5`)
  }

  if (backtest.sharpeRatio < 1) {
    warnings.push(`Sharpe ratio ${backtest.sharpeRatio.toFixed(2)} is below 1.0`)
  }

  if (backtest.maxDrawdown > 0 && backtest.recoveryFactor < 1) {
    warnings.push('Strategy fails to recover from drawdowns')
  }

  if (var95 > 0.05) {
    warnings.push(`Value at Risk (95%) of ${(var95 * 100).toFixed(1)}% is high`)
  }

  if (strategy.risk === 'High' && var95 > 0.03) {
    warnings.push('High risk strategy with elevated VaR - consider reduced position sizing')
  }

  if (backtest.avgLoss > 0 && backtest.avgWin > 0 && backtest.avgRiskReward < 1.5) {
    warnings.push(`Average risk-reward ratio ${backtest.avgRiskReward.toFixed(2)} is below 1.5`)
  }

  if (backtest.standardDeviation > 0.02) {
    warnings.push(`High return volatility (σ=${(backtest.standardDeviation * 100).toFixed(1)}%)`)
  }

  return {
    var95,
    expectedShortfall,
    maxConsecutiveLosses,
    riskScore,
    recommendedPositionSize,
    warnings,
  }
}

function generateReturnsFromBacktest(backtest: BacktestResult): number[] {
  const returns: number[] = []
  const totalTrades = backtest.totalTrades
  const winRate = backtest.winRate
  const avgWin = backtest.avgWin
  const avgLoss = backtest.avgLoss

  for (let i = 0; i < totalTrades; i++) {
    const isWin = Math.random() < winRate
    returns.push(isWin ? avgWin : -avgLoss)
  }

  return returns
}

function calculateVaR(returns: number[], confidenceLevel: number): number {
  if (returns.length === 0) return 0

  const sorted = [...returns].sort((a, b) => a - b)
  const index = Math.floor((1 - confidenceLevel) * sorted.length)
  return Math.abs(sorted[Math.min(index, sorted.length - 1)])
}

function calculateExpectedShortfall(returns: number[], confidenceLevel: number): number {
  if (returns.length === 0) return 0

  const sorted = [...returns].sort((a, b) => a - b)
  const tailIndex = Math.floor((1 - confidenceLevel) * sorted.length)

  if (tailIndex === 0) return Math.abs(sorted[0])

  const tail = sorted.slice(0, tailIndex)
  if (tail.length === 0) return 0

  return Math.abs(tail.reduce((sum, r) => sum + r, 0) / tail.length)
}

function calculateRiskScore(
  backtest: BacktestResult,
  var95: number,
  expectedShortfall: number,
): number {
  let score = 100

  score -= backtest.maxDrawdown * 100
  score -= var95 * 200
  score -= expectedShortfall * 150

  if (backtest.sharpeRatio > 2) score += 15
  else if (backtest.sharpeRatio > 1.5) score += 10
  else if (backtest.sharpeRatio > 1) score += 5
  else if (backtest.sharpeRatio < 0.5) score -= 10

  if (backtest.profitFactor > 3) score += 10
  else if (backtest.profitFactor < 1.2) score -= 15

  if (backtest.recoveryFactor > 3) score += 10
  else if (backtest.recoveryFactor < 0.5) score -= 10

  if (backtest.consecutiveLosses > 10) score -= 20
  else if (backtest.consecutiveLosses > 5) score -= 10

  return Math.min(Math.max(Math.round(score), 0), 100)
}

function calculatePositionSize(riskScore: number, backtest: BacktestResult): number {
  let baseSize = riskScore / 100

  if (backtest.maxDrawdown > 0.2) {
    baseSize *= 0.5
  }

  if (backtest.consecutiveLosses > 5) {
    baseSize *= 0.7
  }

  if (backtest.sharpeRatio < 0.5) {
    baseSize *= 0.5
  }

  const positionSize = Math.max(baseSize * 100, 1)
  return Math.min(Math.round(positionSize * 10) / 10, 100)
}
