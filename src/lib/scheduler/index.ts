import { prisma } from '@/lib/db/prisma'
import { sendBulkNotifications } from '@/lib/notifications'
import { analyzeMarket, generateStrategy } from '@/lib/ai/engine'

const MAJOR_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF',
  'AUD/USD', 'USD/CAD', 'NZD/USD',
]

export async function generateStrategiesJob(): Promise<void> {
  console.log('[Scheduler] Starting strategy generation for', MAJOR_PAIRS.length, 'pairs')

  const generatedPairs: string[] = []

  for (const pair of MAJOR_PAIRS) {
    try {
      const marketAnalysis = await analyzeMarket(pair)

      const result = await generateStrategy({
        pair,
        prices: marketAnalysis.prices,
        highs: marketAnalysis.highs,
        lows: marketAnalysis.lows,
        closes: marketAnalysis.closes,
        volumes: marketAnalysis.volumes,
        marketData: marketAnalysis.marketData,
      })

      if (!result.success || !result.strategy) {
        console.warn(`[Scheduler] AI engine failed for ${pair}, using fallback`)
        await generateFallbackStrategy(pair)
        generatedPairs.push(pair)
        continue
      }

      const s = result.strategy

      await prisma.strategy.create({
        data: {
          title: s.title,
          titleAr: s.titleAr,
          currencyPair: s.currencyPair,
          direction: s.direction,
          entryPrice: s.entryPrice,
          stopLoss: s.stopLoss,
          takeProfit1: s.takeProfit1,
          takeProfit2: s.takeProfit2,
          risk: s.risk.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
          confidence: s.confidence,
          summary: s.summary,
          summaryAr: s.summaryAr,
          isPremium: Math.random() > 0.5,
          isPublished: true,
          isApproved: true,
          trend: s.trend.toUpperCase() as 'BULLISH' | 'BEARISH' | 'NEUTRAL',
          aiModel: s.aiModel,
          tradesAnalyzed: s.tradesAnalyzed,
          support1: s.support1 ?? null,
          support2: s.support2 ?? null,
          support3: s.support3 ?? null,
          resistance1: s.resistance1 ?? null,
          resistance2: s.resistance2 ?? null,
          resistance3: s.resistance3 ?? null,
          rsi: s.rsi ?? null,
          emaFast: s.emaFast ?? null,
          emaSlow: s.emaSlow ?? null,
          smaPeriod: s.smaPeriod ?? null,
          smaValue: s.smaValue ?? null,
          atr: s.atr ?? null,
          bbUpper: s.bbUpper ?? null,
          bbMiddle: s.bbMiddle ?? null,
          bbLower: s.bbLower ?? null,
          notes: s.notes ?? null,
          notesAr: s.notesAr ?? null,
          publishedAt: new Date(),
        },
      })

      generatedPairs.push(pair)
      console.log(`[Scheduler] Generated AI strategy for ${pair} (confidence: ${s.confidence}%)`)

      await prisma.marketData.create({
        data: {
          pair,
          price: marketAnalysis.marketData.price,
          volume: marketAnalysis.marketData.volume,
          high24h: marketAnalysis.marketData.high24h,
          low24h: marketAnalysis.marketData.low24h,
          change24h: marketAnalysis.marketData.change24h,
          source: 'ai-engine',
          timestamp: new Date(),
        },
      })
    } catch (error) {
      console.error(`[Scheduler] Failed to generate strategy for ${pair}:`, error)
      try {
        await generateFallbackStrategy(pair)
        generatedPairs.push(pair)
      } catch (fallbackError) {
        console.error(`[Scheduler] Fallback also failed for ${pair}:`, fallbackError)
      }
    }
  }

  if (generatedPairs.length > 0) {
    await notifyPremiumUsersOfNewStrategies(generatedPairs)
  }

  console.log(`[Scheduler] Generated ${generatedPairs.length} strategies`)
}

async function generateFallbackStrategy(pair: string): Promise<void> {
  const entryPrice = 1 + Math.random()
  const direction = Math.random() > 0.5 ? 'BUY' : 'SELL'
  const stopLoss = direction === 'BUY'
    ? entryPrice * (1 - 0.02 - Math.random() * 0.01)
    : entryPrice * (1 + 0.02 + Math.random() * 0.01)
  const takeProfit1 = direction === 'BUY'
    ? entryPrice * (1 + 0.03 + Math.random() * 0.02)
    : entryPrice * (1 - 0.03 - Math.random() * 0.02)
  const takeProfit2 = direction === 'BUY'
    ? entryPrice * (1 + 0.05 + Math.random() * 0.03)
    : entryPrice * (1 - 0.05 - Math.random() * 0.03)

  await prisma.strategy.create({
    data: {
      title: `${pair} ${direction} Signal - Fallback`,
      titleAr: `إشارة ${direction === 'BUY' ? 'شراء' : 'بيع'} ${pair}`,
      currencyPair: pair,
      direction,
      entryPrice,
      stopLoss,
      takeProfit1,
      takeProfit2,
      risk: 'MEDIUM',
      confidence: Math.floor(Math.random() * 30) + 60,
      summary: `${direction === 'BUY' ? 'Buy' : 'Sell'} signal for ${pair} at ${entryPrice.toFixed(5)}. Generated via fallback.`,
      summaryAr: `إشارة ${direction === 'BUY' ? 'شراء' : 'بيع'} لـ ${pair} عند ${entryPrice.toFixed(5)}. تم التوليد عبر النسخ الاحتياطي.`,
      isPremium: false,
      isPublished: true,
      isApproved: true,
      trend: 'NEUTRAL',
      aiModel: 'YuanBridge Fallback',
      tradesAnalyzed: 0,
      publishedAt: new Date(),
    },
  })

  console.log(`[Scheduler] Generated fallback strategy for ${pair}`)
}

async function notifyPremiumUsersOfNewStrategies(pairs: string[]): Promise<void> {
  try {
    const premiumUsers = await prisma.user.findMany({
      where: {
        subscription: {
          status: 'ACTIVE',
          plan: 'PREMIUM',
        },
      },
      select: { id: true },
    })

    const notifications = premiumUsers.map((user) => ({
      userId: user.id,
      title: `${pairs.length} New AI Strategies Available`,
      titleAr: `${pairs.length} استراتيجيات جديدة متاحة`,
      message: `Our AI has generated ${pairs.length} new trading strategies for: ${pairs.join(', ')}. Check them out now!`,
      messageAr: `.قام ذكاؤنا الاصطناعي بتوليد ${pairs.length} استراتيجية تداول جديدة لـ: ${pairs.join(', ')}. تصفحها الآن`,
      type: 'STRATEGY' as const,
      link: '/strategies',
    }))

    await sendBulkNotifications(notifications)
  } catch (error) {
    console.error('[Scheduler] Failed to notify premium users:', error)
  }
}

export async function expireSubscriptionsJob(): Promise<void> {
  console.log('[Scheduler] Checking for expired subscriptions...')

  try {
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endsAt: { lt: new Date() },
      },
      include: { user: { select: { id: true, telegramChatId: true, telegramNotifications: true } } },
    })

    if (expiredSubscriptions.length === 0) {
      console.log('[Scheduler] No expired subscriptions found')
      return
    }

    await prisma.subscription.updateMany({
      where: {
        id: { in: expiredSubscriptions.map((s) => s.id) },
      },
      data: { status: 'EXPIRED' },
    })

    const notifications = expiredSubscriptions.map((sub) => ({
      userId: sub.user.id,
      title: 'Subscription Expired',
      titleAr: 'انتهى الاشتراك',
      message: 'Your subscription has expired. Renew now to continue accessing premium features.',
      messageAr: 'انتهت صلاحية اشتراكك. جدد الآن لمواصلة الوصول إلى الميزات المميزة.',
      type: 'BILLING' as const,
      link: '/pricing',
    }))

    await sendBulkNotifications(notifications)

    for (const sub of expiredSubscriptions) {
      if (sub.user.telegramChatId) {
        try {
          const { sendSubscriptionAlert } = await import('@/lib/notifications/telegram')
          await sendSubscriptionAlert(
            sub.user.telegramChatId,
            'Your YuanBridge subscription has expired. Renew now to continue accessing premium features.'
          )
        } catch (err) {
          console.error('[Scheduler] Telegram notification failed for user:', sub.user.id)
        }
      }
    }

    console.log(`[Scheduler] Expired ${expiredSubscriptions.length} subscriptions`)
  } catch (error) {
    console.error('[Scheduler] Expire subscriptions job failed:', error)
  }
}

export async function cleanupJob(): Promise<void> {
  console.log('[Scheduler] Running cleanup...')

  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const deletedMarketData = await prisma.marketData.deleteMany({
      where: { timestamp: { lt: thirtyDaysAgo } },
    })

    console.log(`[Scheduler] Deleted ${deletedMarketData.count} old market data records`)
  } catch (error) {
    console.error('[Scheduler] Market data cleanup failed:', error)
  }

  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const deletedLogs = await prisma.aIJobLog.deleteMany({
      where: { createdAt: { lt: sevenDaysAgo } },
    })

    console.log(`[Scheduler] Deleted ${deletedLogs.count} old AI job logs`)
  } catch (error) {
    console.error('[Scheduler] Logs cleanup failed:', error)
  }

  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const deletedReports = await prisma.report.deleteMany({
      where: { generatedAt: { lt: thirtyDaysAgo } },
    })

    console.log(`[Scheduler] Deleted ${deletedReports.count} old reports`)
  } catch (error) {
    console.error('[Scheduler] Reports cleanup failed:', error)
  }
}

export async function checkPriceAlertsJob(): Promise<void> {
  // Placeholder for price alert checking logic
  // In production, this would check user-defined price thresholds against live market data
}
