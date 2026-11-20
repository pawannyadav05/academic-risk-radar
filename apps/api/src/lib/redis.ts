import Redis from "ioredis";

/**
 * Creates a resilient Redis connection supporting both local Docker
 * and cloud TLS endpoints (such as Upstash Redis).
 */
export function getApiRedisConnection(): Redis | { host: string; port: number; maxRetriesPerRequest: null; lazyConnect: boolean } {
  if (process.env.REDIS_URL) {
    const isTls = process.env.REDIS_URL.startsWith("rediss://");
    return new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      tls: isTls ? { rejectUnauthorized: false } : undefined,
    });
  }

  return {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    maxRetriesPerRequest: null,
    lazyConnect: true,
  };
}
