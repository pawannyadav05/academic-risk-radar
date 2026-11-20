import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { authenticateUser } from "./auth/rbac.middleware.js";

import authRouter from "./auth/auth.routes.js";
import ingestionRouter from "./modules/ingestion/index.js";
import instructorImportRouter from "./modules/ingestion/instructor-import.routes.js";
import profileRouter from "./modules/profile/index.js";
import scoringRouter from "./modules/scoring/index.js";
import trendsRouter from "./modules/trends/index.js";
import alertsRouter from "./modules/alerts/index.js";
import interventionsRouter from "./modules/interventions/index.js";
import analyticsRouter from "./modules/analytics/index.js";
import adminRouter from "./modules/admin/index.js";
import { checkAndEscalateAlerts } from "./modules/alerts/alerts.service.js";

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/academic_risk_radar";

const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = configuredOrigins.length > 0
  ? configuredOrigins
  : [process.env.FRONTEND_URL || "http://localhost:3000", "http://127.0.0.1:3000"];

// Configure secure CORS whitelist for stateless REST API
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (
        !origin ||
        ALLOWED_ORIGINS.includes("*") ||
        ALLOWED_ORIGINS.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const isDev = process.env.NODE_ENV !== "production";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100000 : 100, // limit each IP to 100 requests per windowMs in prod
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(authenticateUser);

// Mount Authentication & Module API Routers
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", ingestionRouter);
app.use("/api/v1", instructorImportRouter);
app.use("/api/v1", profileRouter);
app.use("/api/v1", scoringRouter);
app.use("/api/v1", trendsRouter);
app.use("/api/v1", alertsRouter);
app.use("/api/v1", interventionsRouter);
app.use("/api/v1", analyticsRouter);
app.use("/api/v1/admin", adminRouter);

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    service: "Academic Risk Radar API",
    status: "online",
    version: "1.0.0",
    health: "/health",
    ready: "/ready",
  });
});

// Health check endpoint (basic liveness probe)
app.get("/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Readiness check endpoint (verifies MongoDB & Redis infrastructure connectivity)
app.get("/ready", async (_req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  let redisReady = false;

  let resolvedRedisHost = process.env.REDIS_HOST || "127.0.0.1";
  let resolvedRedisPort = parseInt(process.env.REDIS_PORT || "6379", 10);
  if (process.env.REDIS_URL) {
    try {
      const parsed = new URL(process.env.REDIS_URL);
      resolvedRedisHost = parsed.hostname || resolvedRedisHost;
      resolvedRedisPort = parseInt(parsed.port || "6379", 10);
    } catch {}
  }

  let redisClient: any = null;
  try {
    const ioredisModule = await import("ioredis");
    const RedisConstructor = (ioredisModule as any).default || (ioredisModule as any).Redis || ioredisModule;
    if (process.env.REDIS_URL) {
      const isTls = process.env.REDIS_URL.startsWith("rediss://");
      redisClient = new RedisConstructor(process.env.REDIS_URL, {
        connectTimeout: 4000,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        tls: isTls ? { rejectUnauthorized: false } : undefined,
      });
    } else {
      redisClient = new RedisConstructor({
        host: resolvedRedisHost,
        port: resolvedRedisPort,
        connectTimeout: 2000,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      });
    }
    await redisClient.connect();
    const pong = await redisClient.ping();
    redisReady = pong === "PONG";
  } catch (err: any) {
    redisReady = false;
  } finally {
    if (redisClient) {
      try {
        await redisClient.quit();
      } catch {}
    }
  }

  const isReady = mongoReady && redisReady;
  return res.status(isReady ? 200 : 503).json({
    status: isReady ? "ready" : "not_ready",
    checks: {
      mongodb: mongoReady ? "connected" : "disconnected",
      redis: redisReady ? "connected" : "disconnected",
    },
    timestamp: new Date().toISOString(),
  });
});

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log(`Connected to MongoDB at ${MONGO_URI}`);
      // Periodic 48-hour SLA timeout evaluation
      setInterval(async () => {
        try {
          if (mongoose.connection.readyState === 1) {
            await checkAndEscalateAlerts();
          }
        } catch (slaErr: unknown) {
          const msg = slaErr instanceof Error ? slaErr.message : "Error";
          console.warn("[Server] SLA escalation timer check:", msg);
        }
      }, 60000);

      app.listen(PORT, () => {
        console.log(`Academic Risk Radar API Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB Connection Error:", err);
    });
}

export default app;
