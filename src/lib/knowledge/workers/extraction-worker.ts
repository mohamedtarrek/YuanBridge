import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/db/prisma'
import type { CollectedContent, TradingIdea, ContentStatus } from '@/lib/knowledge/types'
import { normalizeText, extractKeywords, calculateSimilarity, summarize } from '@/lib/knowledge/extraction/text-normalizer'

export interface ExtractionWorkerResult {
  processedCount: number
  ideasCreated: number
  duplicatesFound: number
  spamRemoved: number
  duration: string
  errors: string[]
}

const SPAM_PATTERNS = [
  /buy\s*(?:my|our)\s*(?:course|ebook|signal|service|robot|ea|indicator)/gi,
  /click\s*(?:here|the\s*link|this\s*link)/gi,
  /earn\s*(?:\$|€|£)\s*\d+\s*(?:a\s*day|per\s*day|daily|weekly|monthly)/gi,
  /get\s*rich\s*quick/gi,
  /guaranteed\s*(?:profit|returns|income|money)/gi,
  /double\s*your\s*(?:money|account|investment)/gi,
  /no\s*(?:risk|lose?|loss)\s*trading/gi,
  /(?:https?:\/\/[^\s]+){3,}/gi,
]

const DUPLICATE_SIMILARITY_THRESHOLD = 0.85
const MIN_CONTENT_LENGTH = 50
const MAX_CONTENT_LENGTH = 10000

function isSpam(content: string): boolean {
  const lower = content.toLowerCase()

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(lower)) {
      return true
    }
  }

  const urlCount = (lower.match(/https?:\/\/[^\s]+/g) || []).length
  if (urlCount > 5) return true

  const capsRatio = (content.match(/[A-Z]/g) || []).length / Math.max(content.length, 1)
  if (capsRatio > 0.5 && content.length > 100) return true

  return false
}

export async function runExtractionWorker(): Promise<ExtractionWorkerResult> {
  const startedAt = Date.now()
  console.log('[ExtractionWorker] Starting extraction cycle...')

  const errors: string[] = []
  let ideasCreated = 0
  let duplicatesFound = 0
  let spamRemoved = 0
  let processedCount = 0

  try {
    const pendingContent = await prisma.report.findMany({
      where: {
        type: 'pending_content',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    })

    processedCount = pendingContent.length
    console.log(`[ExtractionWorker] Processing ${processedCount} pending content items`)

    for (const entry of pendingContent) {
      try {
        let content: CollectedContent
        try {
          content = JSON.parse(entry.data) as CollectedContent
        } catch (err) {
          console.warn('[ExtractionWorker] Failed to parse entry data, deleting corrupt entry', entry.id, err)
          await prisma.report.delete({ where: { id: entry.id } })
          continue
        }

        if (isSpam(content.title + ' ' + content.content)) {
          spamRemoved++
          console.log(`[ExtractionWorker] Spam detected: "${content.title}"`)
          await prisma.report.delete({ where: { id: entry.id } })
          continue
        }

        const existingIdeas = await prisma.report.findMany({
          where: {
            type: 'trading_idea',
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          select: { data: true },
        })

        let isDuplicate = false
        for (const existing of existingIdeas) {
          try {
            const existingIdea = JSON.parse(existing.data) as TradingIdea
            const similarity = calculateSimilarity(
              content.title + ' ' + content.content,
              existingIdea.title + ' ' + existingIdea.summary,
            )
            if (similarity >= DUPLICATE_SIMILARITY_THRESHOLD) {
              isDuplicate = true
              break
            }
          } catch (err) {
            console.warn('[ExtractionWorker] Similarity check failed, skipping', err)
            continue
          }
        }

        if (isDuplicate) {
          duplicatesFound++
          content.status = 'duplicate'
          await prisma.report.delete({ where: { id: entry.id } })
          continue
        }

        const normalizedContent = normalizeText(content.content)

        if (normalizedContent.length < MIN_CONTENT_LENGTH) {
          console.log(`[ExtractionWorker] Content too short: "${content.title}"`)
          await prisma.report.delete({ where: { id: entry.id } })
          continue
        }

        const keywords = extractKeywords(normalizedContent, 15)

        const idea: TradingIdea = {
          id: uuidv4(),
          contentId: content.id,
          title: content.title.slice(0, 200),
          summary: summarize(normalizedContent, 300),
          rules: null,
          marketCategory: content.marketCategory,
          confidence: 30 + Math.random() * 40,
          source: content.source,
          sourceUrl: content.sourceUrl,
          discoveredAt: new Date().toISOString(),
          status: 'extracted',
        }

        await prisma.report.create({
          data: {
            id: uuidv4(),
            userId: null,
            type: 'trading_idea',
            data: JSON.stringify(idea),
            generatedAt: new Date(),
            createdAt: new Date(),
          },
        })

        await prisma.report.create({
          data: {
            id: uuidv4(),
            userId: null,
            type: 'validation_queue',
            data: JSON.stringify(idea),
            generatedAt: new Date(),
            createdAt: new Date(),
          },
        })

        await prisma.report.delete({ where: { id: entry.id } })

        ideasCreated++
      } catch (error) {
        errors.push(`Failed to process content ${entry.id}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  } catch (error) {
    errors.push(`Extraction worker error: ${error instanceof Error ? error.message : String(error)}`)
  }

  const durationMs = Date.now() - startedAt
  const duration = `${durationMs}ms`

  console.log(`[ExtractionWorker] Completed: ${processedCount} processed, ${ideasCreated} ideas, ${duplicatesFound} duplicates, ${spamRemoved} spam (${duration})`)

  return {
    processedCount,
    ideasCreated,
    duplicatesFound,
    spamRemoved,
    duration,
    errors,
  }
}
