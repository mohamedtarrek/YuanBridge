import { ForwardTestResult, ValidatedStrategy } from '@/lib/knowledge/types'
import { generateHistoricalData } from '@/lib/knowledge/backtest/market-simulator'
import { Signal, ForwardTestConfig, ForwardTestState, ActiveForwardPosition } from './types'
import { generateSignals, generateExitSignals } from './signal-generator'
import { trackPerformance, completeTest, getTestMetrics } from './performance-tracker'

const DEFAULT_CONFIG: ForwardTestConfig = {
  durationDays: 30,
  checkIntervalMinutes: 60,
  requireSignals: 5,
  confidenceThreshold: 40,
}

interface ForwardTestSummary {
  result: ForwardTestResult
  signalsGenerated: number
  config: ForwardTestConfig
}

function generateTestId(): string {
  return `ft_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

async function simulateForwardPeriod(
  strategy: ValidatedStrategy,
  config: ForwardTestConfig,
): Promise<{ signals: Signal[]; state: ForwardTestState }> {
  const testId = generateTestId()
  const candles = generateHistoricalData(
    strategy.currencyPair,
    config.durationDays,
    '1h',
    { trend: 'neutral', volatilityMultiplier: 0.7 },
  )

  const signals: Signal[] = []
  let activePosition: ActiveForwardPosition | null = null
  const entriesPerDay = Math.round(24 / (config.checkIntervalMinutes / 60))
  const checkInterval = Math.round(60 / (config.checkIntervalMinutes / 60))
  const step = Math.max(1, checkInterval)

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
    timeframes: ['1h'],
    pairs: [strategy.currencyPair],
    riskLevel: strategy.risk === 'High' ? 'high' : strategy.risk === 'Low' ? 'low' : 'medium',
    marketCondition: [],
  }

  for (let i = 50; i < candles.length; i += step) {
    if (activePosition) {
      const currentCandle = candles[i]
      const newHigh = Math.max(activePosition.highestPrice, currentCandle.high)
      const newLow = Math.min(activePosition.lowestPrice, currentCandle.low)
      activePosition.highestPrice = newHigh
      activePosition.lowestPrice = newLow

      const exitSignals = generateExitSignals(
        {
          entryPrice: activePosition.entryPrice,
          direction: activePosition.direction,
          stopLoss: activePosition.stopLoss,
          takeProfit: activePosition.takeProfit,
          trailingStopPct: activePosition.trailingStopPct,
          highestPrice: activePosition.highestPrice,
          lowestPrice: activePosition.lowestPrice,
        },
        currentCandle,
        testId,
        activePosition.signalId,
      )

      if (exitSignals.length > 0) {
        signals.push(...exitSignals)
        activePosition = null
      }
    }

    if (!activePosition) {
      const currentSlice = candles.slice(Math.max(0, i - 20), i + 1)
      const newSignals = generateSignals(
        rules,
        currentSlice,
        candles.slice(0, i + 1),
        testId,
        {
          confidenceThreshold: config.confidenceThreshold,
          direction: strategy.direction,
        },
      )

      for (const signal of newSignals) {
        if (signal.type === 'ENTRY') {
          signals.push(signal)

          const stopLossPrice = strategy.stopLoss
          const takeProfitPrice = strategy.takeProfit1

          activePosition = {
            signalId: signal.id,
            entryPrice: signal.price,
            direction: strategy.direction,
            quantity: 1,
            stopLoss: stopLossPrice,
            takeProfit: takeProfitPrice,
            entryTime: signal.timestamp,
            highestPrice: signal.price,
            lowestPrice: signal.price,
            trailingStopPct: null,
          }
        }
      }
    }

    const elapsedDays = (i / candles.length) * config.durationDays
    if (elapsedDays >= config.durationDays) {
      break
    }
  }

  const state: ForwardTestState = {
    testId,
    strategyId: strategy.id,
    status: signals.length >= config.requireSignals ? 'completed' : 'failed',
    signals,
    activePosition,
    completedTrades: signals.filter((s) => s.type === 'EXIT').length,
    wins: signals.filter((s) => s.result === 'win').length,
    losses: signals.filter((s) => s.result === 'loss').length,
    totalProfitLoss: signals
      .filter((s) => s.profitLoss !== undefined)
      .reduce((sum, s) => sum + (s.profitLoss ?? 0), 0),
    startDate: new Date(candles[0]?.timestamp ?? Date.now()).toISOString(),
    endDate: new Date(candles[candles.length - 1]?.timestamp ?? Date.now()).toISOString(),
    lastCheckTime: new Date().toISOString(),
  }

  return { signals, state }
}

function computeForwardTestResult(
  state: ForwardTestState,
): ForwardTestResult {
  const entrySignals = state.signals.filter((s) => s.type === 'ENTRY')
  const exitSignals = state.signals.filter((s) => s.type === 'EXIT' && s.result)
  const completedExits = exitSignals.filter(
    (s) => s.result === 'win' || s.result === 'loss',
  )

  const wins = completedExits.filter((s) => s.result === 'win').length
  const losses = completedExits.filter((s) => s.result === 'loss').length
  const totalCompleted = wins + losses

  const winRate = totalCompleted > 0 ? (wins / totalCompleted) * 100 : 0

  const grossProfit = completedExits
    .filter((s) => (s.profitLoss ?? 0) > 0)
    .reduce((sum, s) => sum + (s.profitLoss ?? 0), 0)
  const grossLoss = Math.abs(
    completedExits
      .filter((s) => (s.profitLoss ?? 0) < 0)
      .reduce((sum, s) => sum + (s.profitLoss ?? 0), 0),
  )
  const profitFactor =
    grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 1

  const plValues = completedExits.map((s) => s.profitLoss ?? 0)
  const avgPL =
    plValues.length > 0
      ? plValues.reduce((a, b) => a + b, 0) / plValues.length
      : 0
  const variance =
    plValues.length > 1
      ? plValues.reduce((sum, v) => sum + (v - avgPL) ** 2, 0) / (plValues.length - 1)
      : 0
  const stdDev = Math.sqrt(variance)
  const sharpeRatio = stdDev > 0 ? (avgPL / stdDev) * Math.sqrt(365) : 0

  let peak = 0
  let maxDrawdown = 0
  let cumulative = 0
  for (const signal of completedExits) {
    cumulative += signal.profitLoss ?? 0
    if (cumulative > peak) peak = cumulative
    const dd = peak > 0 ? ((peak - cumulative) / peak) * 100 : 0
    if (dd > maxDrawdown) maxDrawdown = dd
  }

  const signalConfidenceValues = entrySignals.map((s) => s.confidence)
  const avgConfidence =
    signalConfidenceValues.length > 0
      ? signalConfidenceValues.reduce((a, b) => a + b, 0) /
        signalConfidenceValues.length
      : 0

  const confidenceScore =
    avgConfidence * 0.3 +
    winRate * 0.3 +
    Math.min(profitFactor / 2, 1) * 100 * 0.2 +
    Math.min(totalCompleted / 20, 1) * 100 * 0.2

  return {
    totalTrades: totalCompleted,
    winRate: Math.round(winRate * 100) / 100,
    profitFactor:
      profitFactor === Infinity
        ? Infinity
        : Math.round(profitFactor * 100) / 100,
    drawdown: Math.round(maxDrawdown * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    confidenceScore: Math.round(Math.min(confidenceScore, 100) * 100) / 100,
    startDate: state.startDate,
    endDate: state.endDate ?? new Date().toISOString(),
    currentStatus: state.status,
  }
}

export async function runForwardTest(
  strategy: ValidatedStrategy,
  config?: Partial<ForwardTestConfig>,
): Promise<ForwardTestSummary> {
  const resolvedConfig: ForwardTestConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  }

  const { signals, state } = await simulateForwardPeriod(
    strategy,
    resolvedConfig,
  )

  await trackPerformance(state.testId, signals)

  const completedExits = signals.filter(
    (s) => s.type === 'EXIT' && (s.result === 'win' || s.result === 'loss'),
  )

  if (completedExits.length >= resolvedConfig.requireSignals) {
    completeTest(state.testId)
  }

  const metrics = getTestMetrics(state.testId)
  const result = computeForwardTestResult(state)

  return {
    result,
    signalsGenerated: signals.length,
    config: resolvedConfig,
  }
}

export { DEFAULT_CONFIG }
export type { ForwardTestSummary }
