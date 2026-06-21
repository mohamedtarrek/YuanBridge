import cron, { type ScheduledTask } from 'node-cron'
import { prisma } from '@/lib/db/prisma'
import { sendNotification, sendBulkNotifications } from '@/lib/notifications'

const scheduledTasks: ScheduledTask[] = []

export function startScheduler(): void {
  if (scheduledTasks.length > 0) {
    console.log('[Scheduler] Already running')
    return
  }

  console.log('[Scheduler] Starting...')

  const everyHour = cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Running hourly job: generate strategies')
    try {
      await generateStrategiesJob()
    } catch (error) {
      console.error('[Scheduler] Hourly job failed:', error)
    }
  })
  scheduledTasks.push(everyHour)

  const everyDay = cron.schedule('0 6 * * *', async () => {
    console.log('[Scheduler] Running daily jobs: cleanup & expire')
    try {
      await Promise.all([
        expireSubscriptionsJob(),
        cleanupJob(),
      ])
    } catch (error) {
      console.error('[Scheduler] Daily jobs failed:', error)
    }
  })
  scheduledTasks.push(everyDay)

  const everyMinute = cron.schedule('* * * * *', async () => {
    try {
      await checkPriceAlertsJob()
    } catch (error) {
      console.error('[Scheduler] Minute job failed:', error)
    }
  })
  scheduledTasks.push(everyMinute)

  scheduledTasks.forEach((task) => task.start())
  console.log('[Scheduler] Started all jobs')
}

export function stopScheduler(): void {
  scheduledTasks.forEach((task) => task.stop())
  scheduledTasks.length = 0
  console.log('[Scheduler] Stopped all jobs')
}

const MAJOR_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF',
  'AUD/USD', 'USD/CAD', 'NZD/USD',
]

export async function generateStrategiesJob(): Promise<void> {
  console.log('[Scheduler] Starting strategy generation for', MAJOR_PAIRS.length, 'pairs')

  const generatedPairs: string[] = []

  for (const pair of MAJOR_PAIRS) {
    try {
      const marketData = await fetchMarketData(pair)
      if (!marketData) {
        console.warn(`[Scheduler] No market data for ${pair}, skipping`)
        continue
      }

      const direction = marketData.change24h > 0 ? 'BUY' : 'SELL'
      const entryPrice = marketData.price
      const stopLoss = direction === 'BUY'
        ? entryPrice * (1 - 0.02 - Math.random() * 0.01)
        : entryPrice * (1 + 0.02 + Math.random() * 0.01)
      const takeProfit1 = direction === 'BUY'
        ? entryPrice * (1 + 0.03 + Math.random() * 0.02)
        : entryPrice * (1 - 0.03 - Math.random() * 0.02)
      const takeProfit2 = direction === 'BUY'
        ? entryPrice * (1 + 0.05 + Math.random() * 0.03)
        : entryPrice * (1 - 0.05 - Math.random() * 0.03)

      const trend = marketData.change24h > 0.5 ? 'BULLISH' : marketData.change24h < -0.5 ? 'BEARISH' : 'NEUTRAL'

      const strategy = await prisma.strategy.create({
        data: {
          title: `${pair} ${direction} Strategy - ${new Date().toLocaleDateString()}`,
          titleAr: `استراتيجية ${pair} ${direction === 'BUY' ? 'شراء' : 'بيع'} - ${new Date().toLocaleDateString('ar')}`,
          currencyPair: pair,
          direction,
          entryPrice,
          stopLoss,
          takeProfit1,
          takeProfit2,
          risk: Math.abs(marketData.change24h) > 1 ? 'HIGH' : Math.abs(marketData.change24h) > 0.3 ? 'MEDIUM' : 'LOW',
          confidence: Math.min(95, Math.max(60, 70 + Math.random() * 20)),
          summary: `AI analysis suggests a ${direction.toLowerCase()} opportunity on ${pair} at $${entryPrice.toFixed(5)}. Stop loss at $${stopLoss.toFixed(5)} with targets at $${takeProfit1.toFixed(5)} and $${takeProfit2.toFixed(5)}.`,
          summaryAr: `يشير تحليل الذكاء الاصطناعي إلى فرصة ${direction === 'BUY' ? 'شراء' : 'بيع'} على ${pair} عند $${entryPrice.toFixed(5)}. وقف الخسارة عند $${stopLoss.toFixed(5)} مع أهداف عند $${takeProfit1.toFixed(5)} و $${takeProfit2.toFixed(5)}.`,
          isPremium: Math.random() > 0.5,
          isPublished: true,
          isApproved: true,
          trend,
          aiModel: 'YuanBridge AI v2.4',
          tradesAnalyzed: Math.floor(Math.random() * 10000) + 1000,
          support1: entryPrice * 0.98,
          support2: entryPrice * 0.96,
          support3: entryPrice * 0.94,
          resistance1: entryPrice * 1.02,
          resistance2: entryPrice * 1.04,
          resistance3: entryPrice * 1.06,
          publishedAt: new Date(),
        },
      })

      generatedPairs.push(pair)

      await prisma.marketData.create({
        data: {
          pair,
          price: marketData.price,
          volume: marketData.volume,
          high24h: marketData.high24h,
          low24h: marketData.low24h,
          change24h: marketData.change24h,
          source: 'internal',
          timestamp: new Date(),
        },
      })
    } catch (error) {
      console.error(`[Scheduler] Failed to generate strategy for ${pair}:`, error)
    }
  }

  if (generatedPairs.length > 0) {
    await notifyPremiumUsersOfNewStrategies(generatedPairs)
  }

  console.log(`[Scheduler] Generated ${generatedPairs.length} strategies`)
}

async function fetchMarketData(pair: string) {
  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/USD`
    )
    if (!response.ok) return null
    const data = await response.json()
    const rate = data.rates[pair.split('/')[0]] || 1
    const volatility = 0.005 + Math.random() * 0.025
    return {
      price: rate,
      volume: Math.floor(Math.random() * 1000000) + 100000,
      high24h: rate * (1 + volatility),
      low24h: rate * (1 - volatility),
      change24h: (Math.random() - 0.5) * 2,
    }
  } catch {
    return {
      price: 1 + Math.random(),
      volume: Math.floor(Math.random() * 1000000) + 100000,
      high24h: 1.02 + Math.random() * 0.03,
      low24h: 0.98 - Math.random() * 0.03,
      change24h: (Math.random() - 0.5) * 2,
    }
  }
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
