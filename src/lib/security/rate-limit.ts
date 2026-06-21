interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const CLEANUP_INTERVAL = 60_000

const timer = setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key)
    }
  }
}, CLEANUP_INTERVAL)

if (typeof timer === 'object' && 'unref' in timer) {
  timer.unref()
}

export function rateLimitByIp(
  ip: string,
  limit: number = 10,
  windowMs: number = 60_000
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const key = `ip:${ip}`
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  entry.count += 1

  if (entry.count > limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

export function getRemainingRequests(ip: string): number {
  const key = `ip:${ip}`
  const entry = store.get(key)
  if (!entry) return 0
  return Math.max(0, entry.count)
}

export function resetRateLimit(ip: string): void {
  store.delete(`ip:${ip}`)
}

export function clearAllRateLimits(): void {
  store.clear()
}
