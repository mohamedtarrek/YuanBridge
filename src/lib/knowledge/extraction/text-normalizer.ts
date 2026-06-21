import type { CollectedContent } from '@/lib/knowledge/types'

const UNICODE_NORMALIZATION_MAP: Record<string, string> = {
  '\u2018': "'",
  '\u2019': "'",
  '\u201C': '"',
  '\u201D': '"',
  '\u2013': '-',
  '\u2014': '-',
  '\u2026': '...',
  '\u00A0': ' ',
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'by', 'with', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need',
  'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their',
  'we', 'us', 'our', 'you', 'your', 'he', 'she', 'him', 'her', 'his',
  'not', 'no', 'nor', 'so', 'if', 'then', 'than', 'too', 'very', 'just',
  'about', 'above', 'after', 'again', 'all', 'also', 'any', 'because',
  'before', 'between', 'both', 'each', 'few', 'more', 'most', 'other',
  'some', 'such', 'only', 'own', 'same', 'into', 'over', 'under', 'up',
  'out', 'off', 'down', 'here', 'there', 'when', 'where', 'why', 'how',
  'what', 'which', 'who', 'whom', 'while', 'during', 'through', 'until',
  'against', 'within', 'without', 'along', 'around', 'among',
])

export function normalizeText(text: string): string {
  let result = text

  for (const [char, replacement] of Object.entries(UNICODE_NORMALIZATION_MAP)) {
    result = result.replace(new RegExp(char, 'g'), replacement)
  }

  result = result.replace(/[\u0300-\u036f]/g, '')

  result = result.replace(/\r\n/g, '\n')
  result = result.replace(/\r/g, '\n')

  result = result.replace(/\n{3,}/g, '\n\n')

  result = result.replace(/[ \t]+/g, ' ')

  result = result.replace(/^\s+|\s+$/gm, '')

  result = result.replace(/\n+/g, ' ')

  result = result.replace(/^\s+|\s+$/g, '')

  return result
}

export function removeHtml(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, (m) => String.fromCodePoint(Number.parseInt(m.slice(2, -1), 10)))
    .replace(/&[a-zA-Z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractKeywords(text: string, topN: number = 10): string[] {
  const normalized = normalizeText(text).toLowerCase()

  const words = normalized.split(/\W+/).filter((w) => w.length > 2)

  const frequency = new Map<string, number>()
  for (const word of words) {
    if (STOP_WORDS.has(word)) continue
    if (/^\d+$/.test(word)) continue
    frequency.set(word, (frequency.get(word) ?? 0) + 1)
  }

  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word)
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
  )
}

export function calculateSimilarity(a: string, b: string): number {
  const tokensA = tokenize(a)
  const tokensB = tokenize(b)

  if (tokensA.size === 0 && tokensB.size === 0) return 1
  if (tokensA.size === 0 || tokensB.size === 0) return 0

  const intersection = new Set([...tokensA].filter((x) => tokensB.has(x)))
  const union = new Set([...tokensA, ...tokensB])

  return intersection.size / union.size
}

export function isDuplicate(
  content: CollectedContent,
  existing: CollectedContent[],
  threshold: number = 0.7,
): boolean {
  for (const existingContent of existing) {
    if (existingContent.id === content.id) continue

    if (content.sourceUrl && existingContent.sourceUrl && content.sourceUrl === existingContent.sourceUrl) {
      return true
    }

    if (calculateSimilarity(content.content, existingContent.content) >= threshold) {
      return true
    }
  }

  return false
}

export function summarize(text: string, maxLength: number = 200): string {
  const cleaned = normalizeText(text)

  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) ?? [cleaned]

  let summary = ''
  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    if (summary.length + trimmed.length > maxLength) break
    summary += (summary ? ' ' : '') + trimmed
  }

  if (!summary) {
    summary = cleaned.slice(0, maxLength).replace(/\s+\S*$/, '')
  }

  return summary.trim()
}
