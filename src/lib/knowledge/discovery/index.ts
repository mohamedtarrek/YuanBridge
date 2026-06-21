import type { CollectedContent, DiscoveryConfig, ContentSource } from '@/lib/knowledge/types'
import { registerSource, getEnabledSources, clearSources } from './source-registry'
import { createDefaultCrawlers, isContentSource } from './crawlers'

const DEFAULT_CONFIG: DiscoveryConfig = {
  maxItemsPerSource: 10,
  runIntervalMinutes: 60,
  enabledSources: ['web_page', 'reddit', 'youtube', 'github', 'rss_feed'],
  crawlerConfigs: {},
}

const crawledUrls = new Set<string>()

export function resetDeduplicationCache(): void {
  crawledUrls.clear()
}

function isDuplicate(url: string): boolean {
  if (crawledUrls.has(url)) return true
  crawledUrls.add(url)
  return false
}

function initializeSources(config: DiscoveryConfig): void {
  clearSources()
  const crawlers = createDefaultCrawlers()

  for (const crawler of crawlers) {
    const isEnabled = config.enabledSources.length === 0 ||
      config.enabledSources.includes(crawler.type)

    if (isEnabled) {
      const typeOverride = config.crawlerConfigs[crawler.type]
      if (typeOverride) {
        Object.assign(crawler.config.crawlerConfig, typeOverride)
      }
      registerSource(crawler.type, crawler)
    }
  }
}

export async function runDiscoveryCycle(
  config: DiscoveryConfig = DEFAULT_CONFIG
): Promise<CollectedContent[]> {
  const allNewContent: CollectedContent[] = []

  initializeSources(config)
  const sources = getEnabledSources()

  if (sources.length === 0) {
    return allNewContent
  }

  const results = await Promise.allSettled(
    sources.map(async (source) => {
      try {
        const items = await source.crawl()
        return { source: source.type, items }
      } catch (err) {
        console.warn('[Discovery] Crawler failed for source', source.type, err)
        return { source: source.type, items: [] as CollectedContent[] }
      }
    })
  )

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { items } = result.value

      for (const item of items) {
        if (!isDuplicate(item.sourceUrl)) {
          allNewContent.push(item)

          if (allNewContent.length >= config.maxItemsPerSource * sources.length) {
            break
          }
        }
      }
    }
  }

  return allNewContent
}

export async function runSingleSource(
  type: ContentSource,
  config?: Partial<DiscoveryConfig>
): Promise<CollectedContent[]> {
  const sources = getEnabledSources()
  const source = sources.find(s => s.type === type)

  if (!source) {
    return []
  }

  try {
    const items = await source.crawl()
    return items.filter(item => !isDuplicate(item.sourceUrl))
  } catch (err) {
    console.warn('[Discovery] Single source crawl failed for', source?.type, err)
    return []
  }
}

export async function validateSources(
  config: DiscoveryConfig = DEFAULT_CONFIG
): Promise<{ type: ContentSource; name: string; reachable: boolean; error?: string }[]> {
  initializeSources(config)
  const results: { type: ContentSource; name: string; reachable: boolean; error?: string }[] = []
  const sources = getEnabledSources()

  for (const source of sources) {
    try {
      const items = await source.crawl()
      results.push({
        type: source.type,
        name: source.name,
        reachable: true,
      })
    } catch (err) {
      results.push({
        type: source.type,
        name: source.name,
        reachable: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  return results
}

export function getDiscoveryStats(): {
  totalCrawledUrls: number
  enabledSources: number
} {
  return {
    totalCrawledUrls: crawledUrls.size,
    enabledSources: getEnabledSources().length,
  }
}

export { isContentSource } from './crawlers'
export type { SourceCrawler } from './source-registry'
export {
  registerSource,
  getEnabledSources,
  clearSources,
} from './source-registry'
export {
  createDefaultCrawlers,
  DEFAULT_SOURCES_CONFIG,
} from './crawlers'
