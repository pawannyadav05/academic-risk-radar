import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AggregatedStudentMetrics,
  calculateRollingBaseline,
  computeTrendDeteriorationSignal,
} from "../src/modules/trends/rolling-baseline.js";
import { generateSyntheticSeedData } from "../src/modules/trends/seed-generator.js";

describe("M4: Synthetic Seed Data Generator — Stage 1 Part 2", () => {
  it("should generate full multi-week synthetic datasets matching shared-types specifications", () => {
    const seedData = generateSyntheticSeedData({ studentCount: 50, deteriorationRatio: 0.18, weeksHistory: 6 });

    assert.equal(seedData.students.length, 50);
    assert.equal(seedData.mentorAssignments.length, 50);
    assert.equal(seedData.deterioratedStudentIds.length, 9); // 18% of 50 = 9

    // Check student schema fields
    const firstStudent = seedData.students[0];
    assert.ok(firstStudent._id.startsWith("STD-"));
    assert.ok(firstStudent.enrolmentId.startsWith("ENR2026"));
    assert.ok(firstStudent.sectionIds.length > 0);
    assert.ok(firstStudent.programme.length > 0);

    // Check attendance records schema
    assert.ok(seedData.attendanceRecords.length > 0);
    const firstAtt = seedData.attendanceRecords[0];
    assert.ok(["present", "absent", "late"].includes(firstAtt.status));
    assert.ok(firstAtt.sourceRef.startsWith("ERP-ATT-"));

    // Check assessment records schema
    assert.ok(seedData.assessmentRecords.length > 0);
    const firstAssess = seedData.assessmentRecords[0];
    assert.ok(firstAssess.score <= firstAssess.maxScore);
    assert.ok(firstAssess.sourceRef.startsWith("LMS-ASSESS-"));

    // Check assignment submissions schema
    assert.ok(seedData.assignmentSubmissions.length > 0);
    const firstAssign = seedData.assignmentSubmissions[0];
    assert.ok(["submitted", "missing", "late"].includes(firstAssign.status));

    // Check LMS activity schema
    assert.ok(seedData.lmsActivities.length > 0);
    const firstLms = seedData.lmsActivities[0];
    assert.ok(firstLms.durationSec >= 0);
  });

  it("should engineer 15-20% of students with measurable downward trend deterioration", () => {
    const seedData = generateSyntheticSeedData({ studentCount: 50, deteriorationRatio: 0.18, weeksHistory: 6 });
    const weeks = 6;

    // Helper to calculate weekly metrics for a student from generated seed records
    const getStudentWeeklyMetrics = (studentId: string): AggregatedStudentMetrics[] => {
      const metrics: AggregatedStudentMetrics[] = [];
      for (let w = 1; w <= weeks; w++) {
        // Attendance
        const attRecords = seedData.attendanceRecords.filter(
          (a) => a.studentId === studentId && a.sourceRef.includes(`-W${w}-`)
        );
        const presentCount = attRecords.filter((a) => a.status === "present").length;
        const attRate = attRecords.length > 0 ? presentCount / attRecords.length : 1.0;

        // Assessment
        const assessRecords = seedData.assessmentRecords.filter(
          (a) => a.studentId === studentId && a.sourceRef === `LMS-ASSESS-W${w}`
        );
        const assessScore = assessRecords.length > 0 ? assessRecords[0].score / assessRecords[0].maxScore : 1.0;

        // Assignment missing ratio
        const assignRecords = seedData.assignmentSubmissions.filter(
          (a) => a.studentId === studentId && a.assignmentId.startsWith(`ASG-W${w}-`)
        );
        const missingCount = assignRecords.filter((a) => a.status === "missing").length;
        const missingRatio = assignRecords.length > 0 ? missingCount / assignRecords.length : 0.0;

        // LMS duration
        const lmsRecords = seedData.lmsActivities.filter(
          (l) => l.studentId === studentId && new Date(l.date).getTime()
        );
        const lmsSec = lmsRecords.length >= w ? lmsRecords[w - 1].durationSec : 3600;

        metrics.push({
          studentId,
          attendanceRate: attRate,
          assessmentAvg: assessScore,
          missingAssignmentsRatio: missingRatio,
          lmsEngagementSec: lmsSec,
        });
      }
      return metrics;
    };

    // Test a deteriorated student
    const detStudentId = seedData.deterioratedStudentIds[0];
    const detWeeklyHistory = getStudentWeeklyMetrics(detStudentId);
    const detBaseline = calculateRollingBaseline(detWeeklyHistory.slice(0, 4), 4);
    const detRecent = detWeeklyHistory[detWeeklyHistory.length - 1]; // week 6
    const detTrend = computeTrendDeteriorationSignal(detBaseline, detRecent);

    assert.ok(
      detTrend.trendDeteriorationSignal >= 0.50 || detTrend.details.isSuddenDrop,
      `Deteriorated student ${detStudentId} should trigger high trend signal, got ${detTrend.trendDeteriorationSignal}`
    );

    // Test a healthy student
    const healthyStudent = seedData.students.find((s) => !seedData.deterioratedStudentIds.includes(s._id))!;
    const healthyWeeklyHistory = getStudentWeeklyMetrics(healthyStudent._id);
    const healthyBaseline = calculateRollingBaseline(healthyWeeklyHistory.slice(0, 4), 4);
    const healthyRecent = healthyWeeklyHistory[healthyWeeklyHistory.length - 1];
    const healthyTrend = computeTrendDeteriorationSignal(healthyBaseline, healthyRecent);

    assert.ok(
      healthyTrend.trendDeteriorationSignal < 0.35,
      `Healthy student ${healthyStudent._id} should have low trend signal, got ${healthyTrend.trendDeteriorationSignal}`
    );
  });

  it("should be deterministic and reproducible when given identical seed", () => {
    const run1 = generateSyntheticSeedData({ studentCount: 20, seed: 123 });
    const run2 = generateSyntheticSeedData({ studentCount: 20, seed: 123 });

    assert.deepEqual(run1.students, run2.students);
    assert.deepEqual(run1.deterioratedStudentIds, run2.deterioratedStudentIds);
    assert.equal(run1.attendanceRecords.length, run2.attendanceRecords.length);
  });
});
