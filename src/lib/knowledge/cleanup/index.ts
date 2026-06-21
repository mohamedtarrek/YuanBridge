import { prisma } from '@/lib/db/prisma'
import type { CleanupResult } from './types'

export async function runCleanup(): Promise<CleanupResult> {
  const startedAt = Date.now()
  console.log('[Cleanup] Starting cleanup cycle...')

  const result: CleanupResult = {
    temporaryDataDeleted: 0,
    analysisFilesDeleted: 0,
    crawlerCacheCleared: 0,
    backtestHistoryDeleted: 0,
    logsDeleted: 0,
    duration: '',
    timestamp: new Date().toISOString(),
  }

  const tasks = await Promise.allSettled([
    cleanupTemporaryData(),
    cleanupAnalysisFiles(),
    cleanupCrawlerCache(),
    cleanupBacktestHistory(),
    cleanupLogs(),
  ])

  const counters = [0, 0, 0, 0, 0]
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    if (task.status === 'fulfilled') {
      counters[i] = task.value
    } else {
      console.error(`[Cleanup] Task ${i} failed:`, task.reason)
    }
  }

  result.temporaryDataDeleted = counters[0]
  result.analysisFilesDeleted = counters[1]
  result.crawlerCacheCleared = counters[2]
  result.backtestHistoryDeleted = counters[3]
  result.logsDeleted = counters[4]

  const durationMs = Date.now() - startedAt
  result.duration = `${durationMs}ms`

  const total = counters.reduce((sum, c) => sum + c, 0)
  console.log(`[Cleanup] Cleanup cycle completed: ${total} records cleaned in ${result.duration}`)

  return result
}

export async function cleanupTemporaryData(): Promise<number> {
  try {
    const twoHoursAgo = new Date()
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2)

    const deleted = await prisma.report.deleteMany({
      where: {
        type: 'temporary',
        createdAt: { lt: twoHoursAgo },
      },
    })

    console.log(`[Cleanup] Deleted ${deleted.count} temporary data records`)
    return deleted.count
  } catch (error) {
    console.error('[Cleanup] Temporary data cleanup failed:', error)
    return 0
  }
}

export async function cleanupAnalysisFiles(): Promise<number> {
  try {
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)

    const deleted = await prisma.report.deleteMany({
      where: {
        type: 'analysis',
        createdAt: { lt: oneHourAgo },
      },
    })

    console.log(`[Cleanup] Deleted ${deleted.count} analysis files`)
    return deleted.count
  } catch (error) {
    console.error('[Cleanup] Analysis files cleanup failed:', error)
    return 0
  }
}

export async function cleanupCrawlerCache(): Promise<number> {
  try {
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const deleted = await prisma.report.deleteMany({
      where: {
        type: 'crawler_cache',
        createdAt: { lt: twentyFourHoursAgo },
      },
    })

    const count = deleted.count

    const delMarketData = await prisma.marketData.deleteMany({
      where: {
        source: { in: ['web_crawler', 'reddit_crawler', 'rss_crawler'] },
        timestamp: { lt: twentyFourHoursAgo },
      },
    })

    console.log(`[Cleanup] Cleared ${count} crawler cache entries and ${delMarketData.count} old market data records`)
    return count + delMarketData.count
  } catch (error) {
    console.error('[Cleanup] Crawler cache cleanup failed:', error)
    return 0
  }
}

export async function cleanupBacktestHistory(): Promise<number> {
  try {
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const deleted = await prisma.report.deleteMany({
      where: {
        type: 'backtest',
        createdAt: { lt: fourteenDaysAgo },
      },
    })

    const deletedMarketData = await prisma.marketData.deleteMany({
      where: {
        source: 'backtest',
        timestamp: { lt: fourteenDaysAgo },
      },
    })

    const total = deleted.count + deletedMarketData.count
    console.log(`[Cleanup] Deleted ${total} backtest history records`)
    return total
  } catch (error) {
    console.error('[Cleanup] Backtest history cleanup failed:', error)
    return 0
  }
}

export async function cleanupLogs(): Promise<number> {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const deleted = await prisma.aIJobLog.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
      },
    })

    const deletedJobs = await prisma.aIJob.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        status: { in: ['COMPLETED', 'FAILED'] },
      },
    })

    const total = deleted.count + deletedJobs.count
    console.log(`[Cleanup] Deleted ${total} log records (${deleted.count} job logs, ${deletedJobs.count} completed jobs)`)
    return total
  } catch (error) {
    console.error('[Cleanup] Logs cleanup failed:', error)
    return 0
  }
}
