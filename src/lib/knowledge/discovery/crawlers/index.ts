import type { SourceConfig, ContentSource, CrawlerConfig } from '@/lib/knowledge/types'
import type { SourceCrawler } from '../source-registry'
import { createWebCrawler } from './web-crawler'
import { createRedditCrawler } from './reddit-crawler'
import { createYoutubeCrawler } from './youtube-crawler'
import { createGithubCrawler } from './github-crawler'
import { createRssCrawler } from './rss-crawler'

export { createWebCrawler } from './web-crawler'
export { createRedditCrawler } from './reddit-crawler'
export { createYoutubeCrawler } from './youtube-crawler'
export { createGithubCrawler } from './github-crawler'
export { createRssCrawler } from './rss-crawler'

const DEFAULT_CRAWLER_CONFIG: CrawlerConfig = {
  enabled: true,
  intervalMinutes: 60,
  maxItemsPerRun: 10,
  userAgent: 'YuanBridge/1.0 (Knowledge Discovery Engine; +https://yuanbridge.com)',
  respectRobotsTxt: true,
  requestDelayMs: 2000,
  timeoutMs: 15000,
}

export const DEFAULT_SOURCES_CONFIG: SourceConfig[] = [
  {
    type: 'web_page',
    name: 'Trading Blogs & News',
    feeds: [
      'https://www.babypips.com',
      'https://www.dailyfx.com',
      'https://www.forexfactory.com',
      'https://www.investing.com',
      'https://www.forexlive.com',
    ],
    crawlerConfig: { ...DEFAULT_CRAWLER_CONFIG, intervalMinutes: 120 },
  },
  {
    type: 'reddit',
    name: 'Reddit Trading Communities',
    feeds: [
      'r/Forex',
      'r/Trading',
      'r/Forexstrategy',
      'r/Daytrading',
    ],
    crawlerConfig: { ...DEFAULT_CRAWLER_CONFIG, intervalMinutes: 30, maxItemsPerRun: 15 },
  },
  {
    type: 'youtube',
    name: 'YouTube Trading Channels',
    feeds: [],
    crawlerConfig: { ...DEFAULT_CRAWLER_CONFIG, intervalMinutes: 120 },
    credentials: {
      apiKey: process.env.YOUTUBE_API_KEY || '',
    },
  },
  {
    type: 'github',
    name: 'GitHub Trading Repositories',
    feeds: [
      'forex-strategy',
      'trading-bot',
      'algorithmic-trading',
    ],
    crawlerConfig: { ...DEFAULT_CRAWLER_CONFIG, intervalMinutes: 180, maxItemsPerRun: 8 },
  },
  {
    type: 'rss_feed',
    name: 'RSS Trading Feeds',
    feeds: [
      'https://www.forexfactory.com/news.xml',
      'https://www.dailyfx.com/feeds/rss',
      'https://www.babypips.com/feed',
    ],
    crawlerConfig: { ...DEFAULT_CRAWLER_CONFIG, intervalMinutes: 60 },
  },
]

export function createDefaultCrawlers(): SourceCrawler[] {
  return DEFAULT_SOURCES_CONFIG.map(config => createCrawlerFromConfig(config)).filter(Boolean) as SourceCrawler[]
}

export function createCrawlerFromConfig(config: SourceConfig): SourceCrawler | null {
  switch (config.type) {
    case 'web_page':
      return createWebCrawler(config)
    case 'reddit':
      return createRedditCrawler(config)
    case 'youtube':
      return createYoutubeCrawler(config)
    case 'github':
      return createGithubCrawler(config)
    case 'rss_feed':
      return createRssCrawler(config)
    default:
      return null
  }
}

export function isContentSource(value: string): value is ContentSource {
  const validSources: ContentSource[] = [
    'web_page', 'reddit', 'youtube', 'github', 'rss_feed',
    'twitter', 'telegram', 'discord', 'tradingview', 'forum',
  ]
  return validSources.includes(value as ContentSource)
}

export function isWebSource(type: ContentSource): boolean {
  return type === 'web_page'
}

export function isSocialSource(type: ContentSource): boolean {
  return ['reddit', 'twitter', 'telegram', 'discord'].includes(type)
}

export function isApiSource(type: ContentSource): boolean {
  return ['youtube', 'github', 'tradingview'].includes(type)
}
