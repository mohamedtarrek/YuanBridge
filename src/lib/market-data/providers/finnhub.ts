import { BaseProvider } from './base'
import type { QuoteData, HistoricalData, Candle } from '../types'

interface FHQuote {
  c: number
  h: number
  l: number
  o: number
  pc: number
  t: number
}

interface FHCandle {
  c: number[]
  h: number[]
  l: number[]
  o: number[]
  s: string
  t: number[]
  v: number[]
}

export class FinnhubProvider extends BaseProvider {
  readonly name = 'Finnhub'
  protected readonly apiKey = process.env.FINNHUB_API_KEY
  protected readonly baseUrl = 'https://finnhub.io/api/v1'

  async fetchQuote(pair: string): Promise<QuoteData> {
    if (!this.hasApiKey()) return this.getMockQuote(pair)

    const symbol = this.toOandaSymbol(pair)
    try {
      const data = await this.apiGet<FHQuote>('/quote', { symbol, token: this.apiKey! })

      if (!data.c) return this.getMockQuote(pair)

      const price = data.c
      const prevClose = data.pc || price
      return {
        pair,
        price,
        bid: price * 0.9999,
        ask: price * 1.0001,
        high24h: data.h || price * 1.005,
        low24h: data.l || price * 0.995,
        volume: Math.floor(Math.random() * 50000 + 10000),
        change24h: +((price - prevClose) / prevClose * 100).toFixed(2),
        timestamp: data.t * 1000 || Date.now(),
        source: this.name,
      }
    } catch {
      return this.getMockQuote(pair)
    }
  }

  async fetchHistorical(pair: string, interval: string, count: number): Promise<HistoricalData> {
    if (!this.hasApiKey()) return this.getMockCandles(pair, interval, count)

    const symbol = this.toOandaSymbol(pair)
    const resolution = this.toResolution(interval)
    const to = Math.floor(Date.now() / 1000)
    const from = to - count * this.intervalSeconds(interval)

    try {
      const data = await this.apiGet<FHCandle>('/stock/candle', {
        symbol,
        resolution,
        from: from.toString(),
        to: to.toString(),
        token: this.apiKey!,
      })

      if (data.s !== 'ok') return this.getMockCandles(pair, interval, count)

      const candles: Candle[] = data.t.map((timestamp, i) => ({
        timestamp: timestamp * 1000,
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
        volume: data.v[i],
      }))

      return { pair, interval, candles, source: this.name }
    } catch {
      return this.getMockCandles(pair, interval, count)
    }
  }

  private toOandaSymbol(pair: string): string {
    return `OANDA:${pair.replace('/', '_')}`
  }

  private toResolution(interval: string): string {
    const map: Record<string, string> = {
      '1min': '1',
      '5min': '5',
      '15min': '15',
      '30min': '30',
      '1h': '60',
      '4h': '240',
      '1d': 'D',
      '1w': 'W',
    }
    return map[interval] || 'D'
  }

  private intervalSeconds(interval: string): number {
    const map: Record<string, number> = {
      '1min': 60,
      '5min': 300,
      '15min': 900,
      '30min': 1800,
      '1h': 3600,
      '4h': 14400,
      '1d': 86400,
      '1w': 604800,
    }
    return map[interval] || 86400
  }
}
