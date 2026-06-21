import type { CollectedContent } from '@/lib/knowledge/types'

const STRATEGY_KEYWORDS = [
  'entry', 'stop loss', 'take profit', 'tp', 'sl',
  'buy when', 'sell when', 'buy if', 'sell if', 'go long', 'go short',
  'indicator', 'rsi', 'macd', 'ema', 'sma', 'bollinger',
  'support', 'resistance', 'breakout', 'retracement', 'fibonacci',
  'trendline', 'wedge', 'flag', 'pattern', 'candle',
  'divergence', 'convergence', 'momentum', 'volume',
  'oversold', 'overbought', 'accumulation', 'distribution',
  'pullback', 'reversal', 'continuation', 'breakdown',
  'order block', 'liquidity', 'imbalance', 'fair value gap',
  'double top', 'double bottom', 'head and shoulders',
  'triangle', 'channel', 'engulfing', 'doji', 'hammer',
  'shooting star', 'morning star', 'evening star',
]

const PROMOTIONAL_KEYWORDS = [
  'free signal', 'guaranteed', '100% profit', 'no risk',
  'get rich', 'instant profit', 'double your money',
  'click here', 'sign up', 'subscribe now', 'limited offer',
  'exclusive deal', 'act now', 'don\'t miss', 'hurry',
  'purchase now', 'buy now', 'promo code', 'discount',
  'risk-free', 'proven system', 'make money fast',
]

const TRADE_SETUP_PATTERNS = [
  /\b(buy|long|go\s+long)\s+(if|when|at|above|below|on)\b/i,
  /\b(sell|short|go\s+short)\s+(if|when|at|above|below|on)\b/i,
  /\b(tp|take\s+profit)\s+(at|of|:|=)\s+\d+/i,
  /\b(sl|stop\s+loss)\s+(at|of|:|=)\s+\d+/i,
  /\bentry\s+(at|around|near|zone|area|price|level)\b/i,
  /\bexit\s+(at|near|when|on|upon)\b/i,
  /\b(target|targets?)\s+(at|of|:|=)\s+\d+/i,
  /\bstop\s+(at|:|=)\s+\d+/i,
  /\brisk\s+(of|:|=)\s+\d+/i,
  /\b(r:r|risk\s*:?\s*reward)\s+(at|of|:|=)\s+\d+/i,
]

const STRATEGY_TYPE_PATTERNS: Array<{ type: string; patterns: RegExp[] }> = [
  {
    type: 'trend_following',
    patterns: [
      /\btrend\s+(following|continuation)\b/i,
      /\bbuy\s+(the\s+)?(dip|pullback)\b/i,
      /\bsell\s+(the\s+)?(rip|rally)\b/i,
      /\bmoving\s+average\s+(crossover|cross)\b/i,
      /\bmacd\s+crossover\b/i,
    ],
  },
  {
    type: 'breakout',
    patterns: [
      /\bbreakout\b/i,
      /\bbreak\s+(above|below|through|out)\b/i,
      /\bretest\s+(of\s+)?(support|resistance)\b/i,
    ],
  },
  {
    type: 'mean_reversion',
    patterns: [
      /\b(mean|median)\s+reversion\b/i,
      /\boversold\b/i,
      /\boverbought\b/i,
      /\brsi\s+(below|above)\s+\d+/i,
      /\breversal\b/i,
    ],
  },
  {
    type: 'range_trading',
    patterns: [
      /\brange\s+(bound|trading|market)\b/i,
      /\bsupport\s+and\s+resistance\b/i,
      /\bbuy\s+(at|near)\s+support\b/i,
      /\bsell\s+(at|near)\s+resistance\b/i,
    ],
  },
  {
    type: 'scalping',
    patterns: [
      /\bscalp(ing|er|s)?\b/i,
      /\b(1m|5m|15m)\s+(chart|timeframe|tf)\b/i,
      /\bquick\s+(profit|trade|entry)\b/i,
    ],
  },
  {
    type: 'swing_trading',
    patterns: [
      /\bswing\s+(trade|trading|high|low)\b/i,
      /\b(4h|daily|1d)\s+(chart|timeframe)\b/i,
      /\bhold\s+(for\s+)?(days|weeks)\b/i,
    ],
  },
  {
    type: 'position_trading',
    patterns: [
      /\bposition\s+(trade|trading|sizing)\b/i,
      /\b(weekly|monthly)\s+(chart|timeframe)\b/i,
      /\blong\s+(term|position)\b/i,
    ],
  },
]

export interface StrategyDetectionResult {
  hasStrategy: boolean
  confidence: number
  type: string
}

export function detectStrategy(content: CollectedContent): StrategyDetectionResult {
  const text = content.content.toLowerCase()
  const title = content.title.toLowerCase()
  const combined = `${title} ${text}`

  const strategyKeywordCount = STRATEGY_KEYWORDS.filter((kw) => combined.includes(kw)).length

  const promotionalCount = PROMOTIONAL_KEYWORDS.filter((kw) => combined.includes(kw)).length
  const isPromotional = promotionalCount >= 3

  const patternMatches = TRADE_SETUP_PATTERNS.filter((p) => p.test(combined)).length
  const patternRatio = patternMatches / TRADE_SETUP_PATTERNS.length

  let strategyType = 'general'
  let typeConfidence = 0
  for (const { type, patterns } of STRATEGY_TYPE_PATTERNS) {
    const matches = patterns.filter((p) => p.test(combined)).length
    if (matches > 0 && matches / patterns.length > typeConfidence) {
      typeConfidence = matches / patterns.length
      strategyType = type
    }
  }

  const keywordScore = Math.min(strategyKeywordCount / 5, 1) * 0.4
  const patternScore = patternRatio * 0.5
  const titleScore = (STRATEGY_KEYWORDS.some((kw) => title.includes(kw)) ? 1 : 0) * 0.1

  let confidence = keywordScore + patternScore + titleScore

  if (isPromotional) {
    confidence *= 0.3
  }

  if (content.content.length < 50) {
    confidence *= 0.5
  }

  confidence = Math.min(confidence, 1)
  confidence = Math.round(confidence * 100) / 100

  return {
    hasStrategy: confidence >= 0.3 && !isPromotional && strategyKeywordCount >= 2,
    confidence,
    type: strategyType,
  }
}
