import type { CollectedContent, TradingIdea, TradingRules } from '@/lib/knowledge/types'
import { detectStrategy } from './strategy-detector'
import { extractRules } from './rule-extractor'
import { normalizeText, removeHtml, isDuplicate, summarize, extractKeywords } from './text-normalizer'
import { classifyByMarket, classifyByRisk } from './classifier'
import { v4 as uuidv4 } from 'uuid'

const SPAM_KEYWORDS = [
  'free money', 'click here', 'subscribe', 'limited offer',
  'act now', 'buy now', 'guaranteed profit', 'double your money',
  'get rich quick', 'no deposit', 'earn daily',
  'instant withdrawal', 'millionaire', 'passive income',
]

function isSpam(content: CollectedContent): boolean {
  const text = content.content.toLowerCase()
  const title = content.title.toLowerCase()
  const combined = `${title} ${text}`

  const spamMatches = SPAM_KEYWORDS.filter((kw) => combined.includes(kw)).length
  if (spamMatches >= 2) return true

  const linkRatio = (combined.match(/https?:\/\/[^\s]+/g) ?? []).length /
    Math.max(combined.split(/\s+/).length, 1)
  if (linkRatio > 0.3) return true

  const capsRatio = (combined.replace(/[^A-Z]/g, '').length) /
    Math.max(combined.replace(/[^a-zA-Z]/g, '').length, 1)
  if (capsRatio > 0.6) return true

  return false
}

export interface ExtractionResult {
  idea: TradingIdea | null
  rejected: boolean
  reason?: string
}

export async function extractFromContent(
  content: CollectedContent,
  existing: CollectedContent[] = [],
): Promise<ExtractionResult> {
  try {
    if (isSpam(content)) {
      return {
        idea: null,
        rejected: true,
        reason: 'Content flagged as spam',
      }
    }

    if (isDuplicate(content, existing)) {
      return {
        idea: null,
        rejected: true,
        reason: 'Duplicate content',
      }
    }

    const strategy = detectStrategy(content)
    if (!strategy.hasStrategy) {
      return {
        idea: null,
        rejected: true,
        reason: 'No trading strategy detected',
      }
    }

    const cleanedText = removeHtml(content.content)
    const normalizedText = normalizeText(cleanedText)

    const rules = extractRules(normalizedText)

    const marketCategory = classifyByMarket(normalizedText)
    const risk = classifyByRisk(normalizedText)
    extractKeywords(normalizedText)
    const summary = summarize(normalizedText)

    if (rules.riskLevel !== risk) {
      rules.riskLevel = rules.riskLevel === 'medium' ? risk : rules.riskLevel
    }

    const idea: TradingIdea = {
      id: uuidv4(),
      contentId: content.id,
      title: content.title,
      summary,
      rules: Object.keys(rules).length > 0 ? rules as TradingRules : null,
      marketCategory,
      confidence: strategy.confidence,
      source: content.source,
      sourceUrl: content.sourceUrl,
      discoveredAt: new Date().toISOString(),
      status: 'extracted',
    }

    return {
      idea,
      rejected: false,
    }
  } catch (error) {
    return {
      idea: null,
      rejected: true,
      reason: error instanceof Error ? error.message : 'Unknown extraction error',
    }
  }
}
