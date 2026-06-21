import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/db/prisma'
import { getEnabledSources } from '@/lib/knowledge/discovery/source-registry'

export interface DiscoveryWorkerResult {
  sourcesChecked: number
  newContentFound: number
  pendingEnqueued: number
  duration: string
  errors: string[]
}

export async function runDiscoveryWorker(): Promise<DiscoveryWorkerResult> {
  const startedAt = Date.now()
  console.log('[DiscoveryWorker] Starting discovery cycle...')

  const errors: string[] = []
  let newContentFound = 0
  let pendingEnqueued = 0

  const enabledSources = getEnabledSources()
  const sourcesChecked = enabledSources.length

  console.log(`[DiscoveryWorker] Checking ${sourcesChecked} enabled sources`)

  for (const source of enabledSources) {
    try {
      const collectedItems = await source.crawl()
      newContentFound += collectedItems.length

      for (const item of collectedItems) {
        try {
          const existing = await prisma.marketData.findFirst({
            where: {
              source: item.source,
              timestamp: new Date(item.publishedAt),
            },
          })

          if (existing) {
            continue
          }

          await prisma.report.create({
            data: {
              id: uuidv4(),
              userId: null,
              type: 'pending_content',
              data: JSON.stringify(item),
              generatedAt: new Date(),
              createdAt: new Date(),
            },
          })

          pendingEnqueued++
        } catch (error) {
          errors.push(`Failed to enqueue content from ${source.name}: ${error instanceof Error ? error.message : String(error)}`)
        }
      }

      console.log(`[DiscoveryWorker] ${source.name}: ${collectedItems.length} items, ${pendingEnqueued} enqueued`)
    } catch (error) {
      const msg = `Failed to crawl ${source.name}: ${error instanceof Error ? error.message : String(error)}`
      errors.push(msg)
      console.error(`[DiscoveryWorker] ${msg}`)
    }
  }

  const durationMs = Date.now() - startedAt
  const duration = `${durationMs}ms`

  console.log(`[DiscoveryWorker] Completed: ${sourcesChecked} sources, ${newContentFound} found, ${pendingEnqueued} enqueued, ${errors.length} errors (${duration})`)

  return {
    sourcesChecked,
    newContentFound,
    pendingEnqueued,
    duration,
    errors,
  }
}
