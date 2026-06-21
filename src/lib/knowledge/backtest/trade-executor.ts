import { Candle } from '@/lib/market-data/types'
import { TradingRules } from '@/lib/knowledge/types'

export interface Trade {
  entryTime: string
  exitTime: string
  entryPrice: number
  exitPrice: number
  direction: 'BUY' | 'SELL'
  quantity: number
  profitLoss: number
  profitLossPercent: number
  duration: number
  exitReason: 'take_profit' | 'stop_loss' | 'trailing_stop' | 'time_exit' | 'signal_exit'
}

interface ActivePosition {
  entryTime: string
  entryPrice: number
  direction: 'BUY' | 'SELL'
  quantity: number
  stopLoss: number
  takeProfit1: number
  takeProfit2: number
  highestPrice: number
  lowestPrice: number
  entryIndex: number
  trailingStopDistance: number | null
}

function extractNumericValue(rules: string[], pattern: RegExp): number | null {
  for (const rule of rules) {
    const match = rule.match(pattern)
    if (match) {
      return parseFloat(match[1])
    }
  }
  return null
}

function parseRules(
  rules: TradingRules,
  direction: string,
): {
  entryPrice: number | null
  stopLoss: number | null
  takeProfit: number | null
  maxHoldCandles: number | null
  trailingStopPct: number | null
} {
  const isBuy = direction === 'BUY'

  const entryPrice = extractNumericValue(rules.entryConditions, /entry\s*(?:at|price)?\s*:?\s*([\d.]+)/i)
  const stopLoss = extractNumericValue(rules.stopLossRules, /stop\s*(?:loss|loss)?\s*(?:at|:)?\s*([\d.]+)/i)
  const takeProfit = extractNumericValue(rules.exitConditions, /take\s*profit\s*(?:at|:)?\s*([\d.]+)/i)
  const maxHold = extractNumericValue(rules.exitConditions, /(?:exit|close|hold)\s*(?:after|for)?\s*(\d+)\s*(?:candles|days|hours|bars)/i)
  const trailingPct = extractNumericValue(rules.stopLossRules, /trailing\s*(?:stop\s*)?(?:at|:)?\s*([\d.]+)\s*%/i)

  return {
    entryPrice: entryPrice ?? null,
    stopLoss: stopLoss ?? null,
    takeProfit: takeProfit ?? null,
    maxHoldCandles: maxHold,
    trailingStopPct: trailingPct,
  }
}

export function executeBacktestTrades(
  candles: Candle[],
  rules: TradingRules,
  direction: string,
  options?: {
    initialCapital?: number
    commission?: number
    slippage?: number
  },
): Trade[] {
  const parsed = parseRules(rules, direction)
  const trades: Trade[] = []
  let position: ActivePosition | null = null
  const isBuy = direction === 'BUY'
  const commission = options?.commission ?? 0.001
  const slippage = options?.slippage ?? 0.0005
  const initialCapital = options?.initialCapital ?? 10000
  let capital = initialCapital

  for (let i = 0; i < candles.length; i++) {
    const candle = candles[i]

    if (position) {
      const highestSinceEntry = Math.max(position.highestPrice, candle.high)
      const lowestSinceEntry = Math.min(position.lowestPrice, candle.low)
      position.highestPrice = highestSinceEntry
      position.lowestPrice = lowestSinceEntry

      let exitPrice: number | null = null
      let exitReason: Trade['exitReason'] = 'signal_exit'
      let hitCandle: Candle = candle

      if (isBuy) {
        if (position.takeProfit1 > 0 && candle.high >= position.takeProfit1) {
          exitPrice = position.takeProfit1
          exitReason = 'take_profit'
        } else if (position.stopLoss > 0 && candle.low <= position.stopLoss) {
          exitPrice = position.stopLoss
          exitReason = 'stop_loss'
        } else if (position.trailingStopDistance !== null) {
          const trailLevel = position.highestPrice * (1 - position.trailingStopDistance / 100)
          if (candle.low <= trailLevel) {
            exitPrice = trailLevel
            exitReason = 'trailing_stop'
          }
        }
      } else {
        if (position.takeProfit1 > 0 && candle.low <= position.takeProfit1) {
          exitPrice = position.takeProfit1
          exitReason = 'take_profit'
        } else if (position.stopLoss > 0 && candle.high >= position.stopLoss) {
          exitPrice = position.stopLoss
          exitReason = 'stop_loss'
        } else if (position.trailingStopDistance !== null) {
          const trailLevel = position.lowestPrice * (1 + position.trailingStopDistance / 100)
          if (candle.high >= trailLevel) {
            exitPrice = trailLevel
            exitReason = 'trailing_stop'
          }
        }
      }

      if (exitPrice === null && position.entryIndex !== null) {
        const candlesHeld = i - position.entryIndex
        if (parsed.maxHoldCandles !== null && candlesHeld >= parsed.maxHoldCandles) {
          exitPrice = candle.close
          exitReason = 'time_exit'
        }
      }

      if (exitPrice !== null) {
        const grossPL = isBuy
          ? (exitPrice - position.entryPrice) * position.quantity
          : (position.entryPrice - exitPrice) * position.quantity
        const commissionCost = (position.entryPrice * position.quantity * commission) + (exitPrice * position.quantity * commission)
        const slippageCost = exitPrice * position.quantity * slippage
        const netPL = grossPL - commissionCost - slippageCost
        const plPercent = (netPL / (position.entryPrice * position.quantity)) * 100
        const duration = (candle.timestamp - new Date(position.entryTime).getTime()) / 3600000

        trades.push({
          entryTime: position.entryTime,
          exitTime: new Date(candle.timestamp).toISOString(),
          entryPrice: position.entryPrice,
          exitPrice,
          direction: position.direction,
          quantity: position.quantity,
          profitLoss: Math.round(netPL * 100) / 100,
          profitLossPercent: Math.round(plPercent * 100) / 100,
          duration: Math.round(duration * 100) / 100,
          exitReason,
        })

        capital += netPL
        position = null
      }
    } else {
      let entryTriggered = false

      if (isBuy) {
        if (parsed.entryPrice !== null && candle.low <= parsed.entryPrice && candle.close >= parsed.entryPrice) {
          entryTriggered = true
        }
      } else {
        if (parsed.entryPrice !== null && candle.high >= parsed.entryPrice && candle.close <= parsed.entryPrice) {
          entryTriggered = true
        }
      }

      if (entryTriggered) {
        const entryPrice = parsed.entryPrice!
        const quantity = (capital * 0.95) / entryPrice
        const stopLossPrice = parsed.stopLoss ?? (isBuy ? entryPrice * 0.95 : entryPrice * 1.05)
        const tp1 = parsed.takeProfit ?? (isBuy ? entryPrice * 1.05 : entryPrice * 0.95)

        position = {
          entryTime: new Date(candle.timestamp).toISOString(),
          entryPrice,
          direction: isBuy ? 'BUY' : 'SELL',
          quantity,
          stopLoss: stopLossPrice,
          takeProfit1: tp1,
          takeProfit2: 0,
          highestPrice: entryPrice,
          lowestPrice: entryPrice,
          entryIndex: i,
          trailingStopDistance: parsed.trailingStopPct,
        }
      }
    }
  }

  if (position !== null) {
    const lastCandle = candles[candles.length - 1]
    const grossPL = isBuy
      ? (lastCandle.close - position.entryPrice) * position.quantity
      : (position.entryPrice - lastCandle.close) * position.quantity
    const commissionCost = (position.entryPrice * position.quantity * commission) + (lastCandle.close * position.quantity * commission)
    const netPL = grossPL - commissionCost
    const plPercent = (netPL / (position.entryPrice * position.quantity)) * 100
    const duration = (lastCandle.timestamp - new Date(position.entryTime).getTime()) / 3600000

    trades.push({
      entryTime: position.entryTime,
      exitTime: new Date(lastCandle.timestamp).toISOString(),
      entryPrice: position.entryPrice,
      exitPrice: lastCandle.close,
      direction: position.direction,
      quantity: position.quantity,
      profitLoss: Math.round(netPL * 100) / 100,
      profitLossPercent: Math.round(plPercent * 100) / 100,
      duration: Math.round(duration * 100) / 100,
      exitReason: 'time_exit',
    })
  }

  return trades
}
