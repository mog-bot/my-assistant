// Simple in-memory rate limiter for serverless
// In production, use Redis or similar
const rateLimitMap = new Map()

export function rateLimit(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now - record.windowStart > windowMs) {
    rateLimitMap.set(key, { windowStart: now, count: 1 })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count }
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitMap) {
    if (now - record.windowStart > 120000) {
      rateLimitMap.delete(key)
    }
  }
}, 60000)
