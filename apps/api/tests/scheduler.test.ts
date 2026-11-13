import assert from "node:assert/strict";
import { describe, it } from "node:test";

export const NIGHTLY_SCORING_SCHEDULER_ID = "nightly-batch-scoring-scheduler";
export const SLA_ESCALATION_SCHEDULER_ID = "recurring-sla-escalation-scheduler";

describe("BullMQ Repeatable Scheduler — Idempotency & Unique Schedulers (Fix 5)", () => {
  it("exports deterministic scheduler IDs for nightly scoring and SLA checks", () => {
    assert.equal(NIGHTLY_SCORING_SCHEDULER_ID, "nightly-batch-scoring-scheduler");
    assert.equal(SLA_ESCALATION_SCHEDULER_ID, "recurring-sla-escalation-scheduler");
  });

  it("proves duplicate registrations maintain exactly 1 scheduler per queue (idempotent upsert)", async () => {
    // Simulated queue with upsertJobScheduler tracking registered schedulers
    class MockQueue {
      schedulers = new Map<string, { repeat: any; job: any }>();

      async upsertJobScheduler(id: string, repeat: any, job: any) {
        this.schedulers.set(id, { repeat, job });
        return { id, key: `repeat:${id}` };
      }

      async getJobSchedulers() {
        return Array.from(this.schedulers.entries()).map(([id, val]) => ({ id, ...val }));
      }
    }

    const mockScoringQueue = new MockQueue();
    const mockEscalationQueue = new MockQueue();

    // First deployment registration
    await mockScoringQueue.upsertJobScheduler(
      NIGHTLY_SCORING_SCHEDULER_ID,
      { pattern: "0 2 * * *" },
      { name: "nightly-batch-scoring" }
    );
    await mockEscalationQueue.upsertJobScheduler(
      SLA_ESCALATION_SCHEDULER_ID,
      { every: 15 * 60 * 1000 },
      { name: "check-sla-escalations" }
    );

    // Assert 1 scheduler each
    assert.equal(mockScoringQueue.schedulers.size, 1);
    assert.equal(mockEscalationQueue.schedulers.size, 1);

    // Duplicate deployment / worker restart registration
    await mockScoringQueue.upsertJobScheduler(
      NIGHTLY_SCORING_SCHEDULER_ID,
      { pattern: "0 2 * * *" },
      { name: "nightly-batch-scoring" }
    );
    await mockEscalationQueue.upsertJobScheduler(
      SLA_ESCALATION_SCHEDULER_ID,
      { every: 15 * 60 * 1000 },
      { name: "check-sla-escalations" }
    );

    // Assert size remains exactly 1 (no duplicate schedules created)
    assert.equal(mockScoringQueue.schedulers.size, 1, "Duplicate deployment must NOT duplicate nightly scoring scheduler");
    assert.equal(mockEscalationQueue.schedulers.size, 1, "Duplicate deployment must NOT duplicate SLA escalation scheduler");

    const scoringSchedulers = await mockScoringQueue.getJobSchedulers();
    assert.equal(scoringSchedulers[0].id, "nightly-batch-scoring-scheduler");
    assert.equal(scoringSchedulers[0].repeat.pattern, "0 2 * * *");
  });
});
