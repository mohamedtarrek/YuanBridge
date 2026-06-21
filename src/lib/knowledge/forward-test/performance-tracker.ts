import { Signal, ForwardTestState } from './types'

interface RunningMetrics {
  totalSignals: number
  completedSignals: number
  pendingSignals: number
  wins: number
  losses: number
  winRate: number
  profitFactor: number
  totalProfitLoss: number
  largestWin: number
  largestLoss: number
  avgWin: number
  avgLoss: number
  currentStreak: number
  bestStreak: number
  worstStreak: number
  confidence: number
}

const activeTests = new Map<string, ForwardTestState>()

export async function trackPerformance(
  testId: string,
  signals: Signal[],
): Promise<RunningMetrics> {
  let state = activeTests.get(testId)

  if (!state) {
    state = {
      testId,
      strategyId: '',
      status: 'active',
      signals: [],
      activePosition: null,
      completedTrades: 0,
      wins: 0,
      losses: 0,
      totalProfitLoss: 0,
      startDate: new Date().toISOString(),
      endDate: null,
      lastCheckTime: null,
    }
    activeTests.set(testId, state)
  }

  for (const signal of signals) {
    const existing = state.signals.find((s) => s.id === signal.id)
    if (!existing) {
      state.signals.push(signal)
    }
  }

  state.lastCheckTime = new Date().toISOString()

  const metrics = computeMetrics(state)

  return metrics
}

function computeMetrics(state: ForwardTestState): RunningMetrics {
  const closedSignals = state.signals.filter(
    (s) => s.type === 'EXIT' && (s.result === 'win' || s.result === 'loss'),
  )
  const entrySignals = state.signals.filter((s) => s.type === 'ENTRY')
  const pendingEntries = entrySignals.filter((s) => {
    return !state.signals.some(
      (ex) => ex.type === 'EXIT' && ex.timestamp >= s.timestamp,
    )
  })

  const wins = closedSignals.filter((s) => s.result === 'win').length
  const losses = closedSignals.filter((s) => s.result === 'loss').length
  const totalClosed = wins + losses

  const winRate = totalClosed > 0 ? (wins / totalClosed) * 100 : 0

  const grossProfit = closedSignals
    .filter((s) => (s.profitLoss ?? 0) > 0)
    .reduce((sum, s) => sum + (s.profitLoss ?? 0), 0)
  const grossLoss = Math.abs(
    closedSignals
      .filter((s) => (s.profitLoss ?? 0) < 0)
      .reduce((sum, s) => sum + (s.profitLoss ?? 0), 0),
  )
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 1

  const totalPL = closedSignals.reduce((sum, s) => sum + (s.profitLoss ?? 0), 0)

  const plValues = closedSignals.map((s) => s.profitLoss ?? 0)
  const largestWin = plValues.length > 0 ? Math.max(...plValues) : 0
  const largestLoss = plValues.length > 0 ? Math.min(...plValues) : 0

  const winPLs = closedSignals.filter((s) => (s.profitLoss ?? 0) > 0).map((s) => s.profitLoss ?? 0)
  const lossPLs = closedSignals.filter((s) => (s.profitLoss ?? 0) < 0).map((s) => s.profitLoss ?? 0)
  const avgWin = winPLs.length > 0 ? winPLs.reduce((a, b) => a + b, 0) / winPLs.length : 0
  const avgLoss = lossPLs.length > 0 ? lossPLs.reduce((a, b) => a + b, 0) / lossPLs.length : 0

  let currentStreak = 0
  let bestStreak = 0
  let worstStreak = 0

  for (const signal of closedSignals) {
    if (signal.result === 'win') {
      currentStreak = currentStreak > 0 ? currentStreak + 1 : 1
      if (currentStreak > bestStreak) bestStreak = currentStreak
      worstStreak = 0
    } else {
      currentStreak = currentStreak < 0 ? currentStreak - 1 : -1
      if (currentStreak < worstStreak) worstStreak = currentStreak
      bestStreak = 0
    }
  }

  const confidence = computeForwardConfidence(
    winRate,
    profitFactor,
    totalClosed,
    entrySignals.length,
  )

  return {
    totalSignals: entrySignals.length,
    completedSignals: totalClosed,
    pendingSignals: pendingEntries.length,
    wins,
    losses,
    winRate: Math.round(winRate * 100) / 100,
    profitFactor:
      profitFactor === Infinity
        ? Infinity
        : Math.round(profitFactor * 100) / 100,
    totalProfitLoss: Math.round(totalPL * 100) / 100,
    largestWin: Math.round(largestWin * 100) / 100,
    largestLoss: Math.round(largestLoss * 100) / 100,
    avgWin: Math.round(avgWin * 100) / 100,
    avgLoss: Math.round(avgLoss * 100) / 100,
    currentStreak,
    bestStreak,
    worstStreak,
    confidence: Math.round(confidence * 100) / 100,
  }
}

function computeForwardConfidence(
  winRate: number,
  profitFactor: number,
  completedTrades: number,
  totalSignals: number,
): number {
  let score = 0
  const maxScore = 100

  const winRateScore = Math.min(winRate / 60, 1) * 30
  score += winRateScore

  const pfScore = Math.min(Math.log10(Math.max(profitFactor, 1)) / Math.log10(5), 1) * 25
  score += pfScore

  const sampleScore = Math.min(completedTrades / 30, 1) * 25
  score += sampleScore

  const signalRatio = totalSignals > 0 ? completedTrades / totalSignals : 0
  const completionScore = signalRatio * 20
  score += completionScore

  return Math.round(Math.min(score, maxScore))
}

export function getTestState(testId: string): ForwardTestState | undefined {
  return activeTests.get(testId)
}

export function getAllActiveTests(): ForwardTestState[] {
  return Array.from(activeTests.values()).filter((t) => t.status === 'active')
}

export function completeTest(testId: string): boolean {
  const state = activeTests.get(testId)
  if (!state) return false
  state.status = 'completed'
  state.endDate = new Date().toISOString()
  return true
}

export function failTest(testId: string, reason?: string): boolean {
  const state = activeTests.get(testId)
  if (!state) return false
  state.status = 'failed'
  state.endDate = new Date().toISOString()
  return true
}

export async function calculateAndUpdateMetrics(
  testId: string,
): Promise<RunningMetrics> {
  const state = activeTests.get(testId)
  if (!state) {
    throw new Error(`Test ${testId} not found`)
  }
  return computeMetrics(state)
}

export function getTestMetrics(testId: string): RunningMetrics | null {
  const state = activeTests.get(testId)
  if (!state) return null
  return computeMetrics(state)
}
