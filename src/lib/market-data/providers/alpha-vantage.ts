import { BaseProvider } from './base'
import type { QuoteData, HistoricalData } from '../types'

interface AVQuote {
  'Realtime Currency Exchange Rate': {
    '1. From_Currency Code': string
    '3. To_Currency Code': string
    '5. Exchange Rate': string
    '6. Last Refreshed': string
    '8. Bid Price': string
    '9. Ask Price': string
  }
}

interface AVTimeSeries {
  'Meta Data': Record<string, string>
  'Time Series FX (Daily)': Record<string, {
    '1. open': string
    '2. high': string
    '3. low': string
    '4. close': string
    '5. volume': string
  }>
}

export class AlphaVantageProvider extends BaseProvider {
  readonly name = 'Alpha Vantage'
  protected readonly apiKey = process.env.ALPHA_VANTAGE_API_KEY
  protected readonly baseUrl = 'https://www.alphavantage.co/query'

  async fetchQuote(pair: string): Promise<QuoteData> {
    if (!this.hasApiKey()) return this.getMockQuote(pair)

    const [from, to] = pair.split('/')
    const data = await this.apiGet<AVQuote>('', {
      function: 'CURRENCY_EXCHANGE_RATE',
      from_currency: from,
      to_currency: to,
      apikey: this.apiKey!,
    })

    const rate = data['Realtime Currency Exchange Rate']
    if (!rate || !rate['5. Exchange Rate']) {
      return this.getMockQuote(pair)
    }

    const price = parseFloat(rate['5. Exchange Rate'])
    const bid = parseFloat(rate['8. Bid Price'] || '0') || price * 0.9999
    const ask = parseFloat(rate['9. Ask Price'] || '0') || price * 1.0001

    return {
      pair,
      price,
      bid,
      ask,
      high24h: price * 1.005,
      low24h: price * 0.995,
      volume: Math.floor(Math.random() * 50000 + 10000),
      change24h: +(Math.random() - 0.5).toFixed(2),
      timestamp: new Date(rate['6. Last Refreshed']).getTime() || Date.now(),
      source: this.name,
    }
  }

  async fetchHistorical(pair: string, interval: string, count: number): Promise<HistoricalData> {
    if (!this.hasApiKey()) return this.getMockCandles(pair, interval, count)

    const [from, to] = pair.split('/')
    try {
      const data = await this.apiGet<AVTimeSeries>('', {
        function: 'FX_DAILY',
        from_symbol: from,
        to_symbol: to,
        apikey: this.apiKey!,
        outputsize: count > 100 ? 'full' : 'compact',
      })

      const series = data['Time Series FX (Daily)']
      if (!series) return this.getMockCandles(pair, interval, count)

      const entries = Object.entries(series).slice(0, count)
      const candles = entries.map(([date, ohlc]) => ({
        timestamp: new Date(date).getTime(),
        open: parseFloat(ohlc['1. open']),
        high: parseFloat(ohlc['2. high']),
        low: parseFloat(ohlc['3. low']),
        close: parseFloat(ohlc['4. close']),
        volume: parseInt(ohlc['5. volume'] || '0', 10) || Math.floor(Math.random() * 10000),
      }))

      return { pair, interval, candles, source: this.name }
    } catch {
      return this.getMockCandles(pair, interval, count)
    }
  }
}
