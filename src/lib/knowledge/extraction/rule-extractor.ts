import type { TradingRules } from '@/lib/knowledge/types'

const ENTRY_PATTERNS: RegExp[] = [
  /\b(buy|long|go\s+long|enter\s+long)\s+(if|when|on|above|below|at|near|around|after)\b/i,
  /\b(sell|short|go\s+short|enter\s+short)\s+(if|when|on|above|below|at|near|around|after)\b/i,
  /\bentry\s+(at|around|near|zone|price|level|point)\s+(\d+[.,]?\d*)/i,
  /\benter\s+(long|short|buy|sell)\s+(at|near|around|when|if)\b/i,
  /\bbuy\s+(signal|zone|area|trigger)\b/i,
  /\bsell\s+(signal|zone|area|trigger)\b/i,
  /\bopen\s+(long|short|position|trade)\s+(at|when|if)\b/i,
  /\b(long|short)\s+entry\s+(at|:|=|around|near)\b/i,
]

const EXIT_PATTERNS: RegExp[] = [
  /\b(take\s+profit|tp|target)\s+(at|of|:|=|level|price|zone)\s+(\d+[.,]?\d*)/i,
  /\bexit\s+(long|short|position|trade)\s+(at|when|if|on|near)\b/i,
  /\bclose\s+(long|short|position|trade)\s+(at|when|if|on|near)\b/i,
  /\btarget\s+\d\s+(at|:|=)\s+(\d+[.,]?\d*)/i,
  /\btp1?\s*(@|:|=|at)\s*(\d+[.,]?\d*)/i,
  /\btp2?\s*(@|:|=|at)\s*(\d+[.,]?\d*)/i,
  /\bpartial\s+(profit|close|exit)\s+(at|when|on)\b/i,
]

const STOP_LOSS_PATTERNS: RegExp[] = [
  /\bstop\s+loss\s+(at|of|:|=|below|above|near|level)\s+(\d+[.,]?\d*)/i,
  /\bsl\s*(@|:|=|at)\s*(\d+[.,]?\d*)/i,
  /\bcut\s+(losses|losing)\s+(at|when|if|below)\b/i,
  /\b(stop|hard\s+stop)\s+(at|:|=|level|price)\s+(\d+[.,]?\d*)/i,
  /\bprotection\s+stop\b/i,
  /\btrailing\s+stop\s+(at|of|:|=)\s+(\d+[.,]?\d*)/i,
]

const POSITION_SIZING_PATTERNS: RegExp[] = [
  /\brisk\s+(\d+[.,]?\d*)\s*%\b/i,
  /\b(risk|risking)\s+(per\s+)?(trade|position)\s+(of|:|=)\s+\d+/i,
  /\bposition\s+size\s+(of|:|=|at)\s+\d+/i,
  /\blot\s+size\s+(of|:|=|at)\s+\d+/i,
  /\bfixed\s+(lot|position)\s+size\b/i,
  /\baccount\s+risk\s+(per|for|of)\b/i,
  /\b(risk|risking)\s+\$?(\d+[.,]?\d*)\s*(per|for)\s+(trade|position)\b/i,
  /\b(1%|2%|0\.5%|0\.25%)\s+(risk|rule)\b/i,
]

const INDICATOR_PATTERNS: Array<{ name: string; patterns: RegExp[] }> = [
  { name: 'RSI', patterns: [/\brsi\b/i, /\brelative\s+strength\s+index\b/i] },
  { name: 'MACD', patterns: [/\bmacd\b/i, /\bmoving\s+average\s+convergence\s+divergence\b/i] },
  { name: 'EMA', patterns: [/\bema\b/i, /\bexponential\s+moving\s+average\b/i] },
  { name: 'SMA', patterns: [/\bsma\b/i, /\bsimple\s+moving\s+average\b/i] },
  { name: 'Bollinger Bands', patterns: [/\bbollinger\b/i, /\bbollinger\s+bands?\b/i, /\b(bands?|bands)\b/i] },
  { name: 'Fibonacci', patterns: [/\bfibonacci\b/i, /\bfib\b/i, /\bfibo\b/i] },
  { name: 'Stochastic', patterns: [/\bstochastic\b/i, /\bstoch\b/i] },
  { name: 'ADX', patterns: [/\badx\b/i, /\baverage\s+directional\s+index\b/i] },
  { name: 'ATR', patterns: [/\batr\b/i, /\baverage\s+true\s+range\b/i] },
  { name: 'Ichimoku', patterns: [/\bichimoku\b/i, /\bichimoku\s+cloud\b/i] },
  { name: 'VWAP', patterns: [/\bvwap\b/i, /\bvolume\s+weighted\s+average\s+price\b/i] },
  { name: 'Volume', patterns: [/\bvolume\s+(profile|spread|analysis)\b/i, /\bvolumes?\s+(indicator|oscillator)\b/i] },
  { name: 'Williams %R', patterns: [/\bwilliams\s*%\s*r\b/i, /\bwilliams\s+percent\s+range\b/i] },
  { name: 'CCI', patterns: [/\bcci\b/i, /\bcommodity\s+channel\s+index\b/i] },
  { name: 'Parabolic SAR', patterns: [/\b(parabolic\s+)?sar\b/i, /\bparabolic\b/i] },
  { name: 'OBV', patterns: [/\bobv\b/i, /\bon\s+balance\s+volume\b/i] },
  { name: 'Heikin Ashi', patterns: [/\bheikin\s+ashi\b/i, /\bha\s+(candles?|chart)\b/i] },
  { name: 'Pivot Points', patterns: [/\bpivot\s+(point|level)s?\b/i, /\bpivot\b/i] },
  { name: 'Keltner Channels', patterns: [/\bkeltner\b/i, /\bkeltner\s+channel/i] },
  { name: 'Money Flow', patterns: [/\bmoney\s+flow\s+(index|oscillator)\b/i, /\bmfi\b/i] },
]

const TIMEFRAME_PATTERNS: Array<{ name: string; patterns: RegExp[] }> = [
  { name: '1m', patterns: [/\b1\s*min(ute)?s?\b/i, /\b1m\b/i] },
  { name: '5m', patterns: [/\b5\s*min(ute)?s?\b/i, /\b5m\b/i] },
  { name: '15m', patterns: [/\b15\s*min(ute)?s?\b/i, /\b15m\b/i] },
  { name: '30m', patterns: [/\b30\s*min(ute)?s?\b/i, /\b30m\b/i] },
  { name: '1h', patterns: [/\b1\s*ho(ur)?\b/i, /\b1h\b/i, /\bhourly\b/i] },
  { name: '4h', patterns: [/\b4\s*ho(ur)?s?\b/i, /\b4h\b/i] },
  { name: '1d', patterns: [/\b(daily|day|1d)\b/i] },
  { name: '1w', patterns: [/\b(weekly|week|1w)\b/i] },
]

const CURRENCY_PAIR_PATTERNS: Array<{ name: string; patterns: RegExp[] }> = [
  { name: 'EUR/USD', patterns: [/\beur\/?usd\b/i, /\beuro\s+dollar\b/i] },
  { name: 'GBP/USD', patterns: [/\bgbp\/?usd\b/i, /\bpound\s+dollar\b/i, /\bcable\b/i] },
  { name: 'USD/JPY', patterns: [/\busd\/?jpy\b/i, /\bdollar\s+yen\b/i] },
  { name: 'AUD/USD', patterns: [/\baud\/?usd\b/i, /\baussie\b/i, /\baustralian\s+dollar\b/i] },
  { name: 'USD/CAD', patterns: [/\busd\/?cad\b/i, /\bloonie\b/i, /\bcanadian\s+dollar\b/i] },
  { name: 'NZD/USD', patterns: [/\bnzd\/?usd\b/i, /\bkiwi\b/i] },
  { name: 'USD/CHF', patterns: [/\busd\/?chf\b/i, /\bswiss(ie)?\b/i] },
  { name: 'EUR/GBP', patterns: [/\beur\/?gbp\b/i] },
  { name: 'EUR/JPY', patterns: [/\beur\/?jpy\b/i] },
  { name: 'GBP/JPY', patterns: [/\bgbp\/?jpy\b/i] },
  { name: 'XAU/USD', patterns: [/\b(xau|gold)\/?usd\b/i, /\bgold\b/i] },
  { name: 'XAG/USD', patterns: [/\b(xag|silver)\/?usd\b/i, /\bsilver\b/i] },
  { name: 'BTC/USD', patterns: [/\b(btc|bitcoin)\/?usd\b/i, /\bbitcoin\b/i] },
  { name: 'ETH/USD', patterns: [/\b(eth|ethereum)\/?usd\b/i, /\bethereum\b/i] },
  { name: 'US30', patterns: [/\bus30\b/i, /\bdow\s+jones\b/i, /\bdjia\b/i] },
  { name: 'US500', patterns: [/\b(s&p500|spx|us500)\b/i] },
  { name: 'NAS100', patterns: [/\b(nasdaq|nas100|us100)\b/i] },
]

const MARKET_CONDITION_PATTERNS: Array<{ name: string; patterns: RegExp[] }> = [
  { name: 'trending', patterns: [/\btrend(ing|s)?\s+(market|environment|condition)\b/i, /\bstrong\s+trend\b/i, /\buptrend\b/i, /\bdown(ward)?\s+trend\b/i] },
  { name: 'ranging', patterns: [/\brang(e|ing)\s+(market|environment|bound)\b/i, /\brange\b/i, /\bsideways\b/i, /\bconsolidat(ion|ing)\b/i, /\bchoppy\b/i] },
  { name: 'volatile', patterns: [/\bvolatil(e|ility)\b/i, /\bhigh\s+volatility\b/i, /\bexpansion\b/i] },
  { name: 'oversold', patterns: [/\boversold\b/i, /\bsold\s+off\b/i] },
  { name: 'overbought', patterns: [/\boverbought\b/i, /\bbought\s+up\b/i] },
  { name: 'low_volume', patterns: [/\blow\s+volume\b/i, /\bthin\s+(market|liquidity)\b/i] },
  { name: 'high_volume', patterns: [/\bhigh\s+volume\b/i, /\bheavy\s+volume\b/i, /\bvolume\s+spike\b/i] },
  { name: 'news_driven', patterns: [/\bnews\s+(driven|event|releas)e?\b/i, /\b(eco|economic)\s+(data|calendar|report)\b/i, /\b(nfp|non\s+farm|fomc|e?cb|boj|boe|cpi|ppi|gdp)\b/i] },
]

function extractMatching<T>(
  text: string,
  patterns: Array<{ name: string; patterns: RegExp[] }>,
): T[] {
  const result: T[] = []
  const seen = new Set<string>()

  for (const { name, patterns: regexps } of patterns) {
    for (const regex of regexps) {
      if (regex.test(text) && !seen.has(name)) {
        seen.add(name)
        result.push(name as unknown as T)
        break
      }
    }
  }

  return result
}

function extractConditionTexts(text: string, patterns: RegExp[]): string[] {
  const results: string[] = []
  const seen = new Set<string>()

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const condition = match[0].trim()
      if (!seen.has(condition)) {
        seen.add(condition)
        results.push(condition)
      }
    }
  }

  return results
}

function detectRiskLevel(text: string): 'low' | 'medium' | 'high' {
  const lowRiskPatterns = [
    /\b(conservative|low\s+risk|low\s+leverage)\b/i,
    /\brisk\s+(less\s+than|under|below)\s+1%/i,
    /\bwide\s+stop\b/i,
  ]
  const highRiskPatterns = [
    /\b(high\s+risk|aggressive|risky)\b/i,
    /\b(high\s+leverage|10x|20x|50x|100x)\b/i,
    /\b(margin|greedy|pyramid|martingale)\b/i,
    /\brisk\s+(more\s+than|over|above)\s+(2%|3%)/i,
    /\btight\s+stop\b/i,
  ]

  if (highRiskPatterns.some((p) => p.test(text))) return 'high'
  if (lowRiskPatterns.some((p) => p.test(text))) return 'low'
  return 'medium'
}

export function extractRules(text: string): Partial<TradingRules> {
  const normalized = text.replace(/\s+/g, ' ').trim()

  const entryConditions = extractConditionTexts(normalized, ENTRY_PATTERNS)
  const exitConditions = extractConditionTexts(normalized, EXIT_PATTERNS)
  const stopLossRules = extractConditionTexts(normalized, STOP_LOSS_PATTERNS)
  const positionSizing = extractConditionTexts(normalized, POSITION_SIZING_PATTERNS)
  const indicators = extractMatching<string>(normalized, INDICATOR_PATTERNS)
  const timeframes = extractMatching<string>(normalized, TIMEFRAME_PATTERNS)
  const pairs = extractMatching<string>(normalized, CURRENCY_PAIR_PATTERNS)
  const marketCondition = extractMatching<string>(normalized, MARKET_CONDITION_PATTERNS)
  const riskLevel = detectRiskLevel(normalized)

  return {
    entryConditions,
    exitConditions,
    stopLossRules,
    positionSizing,
    filters: [],
    indicators,
    timeframes,
    pairs,
    riskLevel,
    marketCondition,
  }
}
