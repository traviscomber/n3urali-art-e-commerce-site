import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let ratelimit: Ratelimit | null = null

function getRateLimit() {
  if (ratelimit) return ratelimit

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return null

  const redis = new Redis({ url, token })

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'ratelimit',
  })

  return ratelimit
}

export async function checkRateLimit(identifier: string) {
  const limiter = getRateLimit()

  if (!limiter) {
    return { success: true, limit: 100, remaining: 99, reset: Date.now() + 60000 }
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier)
    return { success, limit, remaining, reset }
  } catch {
    // Fail open if Redis is temporarily unavailable.
    return { success: true, limit: 100, remaining: 99, reset: Date.now() + 60000 }
  }
}
