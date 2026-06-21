import { prisma } from '@/lib/db/prisma'
import type { TradingIdea } from '@/lib/knowledge/types'
import { runValidationPipeline } from '@/lib/knowledge/validation'

export interface PublishWorkerResult {
  validatedCount: number
  publishedCount: number
  skippedCount: number
  duration: string
  errors: string[]
}

export async function runPublishWorker(): Promise<PublishWorkerResult> {
  const startedAt = Date.now()
  console.log('[PublishWorker] Starting publish cycle...')

  const errors: string[] = []
  let validatedCount = 0
  let publishedCount = 0
  let skippedCount = 0

  try {
    const pendingIdeaEntries = await prisma.report.findMany({
      where: {
        type: 'trading_idea',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 20,
    })

    console.log(`[PublishWorker] Checking ${pendingIdeaEntries.length} trading ideas for publishing`)

    for (const entry of pendingIdeaEntries) {
      try {
        let idea: TradingIdea
        try {
          idea = JSON.parse(entry.data) as TradingIdea
        } catch (err) {
          console.warn('[PublishWorker] Failed to parse entry data, deleting corrupt entry', entry.id, err)
          await prisma.report.delete({ where: { id: entry.id } })
          continue
        }

        if (idea.status !== 'extracted' && idea.status !== 'ready') {
          skippedCount++
          continue
        }

        validatedCount++
        const validatedStrategy = await runValidationPipeline(idea)

        if (validatedStrategy?.status === 'PUBLISHED') {
          publishedCount++
          console.log(`[PublishWorker] Published strategy: "${validatedStrategy.title}"`)
        } else {
          console.log(`[PublishWorker] Strategy not published (failed validation): "${idea.title}"`)
        }

        await prisma.report.delete({ where: { id: entry.id } })
      } catch (error) {
        errors.push(`Failed to publish idea ${entry.id}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  } catch (error) {
    errors.push(`Publish worker error: ${error instanceof Error ? error.message : String(error)}`)
  }

  const durationMs = Date.now() - startedAt
  const duration = `${durationMs}ms`

  console.log(`[PublishWorker] Completed: ${validatedCount} validated, ${publishedCount} published, ${skippedCount} skipped (${duration})`)

  return {
    validatedCount,
    publishedCount,
    skippedCount,
    duration,
    errors,
  }
}
