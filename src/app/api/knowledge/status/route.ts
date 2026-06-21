import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getAllWorkerStatuses } from '@/lib/knowledge/workers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [sourcesCount, pendingQueueSize, publishedCount, workerStatuses] = await Promise.all([
      prisma.report.count({
        where: {
          type: 'pending_content',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.report.count({
        where: {
          type: 'validation_queue',
          createdAt: {
            gte: new Date(Date.now() - 48 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.strategy.count({
        where: { isPublished: true },
      }),
      Promise.resolve(getAllWorkerStatuses()),
    ])

    const ideaCount = await prisma.report.count({
      where: { type: 'trading_idea' },
    })

    const lastCleanup = await prisma.report.findFirst({
      where: { type: { startsWith: 'cleanup_' } },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        sources: {
          count: workerStatuses.filter(s => s.name === 'discovery' && s.lastResult !== null).length,
          active: workerStatuses.filter(s => s.lastRunAt !== null).length,
          checked: sourcesCount,
        },
        pendingQueue: {
          size: pendingQueueSize,
          ideas: ideaCount,
        },
        published: {
          count: publishedCount,
        },
        workers: workerStatuses.map(s => ({
          name: s.name,
          isRunning: s.isRunning,
          lastRunAt: s.lastRunAt,
          lastResult: s.lastResult ? tryParseResult(s.lastResult) : null,
          interval: s.interval,
        })),
        cleanup: {
          lastRunAt: lastCleanup?.createdAt?.toISOString() ?? null,
        },
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[KnowledgeStatus] Failed to get system status:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve system status',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

function tryParseResult(result: string): unknown {
  try {
    return JSON.parse(result)
  } catch {
    return result
  }
}
