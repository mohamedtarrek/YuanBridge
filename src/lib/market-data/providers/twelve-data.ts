import { BaseProvider } from './base'
import type { QuoteData, HistoricalData, Candle } from '../types'

interface TDQuote {
  status: string
  price: string
  bid: string
  ask: string
  high: string
  low: string
  volume: string
  change: string
  change_percent: string
  timestamp: number
}

interface TDTimeSeries {
  status: string
  values: {
    datetime: string
    open: string
    high: string
    low: string
    close: string
    volume: string
  }[]
}

export class TwelveDataProvider extends BaseProvider {
  readonly name = 'Twelve Data'
  protected readonly apiKey = process.env.TWELVE_DATA_API_KEY
  protected readonly baseUrl = 'https://api.twelvedata.com'

  async fetchQuote(pair: string): Promise<QuoteData> {
    if (!this.hasApiKey()) return this.getMockQuote(pair)

    const symbol = pair.replace('/', '')
    try {
      const data = await this.apiGet<TDQuote>('/quote', {
        symbol,
        apikey: this.apiKey!,
      })

      if (data.status !== 'ok') return this.getMockQuote(pair)

      const price = parseFloat(data.price)
      return {
        pair,
        price,
        bid: parseFloat(data.bid || '0') || price * 0.9999,
        ask: parseFloat(data.ask || '0') || price * 1.0001,
        high24h: parseFloat(data.high || '0') || price * 1.005,
        low24h: parseFloat(data.low || '0') || price * 0.995,
        volume: parseFloat(data.volume || '0') || Math.random() * 50000,
        change24h: parseFloat(data.change_percent || '0') || +(Math.random() - 0.5).toFixed(2),
        timestamp: data.timestamp || Date.now(),
        source: this.name,
      }
    } catch (err) {
      console.warn('[TwelveData] fetchQuote failed for', pair, err)
      return this.getMockQuote(pair)
    }
  }

  async fetchHistorical(pair: string, interval: string, count: number): Promise<HistoricalData> {
    if (!this.hasApiKey()) return this.getMockCandles(pair, interval, count)

    const symbol = pair.replace('/', '')
    try {
      const data = await this.apiGet<TDTimeSeries>('/time_series', {
        symbol,
        interval,
        outputsize: count.toString(),
        apikey: this.apiKey!,
      })

      if (data.status !== 'ok' || !data.values) return this.getMockCandles(pair, interval, count)

      const candles: Candle[] = data.values.map(v => ({
        timestamp: new Date(v.datetime).getTime(),
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: parseFloat(v.volume || '0'),
      }))

      return { pair, interval, candles, source: this.name }
    } catch (err) {
      console.warn('[TwelveData] fetchHistorical failed for', pair, err)
      return this.getMockCandles(pair, interval, count)
    }
  }
}
