import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import type { SourceCrawler } from '../source-registry'
import type { CollectedContent, ContentSource, SourceConfig } from '@/lib/knowledge/types'

const SEARCH_TOPICS = [
  'forex-strategy',
  'trading-bot',
  'algorithmic-trading',
  'forex-trading',
  'trading-strategy',
]

const GITHUB_API_BASE = 'https://api.github.com'

interface GitHubRepo {
  id: number
  full_name: string
  description: string | null
  html_url: string
  owner: { login: string }
  topics: string[]
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  created_at: string
  updated_at: string
  language: string | null
}

interface SearchResponse {
  items: GitHubRepo[]
}

async function searchRepositories(topic: string, perPage: number = 10): Promise<GitHubRepo[]> {
  try {
    const res = await axios.get<SearchResponse>(`${GITHUB_API_BASE}/search/repositories`, {
      params: {
        q: `topic:${topic}`,
        sort: 'stars',
        order: 'desc',
        per_page: perPage,
      },
      headers: {
        Accept: 'application/vnd.github.mercy-preview+json',
        'User-Agent': 'YuanBridge/1.0',
      },
      timeout: 10000,
    })
    return res.data.items || []
  } catch {
    return []
  }
}

async function fetchReadme(fullName: string): Promise<string | null> {
  try {
    const res = await axios.get(`${GITHUB_API_BASE}/repos/${fullName}/readme`, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
        'User-Agent': 'YuanBridge/1.0',
      },
      timeout: 10000,
    })
    return typeof res.data === 'string' ? res.data.slice(0, 10000) : null
  } catch {
    return null
  }
}

function extractStrategyContent(readme: string): string {
  const relevantSections: string[] = []
  const lines = readme.split('\n')
  let currentSection = ''
  let inRelevantSection = false

  const sectionHeaders = [
    'strategy', 'entry', 'exit', 'signal', 'backtest', 'indicator',
    'algorithm', 'rules', 'conditions', 'setup', 'risk management',
  ]

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('#') || trimmed.startsWith('##') || trimmed.startsWith('###')) {
      if (inRelevantSection && currentSection.length > 50) {
        relevantSections.push(currentSection.trim())
      }
      const headerText = trimmed.replace(/^#+\s*/, '').toLowerCase()
      inRelevantSection = sectionHeaders.some(h => headerText.includes(h))
      currentSection = trimmed + '\n'
    } else if (inRelevantSection) {
      currentSection += trimmed + '\n'
    }
  }

  if (inRelevantSection && currentSection.length > 50) {
    relevantSections.push(currentSection.trim())
  }

  return relevantSections.join('\n\n').slice(0, 5000)
}

function extractKeywords(repo: GitHubRepo, readme: string | null): string[] {
  const keywords = [...repo.topics]
  const combined = `${repo.description || ''} ${readme || ''}`.toLowerCase()

  const tradingKw = ['forex', 'crypto', 'trading', 'strategy', 'bot', 'algorithm']
  keywords.push(...tradingKw.filter(k => combined.includes(k)))

  return [...new Set(keywords)]
}

export function createGithubCrawler(config: SourceConfig): SourceCrawler {
  return {
    name: config.name,
    type: 'github' as ContentSource,
    config,
    async crawl(): Promise<CollectedContent[]> {
      const items: CollectedContent[] = []
      const topics = config.feeds.length > 0 ? config.feeds : SEARCH_TOPICS

      for (const topic of topics) {
        try {
          const repos = await searchRepositories(topic)

          for (const repo of repos) {
            if (!repo.description && !repo.topics.includes('forex-strategy')) continue

            const readme = await fetchReadme(repo.full_name)
            const content = readme
              ? extractStrategyContent(readme)
              : (repo.description || '')

            if (!content || content.length < 50) continue

            items.push({
              id: uuidv4(),
              source: 'github',
              sourceUrl: repo.html_url,
              title: repo.full_name,
              content: content.slice(0, 5000),
              author: repo.owner.login,
              publishedAt: repo.created_at,
              collectedAt: new Date().toISOString(),
              status: 'pending',
              sourceType: 'github_repo',
              engagement: {
                likes: repo.stargazers_count,
                comments: repo.open_issues_count,
                shares: repo.forks_count,
                views: 0,
              },
              keywords: extractKeywords(repo, readme),
              marketCategory: null,
            })
          }

          await new Promise(r => setTimeout(r, config.crawlerConfig.requestDelayMs))
        } catch {
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


