import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "shiftintel",
});

export const aiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "shiftintel:ai",
});

export async function checkRateLimit(identifier: string, isAI = false) {
  const limiter = isAI ? aiRateLimiter : rateLimiter;
  const { success, limit, reset, remaining } = await limiter.limit(identifier);
  return { success, limit, reset, remaining };
}