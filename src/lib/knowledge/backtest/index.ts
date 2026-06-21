import { BacktestResult, ValidatedStrategy } from '@/lib/knowledge/types'
import { generateHistoricalData, GenerateOptions } from './market-simulator'
import { executeBacktestTrades } from './trade-executor'
import { calculateAllMetrics } from './metrics-calculator'
import { meetsMinimumThresholds, getStrategyQuality } from './quality-thresholds'

export interface BacktestOptions {
  days?: number
  interval?: string
  initialCapital?: number
  commission?: number
  slippage?: number
  marketTrend?: 'bullish' | 'bearish' | 'neutral'
}

export interface BacktestSummary {
  result: BacktestResult
  passesMinimums: boolean
  quality: 'poor' | 'average' | 'good' | 'excellent'
  tradesExecuted: number
  simulationDays: number
}

export async function runBacktest(
  strategy: ValidatedStrategy,
  options?: BacktestOptions,
): Promise<BacktestSummary> {
  const days = options?.days ?? 365
  const interval = options?.interval ?? '1d'
  const initialCapital = options?.initialCapital ?? 10000
  const commission = options?.commission ?? 0.001
  const slippage = options?.slippage ?? 0.0005

  const genOptions: GenerateOptions = {
    days,
    trend: options?.marketTrend ?? 'neutral',
  }

  const candles = generateHistoricalData(
    strategy.currencyPair,
    days,
    interval,
    genOptions,
  )

  const rules = strategy.extractedRules ?? {
    entryConditions: [`Entry at ${strategy.entryPrice}`],
    exitConditions: [
      `Take profit at ${strategy.takeProfit1}`,
      ...(strategy.takeProfit2 ? [`Take profit at ${strategy.takeProfit2}`] : []),
    ],
    stopLossRules: [`Stop loss at ${strategy.stopLoss}`],
    positionSizing: ['Standard'],
    filters: [],
    indicators: [],
    timeframes: [interval],
    pairs: [strategy.currencyPair],
    riskLevel: strategy.risk === 'High' ? 'high' : strategy.risk === 'Low' ? 'low' : 'medium',
    marketCondition: [],
  }

  const trades = executeBacktestTrades(candles, rules, strategy.direction, {
    initialCapital,
    commission,
    slippage,
  })

  const result = calculateAllMetrics(trades, days, initialCapital)
  const passesMinimums = meetsMinimumThresholds(result)
  const quality = getStrategyQuality(result)

  return {
    result,
    passesMinimums,
    quality,
    tradesExecuted: trades.length,
    simulationDays: days,
  }
}
