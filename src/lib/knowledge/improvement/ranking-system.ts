import { prisma } from '@/lib/db/prisma'
import type { ValidatedStrategy } from '@/lib/knowledge/types'

interface RankedStrategy extends ValidatedStrategy {
  rankScore: number
}

function calculateRankingScore(strategy: {
  confidence: number
  tradesAnalyzed: number
  savedCount: number
  age: number
}): number {
  let score = 0

  score += strategy.confidence * 0.35
  score += Math.min(strategy.tradesAnalyzed / 100, 20)
  score += Math.min(strategy.savedCount * 5, 15)
  score += Math.min(strategy.age * 2, 10)

  return Math.round(score * 100) / 100
}

export async function rankStrategies(): Promise<RankedStrategy[]> {
  const strategies = await prisma.strategy.findMany({
      where: { status: 'PUBLISHED' },
    include: {
      _count: {
        select: { savedBy: true, favorites: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const now = Date.now()

  const ranked: RankedStrategy[] = (strategies as any[]).map(s => {
    const age = (now - s.createdAt.getTime()) / (1000 * 60 * 60 * 24)

    const savedCount = s._count.savedBy + s._count.favorites

    const rankScore = calculateRankingScore({
      confidence: s.confidence,
      tradesAnalyzed: s.tradesAnalyzed,
      savedCount,
      age,
    })

    return {
      id: s.id,
      ideaId: s.id,
      title: s.title,
      titleAr: s.titleAr,
      currencyPair: s.currencyPair,
      direction: s.direction as 'BUY' | 'SELL',
      entryPrice: s.entryPrice,
      stopLoss: s.stopLoss,
      takeProfit1: s.takeProfit1,
      takeProfit2: s.takeProfit2,
      risk: s.risk as 'Low' | 'Medium' | 'High',
      confidence: s.confidence,
      summary: s.summary,
      summaryAr: s.summaryAr,
      isPremium: s.isPremium,
      status: s.status as any,
      trend: (s.trend || 'Neutral') as 'Bullish' | 'Bearish' | 'Neutral',
      support: [s.support1, s.support2, s.support3].filter((v): v is number => v !== null),
      resistance: [s.resistance1, s.resistance2, s.resistance3].filter((v): v is number => v !== null),
      indicators: {
        rsi: s.rsi ?? 50,
        macd: 'neutral',
        ema: 'neutral',
        sma: 'neutral',
        atr: s.atr ?? 0.001,
        bollingerBands: {
          upper: s.bbUpper ?? s.entryPrice * 1.02,
          middle: s.entryPrice,
          lower: s.bbLower ?? s.entryPrice * 0.98,
        },
      },
      notes: s.notes ?? '',
      notesAr: s.notesAr ?? '',
      tradesAnalyzed: s.tradesAnalyzed,
      aiModel: s.aiModel ?? '',
      technicalAnalysis: s.technicalAnalysis ?? '',
      technicalAnalysisAr: s.technicalAnalysisAr ?? '',
      fundamentalAnalysis: s.fundamentalAnalysis ?? '',
      fundamentalAnalysisAr: s.fundamentalAnalysisAr ?? '',
      backtestResult: null,
      forwardTestResult: null,
      validationScore: s.confidence,
      sourceAttribution: 'internal',
      extractedRules: null,
      performanceTracking: null,
      rankScore,
    }
  })

  return ranked.sort((a, b) => b.rankScore - a.rankScore)
}

export async function updateRankings(): Promise<void> {
  console.log('[RankingSystem] Updating rankings...')
  await rankStrategies()
  console.log('[RankingSystem] Rankings updated')
}

export async function getTopStrategies(
  limit: number,
  includePremium?: boolean,
): Promise<RankedStrategy[]> {
  const ranked = await rankStrategies()

  const filtered = includePremium
    ? ranked
    : ranked.filter(s => !s.isPremium)

  return filtered.slice(0, limit)
}

export async function getTrendingStrategies(): Promise<RankedStrategy[]> {
  const ranked = await rankStrategies()

  const trending = ranked.filter(s => {
    const ageInDays = (Date.now() - new Date(s.status === 'PUBLISHED' ? 0 : 0).getTime()) / (1000 * 60 * 60 * 24)
    return ageInDays < 7
  })

  return trending.slice(0, 10)
}
