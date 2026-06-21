import Parser from 'rss-parser'
import { v4 as uuidv4 } from 'uuid'
import type { SourceCrawler } from '../source-registry'
import type { CollectedContent, ContentSource, SourceConfig } from '@/lib/knowledge/types'

const DEFAULT_FEEDS = [
  'https://www.forexfactory.com/news.xml',
  'https://www.dailyfx.com/feeds/rss',
  'https://www.babypips.com/feed',
  'https://feeds.feedburner.com/investingcom_news',
  'https://www.forexlive.com/feed',
  'https://www.actionforex.com/feed',
]

const TRADING_KEYWORDS = [
  'forex', 'trading', 'strategy', 'entry', 'exit', 'setup', 'signal',
  'technical analysis', 'fundamental analysis', 'currency', 'pip',
  'forex forecast', 'market analysis', 'trade idea',
]

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'YuanBridge/1.0 (Knowledge Discovery Engine)',
  },
  customFields: {
    item: ['dc:creator', 'media:content'],
  },
})

function isTradingRelated(title: string, content: string): boolean {
  const combined = `${title} ${content}`.toLowerCase()
  const matchCount = TRADING_KEYWORDS.filter(kw => combined.includes(kw)).length
  return matchCount >= 2
}

function extractKeywords(title: string, content: string): string[] {
  const combined = `${title} ${content}`.toLowerCase()
  return TRADING_KEYWORDS.filter(kw => combined.includes(kw))
}

function detectMarketCategory(title: string, content: string): 'forex' | 'crypto' | 'stocks' | 'commodities' | 'indices' | null {
  const combined = `${title} ${content}`.toLowerCase()
  if (combined.includes('forex') || /eur|gbp|jpy|chf|cad|aud|nzd/.test(combined)) return 'forex'
  if (combined.includes('crypto') || combined.includes('bitcoin') || combined.includes('btc') || combined.includes('ethereum')) return 'crypto'
  if (combined.includes('stock') || combined.includes('equity') || combined.includes('s&p') || combined.includes('nasdaq')) return 'stocks'
  if (combined.includes('gold') || combined.includes('silver') || combined.includes('oil') || combined.includes('copper')) return 'commodities'
  if (combined.includes('index') || combined.includes('dow') || combined.includes('ftse') || combined.includes('dax')) return 'indices'
  return null
}

export function createRssCrawler(config: SourceConfig): SourceCrawler {
  return {
    name: config.name,
    type: 'rss_feed' as ContentSource,
    config,
    async crawl(): Promise<CollectedContent[]> {
      const items: CollectedContent[] = []
      const feeds = config.feeds.length > 0 ? config.feeds : DEFAULT_FEEDS

      for (const feedUrl of feeds) {
        try {
          const feed = await parser.parseURL(feedUrl)

          for (const entry of feed.items || []) {
            const title = entry.title || ''
            const content = entry.contentSnippet || entry.content || ''
            const author = entry.creator || entry['dc:creator']?.trim() || null
            const publishedAt = entry.pubDate || entry.isoDate || new Date().toISOString()

            if (!isTradingRelated(title, content)) continue

            items.push({
              id: uuidv4(),
              source: 'rss_feed',
              sourceUrl: entry.link || feedUrl,
              title,
              content: content.slice(0, 5000),
              author,
              publishedAt: new Date(publishedAt).toISOString(),
              collectedAt: new Date().toISOString(),
              status: 'pending',
              sourceType: 'rss_article',
              engagement: { likes: 0, comments: 0, shares: 0, views: 0 },
              keywords: extractKeywords(title, content),
              marketCategory: detectMarketCategory(title, content),
            })
          }

          await new Promise(r => setTimeout(r, config.crawlerConfig.requestDelayMs))
        } catch (err) {
          console.warn('[RssCrawler] Item processing failed', err)
          continue
        }

        if (items.length >= config.crawlerConfig.maxItemsPerRun) break
      }

      if (items.length === 0) {
        return []
      }

      return items
    },
  }
}


