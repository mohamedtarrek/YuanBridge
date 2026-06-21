import { Candle } from '@/lib/market-data/types'

export interface Signal {
  id: string
  testId: string
  type: 'ENTRY' | 'EXIT'
  direction: 'BUY' | 'SELL'
  price: number
  timestamp: string
  confidence: number
  reason: string
  result?: 'win' | 'loss' | 'pending'
  profitLoss?: number
  closedAt?: string
}

export interface ForwardTestConfig {
  durationDays: number
  checkIntervalMinutes: number
  requireSignals: number
  confidenceThreshold: number
}

export interface ActiveForwardPosition {
  signalId: string
  entryPrice: number
  direction: 'BUY' | 'SELL'
  quantity: number
  stopLoss: number
  takeProfit: number
  entryTime: string
  highestPrice: number
  lowestPrice: number
  trailingStopPct: number | null
}

export interface ForwardTestState {
  testId: string
  strategyId: string
  status: 'active' | 'completed' | 'failed'
  signals: Signal[]
  activePosition: ActiveForwardPosition | null
  completedTrades: number
  wins: number
  losses: number
  totalProfitLoss: number
  startDate: string
  endDate: string | null
  lastCheckTime: string | null
}

export interface MarketSnapshot {
  timestamp: string
  candles: Candle[]
}
