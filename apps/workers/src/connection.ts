import Redis from "ioredis";

export function getWorkerRedisConnection(): Redis | { host: string; port: number } {
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
  };
}
