import type { MarketCategory, Timeframe } from '@/lib/knowledge/types'

const MARKET_PATTERNS: Array<{ category: MarketCategory; patterns: RegExp[] }> = [
  {
    category: 'forex',
    patterns: [
      /\b(forex|currency|fx|forex\s+market)\b/i,
      /\b(eur|gbp|usd|jpy|chf|cad|aud|nzd)\/?\s*(usd|eur|gbp|jpy|chf|cad|aud|nzd)\b/i,
      /\bpip(s)?\b/i,
      /\blot\s+size\b/i,
      /\bspread\b/i,
      /\b(major|minor|cross)\s+pair\b/i,
    ],
  },
  {
    category: 'crypto',
    patterns: [
      /\b(bitcoin|btc|ethereum|eth|crypto|cryptocurrency|altcoin)\b/i,
      /\b(blockchain|defi|nft|token|coin)\b/i,
      /\b(binance|coinbase|bybit|okx)\b/i,
      /\b(btc\/usd|eth\/usd)\b/i,
      /\b(satoshi|wei|gwei)\b/i,
      /\b(wallet|exchange|mining|staking)\b/i,
    ],
  },
  {
    category: 'stocks',
    patterns: [
      /\b(stock|equity|share|dividend)\b/i,
      /\b(nyse|nasdaq|amex|spx|djia)\b/i,
      /\b(earnings|ipo|buyback|split)\b/i,
      /\b(pe\s+ratio|eps|market\s+cap|sector)\b/i,
      /\bbull\s+market\b/i,
      /\b(amazon|apple|google|msft|meta|tsla)\b/i,
    ],
  },
  {
    category: 'commodities',
    patterns: [
      /\b(gold|silver|platinum|palladium|copper)\b/i,
      /\b(xau|xag)\b/i,
      /\b(crude|oil|brent|wti|natural\s+gas)\b/i,
      /\b(commodit(y|ies))\b/i,
      /\b(futures|spot)\s+(gold|silver|oil)\b/i,
    ],
  },
  {
    category: 'indices',
    patterns: [
      /\b(index|indices)\b/i,
      /\b(spx|sp500|s&p|dow|nasdaq|djia|russell|ftse|dax|nikkei|hsi|nifty)\b/i,
      /\b(index\s+futures)\b/i,
    ],
  },
]

const TIMEFRAME_PATTERNS: Array<{ tf: Timeframe; patterns: RegExp[] }> = [
  { tf: '1m', patterns: [/\b1\s*min(ute)?\b/i, /\b1m\b/] },
  { tf: '5m', patterns: [/\b5\s*min(ute)?s?\b/i, /\b5m\b/] },
  { tf: '15m', patterns: [/\b15\s*min(ute)?s?\b/i, /\b15m\b/] },
  { tf: '30m', patterns: [/\b30\s*min(ute)?s?\b/i, /\b30m\b/] },
  { tf: '1h', patterns: [/\b1\s*ho(ur)?\b/i, /\b1h\b/, /\bhourly\b/i] },
  { tf: '4h', patterns: [/\b4\s*ho(ur)?s?\b/i, /\b4h\b/] },
  { tf: '1d', patterns: [/\b(daily|day|1d)\b/i] },
  { tf: '1w', patterns: [/\b(weekly|week|1w)\b/i] },
]

const INDICATOR_PATTERNS: Array<{ name: string; patterns: RegExp[] }> = [
  { name: 'RSI', patterns: [/\brsi\b/i] },
  { name: 'MACD', patterns: [/\bmacd\b/i] },
  { name: 'EMA', patterns: [/\bema\b/i, /\bexponential\s+moving\s+average\b/i] },
  { name: 'SMA', patterns: [/\bsma\b/i, /\bsimple\s+moving\s+average\b/i] },
  { name: 'Bollinger Bands', patterns: [/\bbollinger\b/i] },
  { name: 'Fibonacci', patterns: [/\bfib(onacci)?\b/i] },
  { name: 'Stochastic', patterns: [/\bstochastic\b/i] },
  { name: 'ADX', patterns: [/\badx\b/i] },
  { name: 'ATR', patterns: [/\batr\b/i] },
  { name: 'Ichimoku', patterns: [/\bichimoku\b/i] },
  { name: 'VWAP', patterns: [/\bvwap\b/i] },
  { name: 'CCI', patterns: [/\bcci\b/i] },
  { name: 'Volume Profile', patterns: [/\bvolume\s+profile\b/i] },
]

const DIRECTION_BUY_PATTERNS = [
  /\bbuy\b/i, /\blong\b/i, /\b(long|buy)\s+(position|entry|signal|setup|trade|call)\b/i,
  /\bgo\s+long\b/i, /\bbullish\b/i, /\bupside\b/i,
]

const DIRECTION_SELL_PATTERNS = [
  /\bsell\b/i, /\bshort\b/i, /\b(short|sell)\s+(position|entry|signal|setup|trade|call)\b/i,
  /\bgo\s+short\b/i, /\bbearish\b/i, /\bdownside\b/i,
]

const HIGH_RISK_PATTERNS = [
  /\bhigh\s+(risk|leverage)\b/i,
  /\b(10x|20x|50x|100x|200x)\b/,
  /\baggressive\b/i,
  /\bmartingale\b/i,
  /\bpyramid(ing)?\b/i,
  /\brisk\s+(over|more\s+than|above)\s+\$?\d+/i,
  /\b(2%|3%|5%|10%)\s+risk\b/i,
]

const LOW_RISK_PATTERNS = [
  /\blow\s+risk\b/i,
  /\b(conservative|cautious)\b/i,
  /\brisk\s+(under|less\s+than|below)\s+\$?\d+/i,
  /\b(0\.5%|0\.25%|1%)\s+risk\b/i,
  /\bwide\s+stop\b/i,
]

export function classifyByMarket(text: string): MarketCategory {
  const normalized = text.replace(/\s+/g, ' ').trim()
  const scores = new Map<MarketCategory, number>()

  for (const { category, patterns } of MARKET_PATTERNS) {
    let score = 0
    for (const pattern of patterns) {
      const matches = normalized.match(pattern)
      if (matches) score += matches.length
    }
    scores.set(category, score)
  }

  let best: MarketCategory = 'forex'
  let bestScore = 0
  for (const [category, score] of scores) {
    if (score > bestScore) {
      bestScore = score
      best = category
    }
  }

  return best
}

export function classifyByTimeframe(text: string): Timeframe[] {
  const found: Timeframe[] = []
  const seen = new Set<string>()

  for (const { tf, patterns } of TIMEFRAME_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(text) && !seen.has(tf)) {
        seen.add(tf)
        found.push(tf)
        break
      }
    }
  }

  return found
}

export function classifyByRisk(text: string): 'low' | 'medium' | 'high' {
  const highRiskCount = HIGH_RISK_PATTERNS.filter((p) => p.test(text)).length
  const lowRiskCount = LOW_RISK_PATTERNS.filter((p) => p.test(text)).length

  if (highRiskCount > lowRiskCount) return 'high'
  if (lowRiskCount > highRiskCount) return 'low'
  return 'medium'
}

export function classifyByIndicators(text: string): string[] {
  const found: string[] = []
  const seen = new Set<string>()

  for (const { name, patterns } of INDICATOR_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(text) && !seen.has(name)) {
        seen.add(name)
        found.push(name)
        break
      }
    }
  }

  return found
}

export function classifyDirection(text: string): 'BUY' | 'SELL' | 'BOTH' {
  const buyCount = DIRECTION_BUY_PATTERNS.filter((p) => p.test(text)).length
  const sellCount = DIRECTION_SELL_PATTERNS.filter((p) => p.test(text)).length

  if (buyCount > 0 && sellCount > 0) return 'BOTH'
  if (buyCount > sellCount) return 'BUY'
  if (sellCount > buyCount) return 'SELL'
  return 'BOTH'
}
