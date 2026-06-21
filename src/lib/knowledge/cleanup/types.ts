export interface CleanupResult {
  temporaryDataDeleted: number
  analysisFilesDeleted: number
  crawlerCacheCleared: number
  backtestHistoryDeleted: number
  logsDeleted: number
  duration: string
  timestamp: string
}
