import type { MarketDataProvider, QuoteData, HistoricalData, Candle } from '../types'

export abstract class BaseProvider implements MarketDataProvider {
  abstract readonly name: string
  protected abstract readonly apiKey: string | undefined
  protected abstract readonly baseUrl: string

  abstract fetchQuote(pair: string): Promise<QuoteData>
  abstract fetchHistorical(pair: string, interval: string, count: number): Promise<HistoricalData>

  async fetchMultiple(pairs: string[]): Promise<QuoteData[]> {
    const results = await Promise.allSettled(pairs.map(p => this.fetchQuote(p)))
    return results
      .filter((r): r is PromiseFulfilledResult<QuoteData> => r.status === 'fulfilled')
      .map(r => r.value)
  }

  protected hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.length > 0 && this.apiKey !== 'your_key_here'
  }

  protected async apiGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(path, this.baseUrl)
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 30 },
    })
    if (!response.ok) {
      throw new Error(`${this.name} API error: ${response.status} ${response.statusText}`)
    }
    return response.json()
  }

  protected getMockQuote(pair: string): QuoteData {
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
      source: this.name,
    }
  }

  protected getMockCandles(pair: string, interval: string, count: number): HistoricalData {
    const basePrice = BASE_PRICES[pair] ?? 1.0000
    const candles: Candle[] = []
    let close = basePrice
    const intervalMs = INTERVAL_MS[interval] ?? 3600000
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

    return { pair, interval, candles, source: this.name }
  }
}

export const BASE_PRICES: Record<string, number> = {
  'EUR/USD': 1.0850,
  'GBP/USD': 1.2650,
  'USD/JPY': 151.50,
  'USD/CHF': 0.8820,
  'AUD/USD': 0.6520,
  'USD/CAD': 1.3600,
  'NZD/USD': 0.6050,
  'EUR/GBP': 0.8570,
  'EUR/JPY': 164.20,
  'GBP/JPY': 191.50,
  'XAU/USD': 2030.00,
  'XAG/USD': 23.50,
  'BTC/USD': 67000,
  'ETH/USD': 3400,
}

const INTERVAL_MS: Record<string, number> = {
  '1min': 60000,
  '5min': 300000,
  '15min': 900000,
  '30min': 1800000,
  '1h': 3600000,
  '4h': 14400000,
  '1d': 86400000,
  '1w': 604800000,
}
