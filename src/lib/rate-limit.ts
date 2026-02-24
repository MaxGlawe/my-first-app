/**
 * Simple in-memory rate limiter for the single-server deployment.
 * Tracks request counts per key within a time window.
 */
const store = new Map<string, { count: number; resetAt: number }>()

// Clean up stale entries every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key)
    }
  }, 600_000)
}

export function isRateLimited(
  key: string,
  maxRequests = 5,
  windowMs = 3_600_000 // 1 hour
): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  entry.count++
  return entry.count > maxRequests
}
