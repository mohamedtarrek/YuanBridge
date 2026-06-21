import { Candle } from '@/lib/market-data/types'
import { TradingRules } from '@/lib/knowledge/types'
import { Signal } from './types'

function extractConditions(rules: TradingRules): {
  entryPrice: number | null
  stopLoss: number | null
  takeProfit: number | null
  maxHoldCandles: number | null
  trailingStopPct: number | null
  minVolume: number | null
  minRsi: number | null
  maxRsi: number | null
} {
  const numMatch = (arr: string[], pattern: RegExp): number | null => {
    for (const s of arr) {
      const m = s.match(pattern)
      if (m) return parseFloat(m[1])
    }
    return null
  }

  return {
    entryPrice: numMatch(rules.entryConditions, /entry\s*(?:at|price)?\s*:?\s*([\d.]+)/i),
    stopLoss: numMatch(rules.stopLossRules, /stop\s*(?:loss)?\s*(?:at|:)?\s*([\d.]+)/i),
    takeProfit: numMatch(rules.exitConditions, /take\s*profit\s*(?:at|:)?\s*([\d.]+)/i),
    maxHoldCandles: numMatch(rules.exitConditions, /(?:exit|close|hold)\s*(?:after|for)?\s*(\d+)\s*(?:candles|days|bars)/i),
    trailingStopPct: numMatch(rules.stopLossRules, /trailing\s*(?:stop\s*)?(?:at|:)?\s*([\d.]+)\s*%/i),
    minVolume: numMatch(rules.filters, /volume\s*(?:>|>=|above|min)\s*([\d.]+)/i),
    minRsi: numMatch(rules.indicators, /rsi\s*(?:>|>=|above|min)\s*([\d.]+)/i),
    maxRsi: numMatch(rules.indicators, /rsi\s*(?:<|<=|below|max)\s*([\d.]+)/i),
  }
}

function calculateConfidence(
  conditions: ReturnType<typeof extractConditions>,
  candle: Candle,
  direction: string,
  allData: Candle[],
): number {
  let confidence = 50

  if (conditions.minVolume && candle.volume >= conditions.minVolume) {
    confidence += 10
  }

  const volumeAvg = allData.slice(-20).reduce((s, c) => s + c.volume, 0) / Math.min(20, allData.length)
  if (volumeAvg > 0 && candle.volume > volumeAvg * 1.5) {
    confidence += 10
  }

  const rsi = computeRSI(allData.slice(-14))
  if (conditions.minRsi && rsi >= conditions.minRsi) {
    confidence += 5
  }
  if (conditions.maxRsi && rsi <= conditions.maxRsi) {
    confidence += 5
  }

  const emaShort = computeEMA(allData, 9)
  const emaLong = computeEMA(allData, 21)

  if (direction === 'BUY' && emaShort > emaLong) {
    confidence += 10
  } else if (direction === 'SELL' && emaShort < emaLong) {
    confidence += 10
  }

  const candleRange = candle.high - candle.low
  const avgRange = allData.slice(-20).reduce((s, c) => s + (c.high - c.low), 0) / Math.min(20, allData.length)
  if (avgRange > 0 && candleRange > avgRange * 1.3) {
    confidence += 5
  }

  const pricePosition = (candle.close - candle.low) / (candle.high - candle.low)
  if (direction === 'BUY' && pricePosition > 0.6) {
    confidence += 5
  } else if (direction === 'SELL' && pricePosition < 0.4) {
    confidence += 5
  }

  return Math.max(0, Math.min(100, confidence))
}

function computeRSI(candles: Candle[]): number {
  if (candles.length < 2) return 50
  const gains: number[] = []
  const losses: number[] = []

  for (let i = 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close
    gains.push(Math.max(0, diff))
    losses.push(Math.max(0, -diff))
  }

  const avgGain = gains.reduce((s, v) => s + v, 0) / gains.length
  const avgLoss = losses.reduce((s, v) => s + v, 0) / losses.length

  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

function computeEMA(candles: Candle[], period: number): number {
  if (candles.length < period) return candles[candles.length - 1]?.close ?? 0
  const k = 2 / (period + 1)
  const slice = candles.slice(0, period)
  let ema = slice.reduce((s, c) => s + c.close, 0) / period

  for (let i = period; i < candles.length; i++) {
    ema = candles[i].close * k + ema * (1 - k)
  }

  return ema
}

let signalCounter = 0

function generateId(): string {
  signalCounter++
  return `sig_${Date.now()}_${signalCounter}`
}

export function generateSignals(
  rules: TradingRules,
  currentData: Candle[],
  allData: Candle[],
  testId: string,
  options?: {
    confidenceThreshold?: number
    direction?: 'BUY' | 'SELL'
  },
): Signal[] {
  const conditions = extractConditions(rules)
  const signals: Signal[] = []

  if (currentData.length === 0) return signals

  const latestCandle = currentData[currentData.length - 1]
  const direction = options?.direction ?? 'BUY'

  const confidence = calculateConfidence(conditions, latestCandle, direction, allData)
  const threshold = options?.confidenceThreshold ?? 40

  if (confidence >= threshold) {
    let entryTriggered = false
    let entryPrice = latestCandle.close
    let reason = ''

    if (direction === 'BUY') {
      if (conditions.entryPrice !== null) {
        if (latestCandle.low <= conditions.entryPrice && latestCandle.close >= conditions.entryPrice) {
          entryTriggered = true
          entryPrice = conditions.entryPrice
          reason = `Entry price ${conditions.entryPrice} reached (BUY signal)`
        } else if (latestCandle.close > conditions.entryPrice * 1.01) {
          entryTriggered = true
          reason = `Price ${latestCandle.close} above entry zone, momentum BUY`
        }
      } else {
        const emaShort = computeEMA(allData.slice(-9), 9)
        const emaLong = computeEMA(allData.slice(-21), 21)
        if (emaShort > emaLong && latestCandle.close > emaShort) {
          entryTriggered = true
          reason = `Golden cross BUY signal (EMA9 ${emaShort.toFixed(4)} > EMA21 ${emaLong.toFixed(4)})`
        }
      }
    } else {
      if (conditions.entryPrice !== null) {
        if (latestCandle.high >= conditions.entryPrice && latestCandle.close <= conditions.entryPrice) {
          entryTriggered = true
          entryPrice = conditions.entryPrice
          reason = `Entry price ${conditions.entryPrice} reached (SELL signal)`
        } else if (latestCandle.close < conditions.entryPrice * 0.99) {
          entryTriggered = true
          reason = `Price ${latestCandle.close} below entry zone, momentum SELL`
        }
      } else {
        const emaShort = computeEMA(allData.slice(-9), 9)
        const emaLong = computeEMA(allData.slice(-21), 21)
        if (emaShort < emaLong && latestCandle.close < emaShort) {
          entryTriggered = true
          reason = `Death cross SELL signal (EMA9 ${emaShort.toFixed(4)} < EMA21 ${emaLong.toFixed(4)})`
        }
      }
    }

    if (entryTriggered) {
      signals.push({
        id: generateId(),
        testId,
        type: 'ENTRY',
        direction,
        price: entryPrice,
        timestamp: new Date(latestCandle.timestamp).toISOString(),
        confidence,
        reason,
      })
    }
  }

  return signals
}

export function generateExitSignals(
  position: {
    entryPrice: number
    direction: 'BUY' | 'SELL'
    stopLoss: number
    takeProfit: number
    trailingStopPct: number | null
    highestPrice: number
    lowestPrice: number
  },
  currentCandle: Candle,
  testId: string,
  entrySignalId: string,
): Signal[] {
  const signals: Signal[] = []
  const isBuy = position.direction === 'BUY'
  let exitPrice: number | null = null
  let reason = ''

  if (isBuy) {
    if (position.takeProfit > 0 && currentCandle.high >= position.takeProfit) {
      exitPrice = position.takeProfit
      reason = `Take profit reached at ${position.takeProfit}`
    } else if (position.stopLoss > 0 && currentCandle.low <= position.stopLoss) {
      exitPrice = position.stopLoss
      reason = `Stop loss triggered at ${position.stopLoss}`
    } else if (position.trailingStopPct !== null) {
      const newHigh = Math.max(position.highestPrice, currentCandle.high)
      const trailLevel = newHigh * (1 - position.trailingStopPct / 100)
      if (currentCandle.low <= trailLevel) {
        exitPrice = trailLevel
        reason = `Trailing stop hit at ${trailLevel.toFixed(4)}`
      }
    }
  } else {
    if (position.takeProfit > 0 && currentCandle.low <= position.takeProfit) {
      exitPrice = position.takeProfit
      reason = `Take profit reached at ${position.takeProfit}`
    } else if (position.stopLoss > 0 && currentCandle.high >= position.stopLoss) {
      exitPrice = position.stopLoss
      reason = `Stop loss triggered at ${position.stopLoss}`
    } else if (position.trailingStopPct !== null) {
      const newLow = Math.min(position.lowestPrice, currentCandle.low)
      const trailLevel = newLow * (1 + position.trailingStopPct / 100)
      if (currentCandle.high >= trailLevel) {
        exitPrice = trailLevel
        reason = `Trailing stop hit at ${trailLevel.toFixed(4)}`
      }
    }
  }

  if (exitPrice !== null) {
    const pl = isBuy
      ? exitPrice - position.entryPrice
      : position.entryPrice - exitPrice
    const plPercent = (pl / position.entryPrice) * 100

    signals.push({
      id: generateId(),
      testId,
      type: 'EXIT',
      direction: position.direction,
      price: exitPrice,
      timestamp: new Date(currentCandle.timestamp).toISOString(),
      confidence: 100,
      reason,
      result: pl > 0 ? 'win' : 'loss',
      profitLoss: Math.round(plPercent * 100) / 100,
      closedAt: new Date(currentCandle.timestamp).toISOString(),
    })
  }

  return signals
}
