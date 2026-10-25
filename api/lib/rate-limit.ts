// api/lib/rate-limit.ts
// In-memory fixed-window rate limiter for abuse-prone public endpoints.
// Keyed by client IP (x-forwarded-for behind the platform proxy, else
// x-real-ip). Single-process scope is intentional: the deployment runs one
// node; swap the Map for Redis if that ever changes.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Opportunistic sweep so the Map cannot grow without bound.
function sweep(now: number) {
  if (buckets.size < 10_000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Returns true when the caller is WITHIN the allowance; false when limited.
 * @param key    logical bucket, e.g. "joinWaitlist:203.0.113.9"
 * @param limit  max requests per window
 * @param windowMs  window length
 */
export function allowRequest(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

export const RATE_LIMITS = {
  joinWaitlist: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 / hour / IP
  sendContact: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 / hour / IP
} as const;
