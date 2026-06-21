import { prisma } from '@/lib/db/prisma'

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
