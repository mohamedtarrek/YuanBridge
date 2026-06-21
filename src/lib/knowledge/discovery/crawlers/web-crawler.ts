import axios from 'axios'
import * as cheerio from 'cheerio'
import { v4 as uuidv4 } from 'uuid'
import type { SourceCrawler } from '../source-registry'
import type { CollectedContent, ContentSource, SourceConfig } from '@/lib/knowledge/types'

const TRADING_KEYWORDS = [
  'forex', 'trading', 'strategy', 'entry', 'stop loss', 'take profit',
  'risk management', 'position sizing', 'technical analysis', 'indicator',
  'support', 'resistance', 'trend', 'breakout', 'retracement', 'fibonacci',
  'moving average', 'rsi', 'macd', 'bollinger', 'elliott wave',
  'price action', 'candlestick', 'chart pattern', 'scalping', 'swing trading',
  'day trading', 'position trading', 'forex strategy', 'currency pair',
  'pip', 'spread', 'leverage', 'margin', 'risk reward',
]

function isTradingRelated(text: string): boolean {
  const lower = text.toLowerCase()
  return TRADING_KEYWORDS.some(kw => lower.includes(kw))
}

interface RobotsCache {
  [domain: string]: {
    disallowed: string[]
    crawlDelay: number
    fetchedAt: number
  }
}

const robotsCache: RobotsCache = {}

async function checkRobotsTxt(url: string): Promise<boolean> {
  try {
    const parsed = new URL(url)
    const domain = parsed.hostname
    const now = Date.now()

    if (robotsCache[domain] && now - robotsCache[domain].fetchedAt < 3600000) {
      const path = parsed.pathname
      return !robotsCache[domain].disallowed.some(d =>
        path.startsWith(d)
      )
    }

    const robotsUrl = `${parsed.protocol}//${domain}/robots.txt`
    const res = await axios.get(robotsUrl, { timeout: 5000 })
    const disallowed: string[] = []
    let crawlDelay = 0

    for (const line of res.data.split('\n')) {
      const trimmed = line.trim().toLowerCase()
      if (trimmed.startsWith('disallow:')) {
        const path = trimmed.slice(9).trim()
        if (path) disallowed.push(path)
      }
      if (trimmed.startsWith('crawl-delay:')) {
        crawlDelay = parseInt(trimmed.slice(12).trim(), 10) || 0
      }
    }

    robotsCache[domain] = { disallowed, crawlDelay, fetchedAt: now }

    const path = parsed.pathname
    return !disallowed.some(d => path.startsWith(d))
  } catch {
    return true
  }
}

function extractDate($: cheerio.CheerioAPI): string {
  const selectors = [
    'meta[property="article:published_time"]',
    'meta[name="date"]',
    'meta[name="pubdate"]',
    'time[datetime]',
    '[itemprop="datePublished"]',
    '.date',
    '.published',
    '.post-date',
    '.entry-date',
  ]

  for (const sel of selectors) {
    const el = $(sel)
    if (el.length) {
      const val = el.attr('content') || el.attr('datetime') || el.text().trim()
      if (val) return val
    }
  }
  return new Date().toISOString()
}

function extractAuthor($: cheerio.CheerioAPI): string | null {
  const selectors = [
    'meta[name="author"]',
    '[rel="author"]',
    '.author',
    '.byline',
    '.post-author',
    '[itemprop="author"]',
  ]

  for (const sel of selectors) {
    const el = $(sel)
    if (el.length) {
      const val = el.attr('content') || el.text().trim()
      if (val) return val
    }
  }
  return null
}

function extractKeywords($: cheerio.CheerioAPI): string[] {
  const keywords: string[] = []
  const metaKeywords = $('meta[name="keywords"]').attr('content')
  if (metaKeywords) {
    keywords.push(...metaKeywords.split(',').map(k => k.trim().toLowerCase()))
  }

  $('meta[property="article:tag"]').each((_, el) => {
    const content = $(el).attr('content')
    if (content) keywords.push(content.toLowerCase())
  })

  return [...new Set(keywords)]
}

function extractArticleContent($: cheerio.CheerioAPI): string {
  const contentSelectors = [
    'article',
    '[role="main"]',
    '.post-content',
    '.entry-content',
    '.article-body',
    '.content',
    '#content',
    'main',
  ]

  for (const sel of contentSelectors) {
    const el = $(sel)
    if (el.length) {
      const text = el.text().trim()
      if (text.length > 100) return text.slice(0, 10000)
    }
  }

  const bodyText = $('body').text().trim()
  return bodyText.slice(0, 10000)
}

function extractTitle($: cheerio.CheerioAPI): string {
  return $('title').text().trim() ||
    $('h1').first().text().trim() ||
    $('meta[property="og:title"]').attr('content')?.trim() ||
    'Untitled'
}

export function createWebCrawler(config: SourceConfig): SourceCrawler {
  return {
    name: config.name,
    type: 'web_page' as ContentSource,
    config,
    async crawl(): Promise<CollectedContent[]> {
      const items: CollectedContent[] = []
      const { crawlerConfig } = config

      for (const url of config.feeds) {
        try {
          if (crawlerConfig.respectRobotsTxt) {
            const allowed = await checkRobotsTxt(url)
            if (!allowed) continue
          }

          const res = await axios.get(url, {
            timeout: crawlerConfig.timeoutMs,
            headers: { 'User-Agent': crawlerConfig.userAgent },
          })

          const $ = cheerio.load(res.data)
          const title = extractTitle($)
          const content = extractArticleContent($)
          const author = extractAuthor($)
          const publishedAt = extractDate($)
          const keywords = extractKeywords($)
          const isTrading = isTradingRelated(title) || isTradingRelated(content)

          if (!isTrading) continue

          items.push({
            id: uuidv4(),
            source: 'web_page',
            sourceUrl: url,
            title,
            content: content.slice(0, 5000),
            author,
            publishedAt,
            collectedAt: new Date().toISOString(),
            status: 'pending',
            sourceType: 'web_page',
            engagement: { likes: 0, comments: 0, shares: 0, views: 0 },
            keywords,
            marketCategory: null,
          })

          await new Promise(r => setTimeout(r, crawlerConfig.requestDelayMs))
        } catch {
          continue
        }

        if (items.length >= crawlerConfig.maxItemsPerRun) break
      }

      if (items.length === 0) {
        return []
      }

      return items
    },
  }
}


