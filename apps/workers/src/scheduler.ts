import { Queue } from "bullmq";
import { getWorkerRedisConnection } from "./connection.js";

export const NIGHTLY_SCORING_SCHEDULER_ID = "nightly-batch-scoring-scheduler";
export const SLA_ESCALATION_SCHEDULER_ID = "recurring-sla-escalation-scheduler";

export interface SchedulerOptions {
  host?: string;
  port?: number;
  connection?: any;
}

/**
 * Registers durable BullMQ repeatable job schedules for:
 * 1. Nightly batch risk scoring recalculation at 02:00 UTC (cron: 0 2 * * *).
 * 2. Frequent SLA escalation checks every 15 minutes (interval: 900,000ms).
 *
 * Uses BullMQ's upsertJobScheduler with deterministic scheduler IDs to guarantee
 * strict idempotency across worker restarts, scale-out replicas, and zero duplicate schedules.
 */
export async function registerRepeatableSchedules(options: SchedulerOptions = {}) {
  const connection = options.connection || (options.host ? { host: options.host, port: options.port } : getWorkerRedisConnection());

  const scoringQueue = new Queue("risk-scoring-queue", { connection: connection as any });
  const escalationQueue = new Queue("alert-escalation-queue", { connection: connection as any });

  try {
    // 1. Idempotent Nightly Scoring (02:00 daily)
    await scoringQueue.upsertJobScheduler(
      NIGHTLY_SCORING_SCHEDULER_ID,
      { pattern: "0 2 * * *" },
      {
        name: "nightly-batch-scoring",
        data: { triggeredBy: "nightly-scheduler" },
      }
    );

    // 2. Idempotent SLA Escalation Check (every 15 minutes)
    await escalationQueue.upsertJobScheduler(
      SLA_ESCALATION_SCHEDULER_ID,
      { every: 15 * 60 * 1000 },
      {
        name: "check-sla-escalations",
        data: { triggeredBy: "sla-scheduler" },
      }
    );

    console.log(
      `[Scheduler] Successfully registered repeatable BullMQ schedules: '${NIGHTLY_SCORING_SCHEDULER_ID}' (02:00 nightly) & '${SLA_ESCALATION_SCHEDULER_ID}' (every 15m).`
    );

    return {
      success: true,
      schedulers: [NIGHTLY_SCORING_SCHEDULER_ID, SLA_ESCALATION_SCHEDULER_ID],
    };
  } finally {
    await scoringQueue.close();
    await escalationQueue.close();
  }
}
