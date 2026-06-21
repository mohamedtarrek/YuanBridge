import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import type { SourceCrawler } from '../source-registry'
import type { CollectedContent, ContentSource, SourceConfig } from '@/lib/knowledge/types'

const TRADING_SEARCH_QUERIES = [
  'forex trading strategy',
  'forex entry setup',
  'trading strategy backtest',
  'price action strategy',
  'forex indicator strategy',
]

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

interface YouTubeSearchItem {
  id: { videoId: string }
  snippet: {
    title: string
    description: string
    channelTitle: string
    publishedAt: string
    tags?: string[]
  }
}

interface YouTubeSearchResponse {
  items: YouTubeSearchItem[]
}

interface YouTubeVideoDetails {
  items: {
    statistics: {
      likeCount: string
      commentCount: string
      viewCount: string
    }
  }[]
}

async function searchVideos(apiKey: string, query: string, maxResults: number = 10): Promise<YouTubeSearchItem[]> {
  try {
    const res = await axios.get<YouTubeSearchResponse>(`${YOUTUBE_API_BASE}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults,
        relevanceLanguage: 'en',
        key: apiKey,
      },
      timeout: 10000,
    })
    return res.data.items || []
  } catch (err) {
    console.warn('[YouTubeCrawler] searchVideos failed', err)
    return []
  }
}

async function getVideoDetails(apiKey: string, videoId: string): Promise<YouTubeVideoDetails['items'][0] | null> {
  try {
    const res = await axios.get<YouTubeVideoDetails>(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'statistics',
        id: videoId,
        key: apiKey,
      },
      timeout: 10000,
    })
    return res.data.items?.[0] || null
  } catch (err) {
    console.warn('[YouTubeCrawler] getVideoDetails failed', err)
    return null
  }
}

async function fetchCaptions(apiKey: string, videoId: string): Promise<string | null> {
  try {
    const res = await axios.get(`${YOUTUBE_API_BASE}/captions`, {
      params: {
        part: 'snippet',
        videoId,
        key: apiKey,
      },
      timeout: 10000,
    })

    const captionId = res.data.items?.[0]?.id
    if (!captionId) return null

    const captionRes = await axios.get(`${YOUTUBE_API_BASE}/captions/${captionId}`, {
      params: {
        key: apiKey,
        tfmt: 'srt',
      },
      timeout: 10000,
      responseType: 'text',
    })

    return typeof captionRes.data === 'string' ? captionRes.data.slice(0, 5000) : null
  } catch (err) {
    console.warn('[YouTubeCrawler] fetchCaptions failed', err)
    return null
  }
}

function extractKeywordsFromVideo(title: string, description: string, tags?: string[]): string[] {
  const keywords: string[] = []
  const combined = `${title} ${description}`.toLowerCase()

  const tradingKw = ['forex', 'crypto', 'stocks', 'trading', 'strategy', 'entry', 'exit', 'setup']
  keywords.push(...tradingKw.filter(k => combined.includes(k)))

  if (tags) keywords.push(...tags.map(t => t.toLowerCase()))

  return [...new Set(keywords)]
}

export function createYoutubeCrawler(config: SourceConfig): SourceCrawler {
  return {
    name: config.name,
    type: 'youtube' as ContentSource,
    config,
    async crawl(): Promise<CollectedContent[]> {
      const items: CollectedContent[] = []
      const apiKey = config.credentials?.apiKey

      if (!apiKey) {
        return []
      }

      for (const query of TRADING_SEARCH_QUERIES) {
        try {
          const videos = await searchVideos(apiKey, query, 10)

          for (const video of videos) {
            const snippet = video.snippet
            const videoId = video.id.videoId
            const stats = await getVideoDetails(apiKey, videoId)

            let content = `${snippet.title}\n\n${snippet.description}`
            const captions = await fetchCaptions(apiKey, videoId)
            if (captions) content += `\n\n${captions}`

            items.push({
              id: uuidv4(),
              source: 'youtube',
              sourceUrl: `https://youtube.com/watch?v=${videoId}`,
              title: snippet.title,
              content: content.slice(0, 5000),
              author: snippet.channelTitle,
              publishedAt: snippet.publishedAt,
              collectedAt: new Date().toISOString(),
              status: 'pending',
              sourceType: 'youtube_video',
              engagement: {
                likes: stats ? parseInt(stats.statistics.likeCount) || 0 : 0,
                comments: stats ? parseInt(stats.statistics.commentCount) || 0 : 0,
                shares: 0,
                views: stats ? parseInt(stats.statistics.viewCount) || 0 : 0,
              },
              keywords: extractKeywordsFromVideo(snippet.title, snippet.description, snippet.tags),
              marketCategory: null,
            })
          }

          await new Promise(r => setTimeout(r, config.crawlerConfig.requestDelayMs))
        } catch (err) {
          console.warn('[YouTubeCrawler] crawl query failed', err)
          continue
        }

        if (items.length >= config.crawlerConfig.maxItemsPerRun) break
      }

      return items.length > 0 ? items : []
    },
  }
}


