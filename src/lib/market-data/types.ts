export interface MarketDataProvider {
  name: string
  fetchQuote(pair: string): Promise<QuoteData>
  fetchHistorical(pair: string, interval: string, count: number): Promise<HistoricalData>
  fetchMultiple(pairs: string[]): Promise<QuoteData[]>
}

export interface QuoteData {
  pair: string
  price: number
  bid: number
  ask: number
  high24h: number
  low24h: number
  volume: number
  change24h: number
  timestamp: number
  source: string
}

export interface HistoricalData {
  pair: string
  interval: string
  candles: Candle[]
  source: string
}

export interface Candle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}
