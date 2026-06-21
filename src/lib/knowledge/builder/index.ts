import type { TradingIdea, ValidatedStrategy, TradingRules } from '@/lib/knowledge/types'
import type { QuoteData } from '@/lib/market-data/types'
import { calculateEntryPrice, calculateStopLoss, calculateTakeProfit, calculateRiskReward } from './price-calculator'
import { generateSummary, generateArabicSummary, generateTechnicalAnalysis, generateFundamentalAnalysis } from './summary-generator'
import { calculateStrategyConfidence } from './confidence-calculator'
import { v4 as uuidv4 } from 'uuid'
import { classifyDirection } from '@/lib/knowledge/extraction/classifier'

function inferPair(idea: TradingIdea): string {
  if (idea.rules?.pairs && idea.rules.pairs.length > 0) {
    return idea.rules.pairs[0]
  }

  const text = `${idea.title} ${idea.summary}`
  const pairPatterns = [
    /\b(EUR\/USD|GBP\/USD|USD\/JPY|AUD\/USD|USD\/CAD|NZD\/USD|USD\/CHF|EUR\/GBP|EUR\/JPY|GBP\/JPY|XAU\/USD|XAG\/USD|BTC\/USD|ETH\/USD)\b/i,
  ]

  for (const pattern of pairPatterns) {
    const match = text.match(pattern)
    if (match) return match[1].toUpperCase()
  }

  const marketMapping: Record<string, string> = {
    forex: 'EUR/USD',
    crypto: 'BTC/USD',
    stocks: 'SPX',
    commodities: 'XAU/USD',
    indices: 'US30',
  }

  return idea.marketCategory ? (marketMapping[idea.marketCategory] ?? 'EUR/USD') : 'EUR/USD'
}

function inferDirection(idea: TradingIdea): 'BUY' | 'SELL' {
  if (idea.rules) {
    const text = [
      ...idea.rules.entryConditions,
      ...idea.rules.exitConditions,
      ...idea.rules.marketCondition,
    ].join(' ')
    if (text) {
      const direction = classifyDirection(text)
      if (direction !== 'BOTH') return direction
    }
  }

  const text = `${idea.title} ${idea.summary}`
  const direction = classifyDirection(text)
  return direction === 'BOTH' ? 'BUY' : direction
}

function extractATRFromMarketData(marketData: QuoteData): number {
  const range = marketData.high24h - marketData.low24h
  if (range > 0) return range
  return marketData.price * 0.01
}

export interface BuildResult {
  strategy: ValidatedStrategy | null
  error?: string
}

export async function buildStrategy(
  idea: TradingIdea,
  marketData: QuoteData,
): Promise<BuildResult> {
  try {
    if (!idea.rules) {
      return { strategy: null, error: 'No trading rules to build strategy from' }
    }

    const pair = inferPair(idea)
    const direction = inferDirection(idea)
    const atr = extractATRFromMarketData(marketData)

    const entryConditionText = idea.rules.entryConditions.join(' ')
    const exitConditionText = idea.rules.exitConditions.join(' ')
    const slConditionText = idea.rules.stopLossRules.join(' ')

    const entryPrice = calculateEntryPrice(entryConditionText || idea.summary, marketData)

    const stopLoss = calculateStopLoss(slConditionText, entryPrice, direction, atr)

    const { tp1, tp2 } = calculateTakeProfit(exitConditionText, entryPrice, direction, atr)

    const indicatorNames = idea.rules?.indicators ?? []

    const strategy: ValidatedStrategy = {
      id: uuidv4(),
      ideaId: idea.id,
      title: idea.title,
      titleAr: idea.title,
      currencyPair: pair,
      direction,
      entryPrice,
      stopLoss,
      takeProfit1: tp1,
      takeProfit2: tp2,
      risk: (idea.rules.riskLevel === 'high' ? 'High' :
             idea.rules.riskLevel === 'low' ? 'Low' : 'Medium') as 'Low' | 'Medium' | 'High',
      confidence: 0,
      summary: '',
      summaryAr: '',
      isPremium: false,
      isPublished: false,
      isApproved: false,
      trend: direction === 'BUY' ? 'Bullish' : 'Bearish' as 'Bullish' | 'Bearish' | 'Neutral',
      support: [
        +(entryPrice - atr * 1).toFixed(5),
        +(entryPrice - atr * 2).toFixed(5),
      ],
      resistance: [
        +(entryPrice + atr * 1).toFixed(5),
        +(entryPrice + atr * 2).toFixed(5),
      ],
      indicators: {
        rsi: 50,
        macd: indicatorNames.includes('MACD') ? 'Bullish crossover' : '',
        ema: indicatorNames.includes('EMA') ? `${entryPrice.toFixed(5)} (50-period)` : '',
        sma: indicatorNames.includes('SMA') ? `${entryPrice.toFixed(5)} (200-period)` : '',
        atr,
        bollingerBands: {
          upper: +(entryPrice + atr * 2).toFixed(5),
          middle: entryPrice,
          lower: +(entryPrice - atr * 2).toFixed(5),
        },
      },
      notes: `Extracted from ${idea.source} source. Rules: ${JSON.stringify(idea.rules)}`,
      notesAr: `مستخرج من مصدر ${idea.source}. القواعد: ${JSON.stringify(idea.rules)}`,
      tradesAnalyzed: 0,
      aiModel: 'rule-extraction-v1',
      technicalAnalysis: generateTechnicalAnalysis(idea.rules),
      technicalAnalysisAr: '',
      fundamentalAnalysis: generateFundamentalAnalysis(pair),
      fundamentalAnalysisAr: '',
      backtestResult: null,
      forwardTestResult: null,
      validationScore: 0,
      sourceAttribution: idea.source,
      extractedRules: idea.rules,
      performanceTracking: null,
    }

    strategy.summary = generateSummary(idea.rules, direction, pair)
    strategy.summaryAr = generateArabicSummary(idea.rules, direction, pair)
    strategy.technicalAnalysisAr = `تحليل فني: ${strategy.technicalAnalysis}`
    strategy.fundamentalAnalysisAr = `تحليل أساسي: ${strategy.fundamentalAnalysis}`

    strategy.confidence = calculateStrategyConfidence(strategy)

    return { strategy }
  } catch (error) {
    return {
      strategy: null,
      error: error instanceof Error ? error.message : 'Unknown build error',
    }
  }
}
