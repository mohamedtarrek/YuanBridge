export type ContentSource =
  | 'web_page'
  | 'reddit'
  | 'youtube'
  | 'github'
  | 'rss_feed'
  | 'twitter'
  | 'telegram'
  | 'discord'
  | 'tradingview'
  | 'forum'

export type ContentStatus = 'pending' | 'processing' | 'extracted' | 'validated' | 'published' | 'rejected' | 'duplicate'

export type MarketCategory = 'forex' | 'crypto' | 'stocks' | 'commodities' | 'indices'

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w'

export type ValidationStage = 'collected' | 'extracted' | 'normalized' | 'backtested' | 'forward_tested' | 'risk_analyzed' | 'scored' | 'published'

export interface ConfidenceScore {
  overall: number
  backtestConfidence: number
  forwardTestConfidence: number
  riskAdjustedScore: number
  volatilityScore: number
  consistencyScore: number
}

export interface BacktestResult {
  totalTrades: number
  winRate: number
  lossRate: number
  profitFactor: number
  maxDrawdown: number
  sharpeRatio: number
  recoveryFactor: number
  avgRiskReward: number
  consecutiveWins: number
  consecutiveLosses: number
  tradeFrequency: number
  netProfit: number
  totalReturn: number
  avgWin: number
  avgLoss: number
  largestWin: number
  largestLoss: number
  expectancy: number
  standardDeviation: number
  startDate: string
  endDate: string
}

export interface ForwardTestResult {
  totalTrades: number
  winRate: number
  profitFactor: number
  drawdown: number
  sharpeRatio: number
  confidenceScore: number
  startDate: string
  endDate: string
  currentStatus: 'active' | 'completed' | 'failed'
}

export interface TradingRules {
  entryConditions: string[]
  exitConditions: string[]
  stopLossRules: string[]
  positionSizing: string[]
  filters: string[]
  indicators: string[]
  timeframes: string[]
  pairs: string[]
  riskLevel: 'low' | 'medium' | 'high'
  marketCondition: string[]
}

export interface CollectedContent {
  id: string
  source: ContentSource
  sourceUrl: string
  title: string
  content: string
  author: string | null
  publishedAt: string
  collectedAt: string
  status: ContentStatus
  sourceType: string
  engagement: {
    likes: number
    comments: number
    shares: number
    views: number
  }
  keywords: string[]
  marketCategory: MarketCategory | null
}

export interface TradingIdea {
  id: string
  contentId: string
  title: string
  summary: string
  rules: TradingRules | null
  marketCategory: MarketCategory | null
  confidence: number
  source: ContentSource
  sourceUrl: string
  discoveredAt: string
  status: 'pending' | 'extracting' | 'extracted' | 'building' | 'validating' | 'ready' | 'rejected'
}

export interface CrawlerConfig {
  enabled: boolean
  intervalMinutes: number
  maxItemsPerRun: number
  userAgent: string
  respectRobotsTxt: boolean
  requestDelayMs: number
  timeoutMs: number
}

export interface SourceConfig {
  type: ContentSource
  name: string
  feeds: string[]
  crawlerConfig: CrawlerConfig
  credentials?: {
    apiKey?: string
    clientId?: string
    clientSecret?: string
  }
}

export interface PerformanceRecord {
  strategyId: string
  publishedAt: string
  lastCheckedAt: string
  totalSignals: number
  successfulSignals: number
  failedSignals: number
  currentConfidence: number
  performanceTrend: 'improving' | 'stable' | 'declining'
  realWinRate: number
  realProfitFactor: number
  realDrawdown: number
}

export interface ValidatedStrategy {
  id: string
  ideaId: string
  title: string
  titleAr: string
  currencyPair: string
  direction: 'BUY' | 'SELL'
  entryPrice: number
  stopLoss: number
  takeProfit1: number
  takeProfit2: number
  risk: 'Low' | 'Medium' | 'High'
  confidence: number
  summary: string
  summaryAr: string
  isPremium: boolean
  isPublished: boolean
  isApproved: boolean
  trend: 'Bullish' | 'Bearish' | 'Neutral'
  support: number[]
  resistance: number[]
  indicators: {
    rsi: number
    macd: string
    ema: string
    sma: string
    atr: number
    bollingerBands: { upper: number; middle: number; lower: number }
  }
  notes: string
  notesAr: string
  tradesAnalyzed: number
  aiModel: string
  technicalAnalysis: string
  technicalAnalysisAr: string
  fundamentalAnalysis: string
  fundamentalAnalysisAr: string
  backtestResult: BacktestResult | null
  forwardTestResult: ForwardTestResult | null
  validationScore: number
  sourceAttribution: string
  extractedRules: TradingRules | null
  performanceTracking: PerformanceRecord | null
}

export interface DiscoveryConfig {
  maxItemsPerSource: number
  runIntervalMinutes: number
  enabledSources: ContentSource[]
  crawlerConfigs: Partial<Record<ContentSource, Partial<CrawlerConfig>>>
}
