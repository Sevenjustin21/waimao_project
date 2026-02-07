type MemoryEntry = {
  count: number;
  expiresAt: number;
};

type MemoryStore = Map<string, MemoryEntry>;

interface RateLimiterConfig {
  windowMs: number;
  limit: number;
  identifier?: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __waimaoRateLimitStores: Map<string, MemoryStore> | undefined;
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const globalStores =
  globalThis.__waimaoRateLimitStores ??
  (globalThis.__waimaoRateLimitStores = new Map<string, MemoryStore>());

function getMemoryStore(bucket: string): MemoryStore {
  if (!globalStores.has(bucket)) {
    globalStores.set(bucket, new Map());
  }
  return globalStores.get(bucket)!;
}

function hitMemoryStore(
  storeKey: string,
  identifier: string,
  windowMs: number,
  limit: number,
) {
  const store = getMemoryStore(storeKey);
  const now = Date.now();
  const existing = store.get(identifier);

  if (!existing || existing.expiresAt <= now) {
    store.set(identifier, {
      count: 1,
      expiresAt: now + windowMs,
    });
    return {
      success: true,
      remaining: Math.max(0, limit - 1),
      reset: windowMs,
      limit,
    };
  }

  existing.count += 1;
  const success = existing.count <= limit;

  return {
    success,
    remaining: success ? Math.max(0, limit - existing.count) : 0,
    reset: Math.max(0, existing.expiresAt - now),
    limit,
  };
}

async function hitRedis(
  bucketKey: string,
  identifier: string,
  windowMs: number,
  limit: number,
): Promise<RateLimitResult | null> {
  if (!redisUrl || !redisToken) {
    return null;
  }

  const key = `rl:${bucketKey}:${identifier}`;
  const payload = JSON.stringify([
    ['INCR', key],
    ['EXPIRE', key, Math.ceil(windowMs / 1000).toString(), 'NX'],
    ['PTTL', key],
  ]);

  try {
    const response = await fetch(`${redisUrl}/pipeline`, {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${redisToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Redis pipeline failed with status ${response.status}`);
    }

    const results = (await response.json()) as Array<{ result: number }>;
    const currentCount = Number(results?.[0]?.result ?? 0);
    const ttl = Number(results?.[2]?.result ?? windowMs);

    const success = currentCount <= limit;
    const reset = ttl > 0 ? ttl : windowMs;

    return {
      success,
      remaining: success ? Math.max(0, limit - currentCount) : 0,
      reset,
      limit,
    };
  } catch (error) {
    console.error('[rate-limit] Redis request failed, falling back to memory store:', error);
    return null;
  }
}

export function createRateLimiter(config: RateLimiterConfig) {
  const { windowMs, limit, identifier = 'default' } = config;
  const bucketKey = `${identifier}:${windowMs}:${limit}`;
  const canUseRedis = Boolean(redisUrl && redisToken);

  return {
    async check(key: string): Promise<RateLimitResult> {
      if (canUseRedis) {
        const redisResult = await hitRedis(bucketKey, key, windowMs, limit);
        if (redisResult) {
          return redisResult;
        }
      }

      return hitMemoryStore(bucketKey, key, windowMs, limit);
    },
  };
}

export const hasDistributedRateLimit = Boolean(redisUrl && redisToken);

export {};
