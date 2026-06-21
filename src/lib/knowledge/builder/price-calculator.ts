import type { QuoteData } from '@/lib/market-data/types'

function extractNumericValue(text: string): number | null {
  const patterns = [
    /(?:at|around|near|of|:|=|@)\s*\$?(\d+[.,]?\d*)/i,
    /(\d+[.,]?\d*)\s*(?:price|level|zone|area)/i,
    /price\s*(?:at|:|=)\s*\$?(\d+[.,]?\d*)/i,
    /around\s*\$?(\d+[.,]?\d*)/i,
    /at\s*\$?(\d+[.,]?\d*)/i,
    /\$(\d+[.,]?\d*)/,
    /(\d+[.,]?\d*)/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const value = Number.parseFloat(match[1].replace(',', '.'))
      if (!Number.isNaN(value)) return value
    }
  }

  return null
}

function extractPercentValue(text: string): number | null {
  const pattern = /(\d+[.,]?\d*)\s*%/
  const match = text.match(pattern)
  if (match) {
    const value = Number.parseFloat(match[1].replace(',', '.'))
    if (!Number.isNaN(value)) return value
  }
  return null
}

export function calculateEntryPrice(rule: string, marketData: QuoteData): number {
  const numericValue = extractNumericValue(rule)
  if (numericValue !== null) return numericValue

  const lower = rule.toLowerCase()

  if (/\b(below|under|beneath)\b/.test(lower)) {
    return +(marketData.price * 0.99).toFixed(marketData.pair.startsWith('BTC') || marketData.pair.startsWith('ETH') ? 1 : 5)
  }

  if (/\b(above|over|beyond)\b/.test(lower)) {
    return +(marketData.price * 1.01).toFixed(marketData.pair.startsWith('BTC') || marketData.pair.startsWith('ETH') ? 1 : 5)
  }

  if (/\b(at\s+market|market\s+price|current)\b/.test(lower)) {
    return marketData.price
  }

  if (/\b(buy|long)\b/.test(lower) && /\b(breakout|break)\b/.test(lower)) {
    return +(marketData.price * 1.002).toFixed(marketData.pair.startsWith('BTC') || marketData.pair.startsWith('ETH') ? 1 : 5)
  }

  if (/\b(sell|short)\b/.test(lower) && /\b(breakdown|break)\b/.test(lower)) {
    return +(marketData.price * 0.998).toFixed(marketData.pair.startsWith('BTC') || marketData.pair.startsWith('ETH') ? 1 : 5)
  }

  return marketData.price
}

export function calculateStopLoss(
  rule: string,
  entryPrice: number,
  direction: string,
  atr: number,
): number {
  const numericValue = extractNumericValue(rule)
  if (numericValue !== null) return numericValue

  const percentValue = extractPercentValue(rule)
  if (percentValue !== null) {
    const distance = entryPrice * (percentValue / 100)
    return direction === 'BUY'
      ? +(entryPrice - distance).toFixed(5)
      : +(entryPrice + distance).toFixed(5)
  }

  const useAtr = atr > 0 ? atr : entryPrice * 0.01
  const multiplier = 1.5

  if (direction === 'BUY') {
    return +(entryPrice - useAtr * multiplier).toFixed(5)
  }

  return +(entryPrice + useAtr * multiplier).toFixed(5)
}

export function calculateTakeProfit(
  rule: string,
  entryPrice: number,
  direction: string,
  atr: number,
): { tp1: number; tp2: number } {
  const numericValue = extractNumericValue(rule)
  if (numericValue !== null) {
    const tp1 = numericValue
    const tp2 = direction === 'BUY'
      ? +(tp1 + Math.abs(tp1 - entryPrice) * 0.5).toFixed(5)
      : +(tp1 - Math.abs(tp1 - entryPrice) * 0.5).toFixed(5)
    return { tp1, tp2 }
  }

  const percentValue = extractPercentValue(rule)
  if (percentValue !== null) {
    const tp1Distance = entryPrice * (percentValue / 100)
    const tp2Distance = entryPrice * (percentValue * 1.5 / 100)
    return {
      tp1: direction === 'BUY'
        ? +(entryPrice + tp1Distance).toFixed(5)
        : +(entryPrice - tp1Distance).toFixed(5),
      tp2: direction === 'BUY'
        ? +(entryPrice + tp2Distance).toFixed(5)
        : +(entryPrice - tp2Distance).toFixed(5),
    }
  }

  const useAtr = atr > 0 ? atr : entryPrice * 0.01
  const rrMultiple = 2

  if (direction === 'BUY') {
    const tp1 = +(entryPrice + useAtr * rrMultiple).toFixed(5)
    const tp2 = +(entryPrice + useAtr * rrMultiple * 1.5).toFixed(5)
    return { tp1, tp2 }
  }

  const tp1 = +(entryPrice - useAtr * rrMultiple).toFixed(5)
  const tp2 = +(entryPrice - useAtr * rrMultiple * 1.5).toFixed(5)
  return { tp1, tp2 }
}

export function calculateRiskReward(
  entry: number,
  stop: number,
  tp1: number,
  tp2: number,
): number {
  const risk = Math.abs(entry - stop)
  if (risk === 0) return 0

  const reward = (Math.abs(tp1 - entry) + Math.abs(tp2 - entry)) / 2
  const ratio = reward / risk

  return Math.round(ratio * 100) / 100
}
