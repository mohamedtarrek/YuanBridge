import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import type { SourceCrawler } from '../source-registry'
import type { CollectedContent, ContentSource, SourceConfig } from '@/lib/knowledge/types'

const DEFAULT_SUBREDDITS = [
  'Forex',
  'Trading',
  'Forexstrategy',
  'Daytrading',
  'algotrading',
  'swingtrading',
]

const STRATEGY_KEYWORDS = [
  'strategy', 'entry', 'exit', 'stop loss', 'take profit', 'tp', 'sl',
  'setup', 'signal', 'backtest', 'forward test', 'win rate', 'profit factor',
  'risk reward', 'rr', 'indicator', 'breakout', 'retest', 'pattern',
]

function isStrategyPost(title: string, text: string): boolean {
  const combined = `${title} ${text}`.toLowerCase()
  let matchCount = 0
  for (const kw of STRATEGY_KEYWORDS) {
    if (combined.includes(kw)) matchCount++
  }
  return matchCount >= 2
}

interface RedditPost {
  data: {
    id: string
    title: string
    selftext: string
    author: string
    created_utc: number
    url: string
    subreddit: string
    num_comments: number
    ups: number
    score: number
    over_18: boolean
  }
}

interface RedditResponse {
  data: {
    children: RedditPost[]
  }
}

async function fetchSubredditPosts(
  subreddit: string,
  sort: 'hot' | 'new' | 'top' = 'new',
  limit: number = 25
): Promise<RedditPost[]> {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}`
    const res = await axios.get<RedditResponse>(url, {
      headers: {
        'User-Agent': 'YuanBridge/1.0 (Knowledge Discovery Engine)',
      },
      timeout: 10000,
    })

    return res.data.data.children.filter(p => !p.data.over_18)
  } catch {
    return []
  }
}

export function createRedditCrawler(config: SourceConfig): SourceCrawler {
  return {
    name: config.name,
    type: 'reddit' as ContentSource,
    config,
    async crawl(): Promise<CollectedContent[]> {
      const items: CollectedContent[] = []
      const subreddits = config.feeds.length > 0
        ? config.feeds.map(f => f.replace('r/', '').replace('/hot', '').replace('/new', '').replace('/top', '').trim())
        : DEFAULT_SUBREDDITS

      for (const subreddit of subreddits) {
        try {
          const posts = await fetchSubredditPosts(subreddit, 'new', 25)

          for (const post of posts) {
            if (!isStrategyPost(post.data.title, post.data.selftext)) continue

            items.push({
              id: uuidv4(),
              source: 'reddit',
              sourceUrl: `https://www.reddit.com${post.data.url}`,
              title: post.data.title,
              content: post.data.selftext.slice(0, 5000),
              author: post.data.author,
              publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
              collectedAt: new Date().toISOString(),
              status: 'pending',
              sourceType: 'reddit_post',
              engagement: {
                likes: post.data.ups,
                comments: post.data.num_comments,
                shares: 0,
                views: 0,
              },
              keywords: [subreddit.toLowerCase(), ...extractKeywords(post.data.title, post.data.selftext)],
              marketCategory: detectMarketCategory(post.data.title, post.data.selftext),
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

function extractKeywords(title: string, text: string): string[] {
  const combined = `${title} ${text}`.toLowerCase()
  const kw = [
    'forex', 'crypto', 'stocks', 'commodities', 'indices',
    'eur/usd', 'gbp/usd', 'btc', 'gold', 'oil',
  ]
  return kw.filter(k => combined.includes(k))
}

function detectMarketCategory(title: string, text: string): 'forex' | 'crypto' | 'stocks' | 'commodities' | 'indices' | null {
  const combined = `${title} ${text}`.toLowerCase()
  if (combined.includes('forex') || combined.includes('eur/') || combined.includes('gbp/') || combined.includes('usd/')) return 'forex'
  if (combined.includes('crypto') || combined.includes('btc') || combined.includes('eth')) return 'crypto'
  if (combined.includes('stock') || combined.includes('equity')) return 'stocks'
  if (combined.includes('gold') || combined.includes('silver') || combined.includes('oil') || combined.includes('commodity')) return 'commodities'
  if (combined.includes('index') || combined.includes('spy') || combined.includes('spx')) return 'indices'
  return null
}


