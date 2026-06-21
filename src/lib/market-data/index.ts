import type { QuoteData, HistoricalData, Candle } from './types'
import { getProvider, getAvailableProviders } from './providers'
import { BASE_PRICES } from './providers/base'

export const SUPPORTED_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF',
  'AUD/USD', 'USD/CAD', 'NZD/USD',
  'EUR/GBP', 'EUR/JPY', 'GBP/JPY',
  'XAU/USD', 'XAG/USD',
  'BTC/USD', 'ETH/USD',
] as const

export type SupportedPair = typeof SUPPORTED_PAIRS[number]

export const PAIR_NAMES: Record<string, { en: string; ar: string }> = {
  'EUR/USD': { en: 'Euro / US Dollar', ar: 'يورو / دولار أمريكي' },
  'GBP/USD': { en: 'British Pound / US Dollar', ar: 'جنيه إسترليني / دولار أمريكي' },
  'USD/JPY': { en: 'US Dollar / Japanese Yen', ar: 'دولار أمريكي / ين ياباني' },
  'USD/CHF': { en: 'US Dollar / Swiss Franc', ar: 'دولار أمريكي / فرنك سويسري' },
  'AUD/USD': { en: 'Australian Dollar / US Dollar', ar: 'دولار أسترالي / دولار أمريكي' },
  'USD/CAD': { en: 'US Dollar / Canadian Dollar', ar: 'دولار أمريكي / دولار كندي' },
  'NZD/USD': { en: 'New Zealand Dollar / US Dollar', ar: 'دولار نيوزيلندي / دولار أمريكي' },
  'EUR/GBP': { en: 'Euro / British Pound', ar: 'يورو / جنيه إسترليني' },
  'EUR/JPY': { en: 'Euro / Japanese Yen', ar: 'يورو / ين ياباني' },
  'GBP/JPY': { en: 'British Pound / Japanese Yen', ar: 'جنيه إسترليني / ين ياباني' },
  'XAU/USD': { en: 'Gold / US Dollar', ar: 'ذهب / دولار أمريكي' },
  'XAG/USD': { en: 'Silver / US Dollar', ar: 'فضة / دولار أمريكي' },
  'BTC/USD': { en: 'Bitcoin / US Dollar', ar: 'بيتكوين / دولار أمريكي' },
  'ETH/USD': { en: 'Ethereum / US Dollar', ar: 'إيثريوم / دولار أمريكي' },
}

export const DEFAULT_INTERVAL = '1h'
export const DEFAULT_CANDLE_COUNT = 100

export async function fetchMarketData(pair: string): Promise<QuoteData> {
  const providers = getAvailableProviders()

  for (const provider of providers) {
    try {
      const quote = await provider.fetchQuote(pair)
      if (quote.source !== provider.name) continue
      return quote
    } catch {
      continue
    }
  }

  return generateMockData(pair)
}

export async function fetchHistoricalData(
  pair: string,
  interval: string = DEFAULT_INTERVAL,
  count: number = DEFAULT_CANDLE_COUNT
): Promise<HistoricalData> {
  const providers = getAvailableProviders()

  for (const provider of providers) {
    try {
      const data = await provider.fetchHistorical(pair, interval, count)
      if (data.candles.length > 0 && data.source === provider.name) return data
    } catch {
      continue
    }
  }

  return { pair, interval, candles: generateMockCandles(pair, count), source: 'Mock' }
}

export async function getMultipleQuotes(pairs: string[]): Promise<QuoteData[]> {
  const provider = getProvider()
  try {
    return await provider.fetchMultiple(pairs)
  } catch {
    return pairs.map(generateMockData)
  }
}

export function generateMockData(pair: string): QuoteData {
  const basePrice = BASE_PRICES[pair] ?? 1.0000
  const jitter = (Math.random() - 0.5) * basePrice * 0.02
  const price = +(basePrice + jitter).toFixed(5)
  const spread = price * 0.0002
  const change = (Math.random() - 0.5) * 2

  return {
    pair,
    price,
    bid: +(price - spread / 2).toFixed(5),
    ask: +(price + spread / 2).toFixed(5),
    high24h: +(price * (1 + Math.random() * 0.01)).toFixed(5),
    low24h: +(price * (1 - Math.random() * 0.01)).toFixed(5),
    volume: +(Math.random() * 50000 + 10000).toFixed(2),
    change24h: +change.toFixed(2),
    timestamp: Date.now(),
    source: 'Mock',
  }
}

export function generateMockCandles(pair: string, count: number): Candle[] {
  const basePrice = BASE_PRICES[pair] ?? 1.0000
  const candles: Candle[] = []
  let close = basePrice
  const intervalMs = 3600000
  const now = Date.now()

  for (let i = count - 1; i >= 0; i--) {
    const change = (Math.random() - 0.5) * close * 0.005
    const open = close
    close = +(open + change).toFixed(5)
    const high = +(Math.max(open, close) * (1 + Math.random() * 0.003)).toFixed(5)
    const low = +(Math.min(open, close) * (1 - Math.random() * 0.003)).toFixed(5)

    candles.push({
      timestamp: now - i * intervalMs,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 10000 + 1000),
    })
  }

  return candles
}
