// Simple in-memory rate limiter for serverless
// Entries auto-expire on check — no background cleanup needed
const rateLimitMap = new Map()

export function rateLimit(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  // Clean expired entry
  if (record && now - record.windowStart > windowMs) {
    rateLimitMap.delete(key)
  }

  const current = rateLimitMap.get(key)

  if (!current) {
    rateLimitMap.set(key, { windowStart: now, count: 1 })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  current.count++
  return { allowed: true, remaining: maxRequests - current.count }
}
