import { Candle } from '@/lib/market-data/types'

interface PairVolatilityConfig {
  dailyVol: number
  basePrice: number
  decimals: number
}

const PAIR_CONFIGS: Record<string, PairVolatilityConfig> = {
  'EUR/USD': { dailyVol: 0.005, basePrice: 1.08, decimals: 5 },
  'GBP/USD': { dailyVol: 0.006, basePrice: 1.27, decimals: 5 },
  'USD/JPY': { dailyVol: 0.007, basePrice: 150.0, decimals: 3 },
  'EUR/JPY': { dailyVol: 0.008, basePrice: 162.0, decimals: 3 },
  'GBP/JPY': { dailyVol: 0.009, basePrice: 190.0, decimals: 3 },
  'AUD/USD': { dailyVol: 0.007, basePrice: 0.65, decimals: 5 },
  'USD/CAD': { dailyVol: 0.006, basePrice: 1.36, decimals: 5 },
  'NZD/USD': { dailyVol: 0.007, basePrice: 0.61, decimals: 5 },
  'USD/CHF': { dailyVol: 0.006, basePrice: 0.88, decimals: 5 },
  'BTC/USD': { dailyVol: 0.035, basePrice: 65000, decimals: 2 },
  'ETH/USD': { dailyVol: 0.04, basePrice: 3500, decimals: 2 },
  'XAU/USD': { dailyVol: 0.008, basePrice: 2300, decimals: 2 },
  'XAG/USD': { dailyVol: 0.012, basePrice: 26, decimals: 3 },
  'SOL/USD': { dailyVol: 0.05, basePrice: 140, decimals: 2 },
  'BNB/USD': { dailyVol: 0.035, basePrice: 580, decimals: 2 },
}

const DEFAULT_CONFIG: PairVolatilityConfig = {
  dailyVol: 0.015,
  basePrice: 100,
  decimals: 4,
}

function getPairConfig(pair: string): PairVolatilityConfig {
  const normalized = pair.toUpperCase()
  const exact = PAIR_CONFIGS[normalized]
  if (exact) return exact

  const base = normalized.split('/')[0]
  const usdPair = `${base}/USD`
  const baseMatch = PAIR_CONFIGS[usdPair]
  if (baseMatch) return baseMatch

  return DEFAULT_CONFIG
}

function normalRandom(): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

function getCandlesPerDay(interval: string): number {
  const map: Record<string, number> = {
    '1m': 1440,
    '5m': 288,
    '15m': 96,
    '30m': 48,
    '1h': 24,
    '4h': 6,
    '1d': 1,
    '1w': 1 / 7,
  }
  return map[interval] ?? 1
}

function getIntervalMs(interval: string): number {
  const map: Record<string, number> = {
    '1m': 60000,
    '5m': 300000,
    '15m': 900000,
    '30m': 1800000,
    '1h': 3600000,
    '4h': 14400000,
    '1d': 86400000,
    '1w': 604800000,
  }
  return map[interval] ?? 86400000
}

function roundPrice(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export interface GenerateOptions {
  days?: number
  endDate?: Date
  trend?: 'bullish' | 'bearish' | 'neutral'
  volatilityMultiplier?: number
}

export function generateHistoricalData(
  pair: string,
  days: number = 365,
  interval: string = '1d',
  options?: GenerateOptions,
): Candle[] {
  const config = getPairConfig(pair)
  const candlesPerDay = getCandlesPerDay(interval)
  const totalCandles = Math.round(days * candlesPerDay)
  const dt = 1 / candlesPerDay
  const sigma = config.dailyVol / Math.sqrt(candlesPerDay)
  const volMultiplier = options?.volatilityMultiplier ?? 1
  const adjustedSigma = sigma * volMultiplier

  const trendDrift = options?.trend === 'bullish' ? 0.0002 : options?.trend === 'bearish' ? -0.0002 : 0
  const annualDrift = trendDrift * candlesPerDay
  const muPerStep = annualDrift * dt

  const candles: Candle[] = []
  let price = config.basePrice
  const startTime = options?.endDate
    ? options.endDate.getTime() - days * 86400000
    : Date.now() - days * 86400000
  let timestamp = startTime

  const theta = 0.05
  const longTermMean = config.basePrice

  for (let i = 0; i < totalCandles; i++) {
    const z1 = normalRandom()
    const z2 = normalRandom() * 0.3 + 0.7 * z1

    const meanReversion = theta * (longTermMean - price) / price * dt
    const gbmReturn = (muPerStep - (adjustedSigma * adjustedSigma) / 2) * dt + adjustedSigma * Math.sqrt(dt) * z1
    const totalReturn = gbmReturn + meanReversion

    const close = price * Math.exp(totalReturn)
    const spread = Math.abs(close - price)
    const halfSpread = spread * 0.5

    const high = Math.max(price, close) + Math.abs(z1) * halfSpread * (1 + 0.5 * Math.abs(normalRandom()))
    const low = Math.min(price, close) - Math.abs(z2) * halfSpread * (1 + 0.5 * Math.abs(normalRandom()))

    const seasonalFactor = 1 + 0.3 * Math.sin((i / totalCandles) * Math.PI * 4)
    const noiseFactor = 1 + 0.2 * normalRandom()
    const baseVolume = 500000 + 500000 * (Math.sin(i * 0.1) * 0.5 + 0.5)
    const volume = Math.max(1000, Math.round(baseVolume * seasonalFactor * noiseFactor))

    const r = config.decimals
    candles.push({
      timestamp,
      open: roundPrice(price, r),
      high: roundPrice(Math.max(high, price, close), r),
      low: roundPrice(Math.min(low, price, close), r),
      close: roundPrice(close, r),
      volume,
    })

    price = close
    timestamp += getIntervalMs(interval)
  }

  return candles
}

export function generateIntradayData(
  pair: string,
  days: number = 30,
  interval: string = '1h',
): Candle[] {
  return generateHistoricalData(pair, days, interval, {
    volatilityMultiplier: 0.7,
    trend: 'neutral',
  })
}
