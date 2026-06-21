import type { MarketDataProvider } from '../types'
import { AlphaVantageProvider } from './alpha-vantage'
import { TwelveDataProvider } from './twelve-data'
import { FinnhubProvider } from './finnhub'

const providers = new Map<string, MarketDataProvider>()

function initProviders(): void {
  if (providers.size > 0) return

  const alphaVantage = new AlphaVantageProvider()
  const twelveData = new TwelveDataProvider()
  const finnhub = new FinnhubProvider()

  providers.set('alpha-vantage', alphaVantage)
  providers.set('twelve-data', twelveData)
  providers.set('finnhub', finnhub)
}

export function getProvider(name?: string): MarketDataProvider {
  initProviders()
  if (name) {
    const provider = providers.get(name)
    if (provider) return provider
    throw new Error(`Unknown market data provider: ${name}`)
  }
  return getDefaultProvider()
}

export function getDefaultProvider(): MarketDataProvider {
  initProviders()

  if (process.env.ALPHA_VANTAGE_API_KEY) return providers.get('alpha-vantage')!
  if (process.env.TWELVE_DATA_API_KEY) return providers.get('twelve-data')!
  if (process.env.FINNHUB_API_KEY) return providers.get('finnhub')!

  return providers.get('alpha-vantage')!
}

export function getAvailableProviders(): MarketDataProvider[] {
  initProviders()
  return Array.from(providers.values())
}

export { AlphaVantageProvider } from './alpha-vantage'
export { TwelveDataProvider } from './twelve-data'
export { FinnhubProvider } from './finnhub'
export { BaseProvider } from './base'
