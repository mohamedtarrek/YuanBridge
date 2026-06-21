import type { ContentSource, SourceConfig, CollectedContent } from '@/lib/knowledge/types'

export interface SourceCrawler {
  name: string
  type: ContentSource
  config: SourceConfig
  crawl(): Promise<CollectedContent[]>
}

const registeredSources = new Map<ContentSource, SourceCrawler>()

export function registerSource(type: ContentSource, crawler: SourceCrawler): void {
  registeredSources.set(type, crawler)
}

export function getSource(type: ContentSource): SourceCrawler | undefined {
  return registeredSources.get(type)
}

export function getAllSources(): SourceCrawler[] {
  return Array.from(registeredSources.values())
}

export function getEnabledSources(): SourceCrawler[] {
  return getAllSources().filter(s => s.config.crawlerConfig.enabled)
}

export function deregisterSource(type: ContentSource): boolean {
  return registeredSources.delete(type)
}

export function isSourceRegistered(type: ContentSource): boolean {
  return registeredSources.has(type)
}

export function clearSources(): void {
  registeredSources.clear()
}
