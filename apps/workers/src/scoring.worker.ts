import { Worker, Job } from "bullmq";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);

/**
 * BullMQ Worker for batch risk scoring queue processing.
 * Owned by Team Member 1 (Module M3).
 */
export const scoringWorker = new Worker(
  "risk-scoring-queue",
  async (job: Job) => {
    console.log(`[Scoring Worker] Processing risk calculation job... Job ID: ${job.id}`);
    return { status: "processed" };
  },
  {
    connection: { host: REDIS_HOST, port: REDIS_PORT },
  }
);
