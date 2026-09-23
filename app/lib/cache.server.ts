import Redis from "ioredis";

/**
 * Read cache for the guest page.
 *
 * The whole point: a registry link goes out to 80 guests at once when the
 * invites land. That must be a cache read, not 80 Postgres queries against a
 * serverless database that may be cold.
 *
 * Keys are versioned — `registry:<id>:v<n>` — and Registry.version is bumped on
 * every write. So a purchase invalidates the page instantly without us having
 * to hunt down key names, and a stale key simply ages out.
 *
 * Without REDIS_URL this falls back to an in-process LRU. That is correct for
 * local dev and a single instance, and wrong the moment you run two — the
 * version-in-key scheme means a stale read is impossible, but each process
 * warms its own cache.
 */

export interface CacheDriver {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  /** Best-effort atomic counter, used for per-domain fetch rate limiting. */
  incrWithTtl(key: string, ttlSeconds: number): Promise<number>;
}

class MemoryCache implements CacheDriver {
  private store = new Map<string, { value: string; expiresAt: number }>();
  private max = 1000;

  private sweep() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) this.store.delete(key);
    }
    while (this.store.size > this.max) {
      const oldest = this.store.keys().next().value;
      if (oldest === undefined) break;
      this.store.delete(oldest);
    }
  }

  async get(key: string) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    // Refresh recency for the LRU eviction above.
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    this.sweep();
  }

  async del(key: string) {
    this.store.delete(key);
  }

  async incrWithTtl(key: string, ttlSeconds: number) {
    const current = Number((await this.get(key)) ?? 0) + 1;
    await this.set(key, String(current), ttlSeconds);
    return current;
  }
}

class RedisCache implements CacheDriver {
  constructor(private client: Redis) {}

  async get(key: string) {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number) {
    await this.client.set(key, value, "EX", ttlSeconds);
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async incrWithTtl(key: string, ttlSeconds: number) {
    const [[, count]] = (await this.client
      .multi()
      .incr(key)
      .expire(key, ttlSeconds)
      .exec()) as [[Error | null, number], ...unknown[]];
    return count;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __registroRedis: Redis | undefined;
  // eslint-disable-next-line no-var
  var __registroCache: CacheDriver | undefined;
}

export function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!global.__registroRedis) {
    global.__registroRedis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null, // BullMQ requires this
      enableReadyCheck: false,
    });
    global.__registroRedis.on("error", (err) => {
      console.error("[redis]", err.message);
    });
  }
  return global.__registroRedis;
}

export function cache(): CacheDriver {
  if (!global.__registroCache) {
    const redis = getRedis();
    global.__registroCache = redis ? new RedisCache(redis) : new MemoryCache();
    if (!redis && process.env.NODE_ENV === "production") {
      console.warn(
        "[cache] REDIS_URL is not set — using an in-process cache. This is not safe for multi-instance deployments.",
      );
    }
  }
  return global.__registroCache;
}

// ---------------------------------------------------------------------------
// Typed helpers
// ---------------------------------------------------------------------------

export function registryCacheKey(registryId: string, version: number, variant = "page"): string {
  return `registry:${registryId}:v${version}:${variant}`;
}

/**
 * Read-through cache. `compute` only runs on a miss.
 * A cache failure must never fail the request — we log and fall through.
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>,
): Promise<T> {
  const driver = cache();
  try {
    const hit = await driver.get(key);
    if (hit !== null) return JSON.parse(hit) as T;
  } catch (err) {
    console.error("[cache] read failed, falling through:", (err as Error).message);
  }

  const value = await compute();

  try {
    await driver.set(key, JSON.stringify(value), ttlSeconds);
  } catch (err) {
    console.error("[cache] write failed:", (err as Error).message);
  }

  return value;
}
