import { BacktestResult } from '@/lib/knowledge/types'
import { Trade } from './trade-executor'

export function calculateWinRate(trades: Trade[]): number {
  if (trades.length === 0) return 0
  const wins = trades.filter((t) => t.profitLoss > 0).length
  return (wins / trades.length) * 100
}

export function calculateLossRate(trades: Trade[]): number {
  if (trades.length === 0) return 0
  const losses = trades.filter((t) => t.profitLoss <= 0).length
  return (losses / trades.length) * 100
}

export function calculateProfitFactor(trades: Trade[]): number {
  const grossProfit = trades
    .filter((t) => t.profitLoss > 0)
    .reduce((sum, t) => sum + t.profitLoss, 0)
  const grossLoss = Math.abs(
    trades
      .filter((t) => t.profitLoss < 0)
      .reduce((sum, t) => sum + t.profitLoss, 0),
  )
  if (grossLoss === 0) return trades.length > 0 ? grossProfit > 0 ? Infinity : 1 : 1
  return grossProfit / grossLoss
}

export function calculateMaxDrawdown(trades: Trade[]): number {
  if (trades.length === 0) return 0

  let peak = 0
  let maxDrawdown = 0
  let cumulative = 0

  for (const trade of trades) {
    cumulative += trade.profitLoss
    if (cumulative > peak) {
      peak = cumulative
    }
    const drawdown = peak - cumulative
    const drawdownPct = peak > 0 ? (drawdown / peak) * 100 : 0
    if (drawdownPct > maxDrawdown) {
      maxDrawdown = drawdownPct
    }
  }

  return Math.round(maxDrawdown * 100) / 100
}

export function calculateSharpeRatio(trades: Trade[], riskFreeRate: number = 0.02): number {
  if (trades.length < 2) return 0

  const returns = trades.map((t) => t.profitLossPercent)
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length

  const variance =
    returns.reduce((sum, r) => sum + (r - meanReturn) ** 2, 0) / (returns.length - 1)
  const stdDev = Math.sqrt(variance)

  if (stdDev === 0) return 0

  const dailyRiskFree = riskFreeRate / 365
  const excessReturn = meanReturn / trades.length - dailyRiskFree
  const sharpe = (excessReturn / stdDev) * Math.sqrt(365)

  return Math.round(sharpe * 100) / 100
}

export function calculateRecoveryFactor(trades: Trade[]): number {
  if (trades.length === 0) return 0
  const netProfit = calculateNetProfit(trades)
  const maxDD = calculateMaxDrawdown(trades)
  if (maxDD === 0) return netProfit > 0 ? Infinity : 0
  return Math.round((netProfit / maxDD) * 100) / 100
}

export function calculateAvgRiskReward(trades: Trade[]): number {
  const wins = trades.filter((t) => t.profitLoss > 0)
  const losses = trades.filter((t) => t.profitLoss < 0)

  if (wins.length === 0 || losses.length === 0) return 0

  const avgWin = wins.reduce((sum, t) => sum + t.profitLoss, 0) / wins.length
  const avgLoss =
    Math.abs(losses.reduce((sum, t) => sum + t.profitLoss, 0)) / losses.length

  if (avgLoss === 0) return avgWin > 0 ? Infinity : 0
  return Math.round((avgWin / avgLoss) * 100) / 100
}

export function calculateConsecutiveWins(trades: Trade[]): number {
  let maxStreak = 0
  let currentStreak = 0

  for (const trade of trades) {
    if (trade.profitLoss > 0) {
      currentStreak++
      if (currentStreak > maxStreak) maxStreak = currentStreak
    } else {
      currentStreak = 0
    }
  }

  return maxStreak
}

export function calculateConsecutiveLosses(trades: Trade[]): number {
  let maxStreak = 0
  let currentStreak = 0

  for (const trade of trades) {
    if (trade.profitLoss <= 0) {
      currentStreak++
      if (currentStreak > maxStreak) maxStreak = currentStreak
    } else {
      currentStreak = 0
    }
  }

  return maxStreak
}

export function calculateTradeFrequency(trades: Trade[], periodDays: number): number {
  if (periodDays <= 0 || trades.length === 0) return 0
  return Math.round((trades.length / periodDays) * 100) / 100
}

export function calculateNetProfit(trades: Trade[]): number {
  return Math.round(trades.reduce((sum, t) => sum + t.profitLoss, 0) * 100) / 100
}

export function calculateTotalReturn(trades: Trade[], initialCapital: number = 10000): number {
  if (initialCapital <= 0) return 0
  const netProfit = calculateNetProfit(trades)
  return Math.round((netProfit / initialCapital) * 10000) / 100
}

export function calculateExpectancy(trades: Trade[]): number {
  if (trades.length === 0) return 0

  const winRate = calculateWinRate(trades) / 100
  const lossRate = calculateLossRate(trades) / 100

  const wins = trades.filter((t) => t.profitLoss > 0)
  const losses = trades.filter((t) => t.profitLoss < 0)

  const avgWin = wins.length > 0
    ? wins.reduce((sum, t) => sum + t.profitLoss, 0) / wins.length
    : 0
  const avgLoss = losses.length > 0
    ? Math.abs(losses.reduce((sum, t) => sum + t.profitLoss, 0)) / losses.length
    : 0

  return Math.round((winRate * avgWin - lossRate * avgLoss) * 100) / 100
}

export function calculateAvgWin(trades: Trade[]): number {
  const wins = trades.filter((t) => t.profitLoss > 0)
  if (wins.length === 0) return 0
  return Math.round(wins.reduce((sum, t) => sum + t.profitLoss, 0) / wins.length * 100) / 100
}

export function calculateAvgLoss(trades: Trade[]): number {
  const losses = trades.filter((t) => t.profitLoss < 0)
  if (losses.length === 0) return 0
  return Math.round(losses.reduce((sum, t) => sum + t.profitLoss, 0) / losses.length * 100) / 100
}

export function calculateLargestWin(trades: Trade[]): number {
  if (trades.length === 0) return 0
  return Math.round(Math.max(...trades.map((t) => t.profitLoss)) * 100) / 100
}

export function calculateLargestLoss(trades: Trade[]): number {
  if (trades.length === 0) return 0
  return Math.round(Math.min(...trades.map((t) => t.profitLoss)) * 100) / 100
}

export function calculateStandardDeviation(trades: Trade[]): number {
  if (trades.length < 2) return 0
  const returns = trades.map((t) => t.profitLossPercent)
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (returns.length - 1)
  return Math.round(Math.sqrt(variance) * 100) / 100
}

export function calculateAllMetrics(
  trades: Trade[],
  periodDays: number,
  initialCapital: number = 10000,
): BacktestResult {
  const startDate = trades.length > 0 ? trades[0].entryTime : new Date().toISOString()
  const endDate = trades.length > 0 ? trades[trades.length - 1].exitTime : new Date().toISOString()

  return {
    totalTrades: trades.length,
    winRate: Math.round(calculateWinRate(trades) * 100) / 100,
    lossRate: Math.round(calculateLossRate(trades) * 100) / 100,
    profitFactor: calculateProfitFactor(trades),
    maxDrawdown: calculateMaxDrawdown(trades),
    sharpeRatio: calculateSharpeRatio(trades),
    recoveryFactor: calculateRecoveryFactor(trades),
    avgRiskReward: calculateAvgRiskReward(trades),
    consecutiveWins: calculateConsecutiveWins(trades),
    consecutiveLosses: calculateConsecutiveLosses(trades),
    tradeFrequency: calculateTradeFrequency(trades, periodDays),
    netProfit: calculateNetProfit(trades),
    totalReturn: calculateTotalReturn(trades, initialCapital),
    avgWin: calculateAvgWin(trades),
    avgLoss: calculateAvgLoss(trades),
    largestWin: calculateLargestWin(trades),
    largestLoss: calculateLargestLoss(trades),
    expectancy: calculateExpectancy(trades),
    standardDeviation: calculateStandardDeviation(trades),
    startDate,
    endDate,
  }
}
