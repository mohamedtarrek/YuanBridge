import { prisma } from '@/lib/db/prisma'
import type { TradingIdea, ValidatedStrategy } from '@/lib/knowledge/types'
import { runValidationPipeline } from '@/lib/knowledge/validation'

export interface ValidationWorkerResult {
  processedCount: number
  approvedCount: number
  rejectedCount: number
  publishedCount: number
  duration: string
  errors: string[]
}

export async function runValidationWorker(): Promise<ValidationWorkerResult> {
  const startedAt = Date.now()
  console.log('[ValidationWorker] Starting validation cycle...')

  const errors: string[] = []
  let approvedCount = 0
  let rejectedCount = 0
  let publishedCount = 0
  let processedCount = 0

  try {
    const pendingForValidation = await prisma.report.findMany({
      where: {
        type: 'validation_queue',
        createdAt: {
          gte: new Date(Date.now() - 48 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 25,
    })

    processedCount = pendingForValidation.length
    console.log(`[ValidationWorker] Processing ${processedCount} ideas for validation`)

    for (const entry of pendingForValidation) {
      try {
        let idea: TradingIdea
        try {
          idea = JSON.parse(entry.data) as TradingIdea
        } catch {
          await prisma.report.delete({ where: { id: entry.id } })
          continue
        }

        idea.status = 'validating'

        const validatedStrategy = await runValidationPipeline(idea)

        if (validatedStrategy) {
          approvedCount++
          if (validatedStrategy.status === 'PUBLISHED') {
            publishedCount++
          }
          console.log(`[ValidationWorker] Strategy approved: "${validatedStrategy.title}" (score: ${validatedStrategy.validationScore})`)
        } else {
          rejectedCount++
          idea.status = 'rejected'
          console.log(`[ValidationWorker] Idea rejected: "${idea.title}"`)
        }

        await prisma.report.delete({ where: { id: entry.id } })
      } catch (error) {
        errors.push(`Failed to validate idea ${entry.id}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  } catch (error) {
    errors.push(`Validation worker error: ${error instanceof Error ? error.message : String(error)}`)
  }

  const durationMs = Date.now() - startedAt
  const duration = `${durationMs}ms`

  console.log(`[ValidationWorker] Completed: ${processedCount} processed, ${approvedCount} approved, ${rejectedCount} rejected, ${publishedCount} published (${duration})`)

  return {
    processedCount,
    approvedCount,
    rejectedCount,
    publishedCount,
    duration,
    errors,
  }
}
