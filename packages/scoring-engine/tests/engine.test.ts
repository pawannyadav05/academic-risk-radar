import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_MODEL_VERSION, computeRiskSnapshot, previewModelImpact } from "../src/engine.js";

test("Risk Scoring Engine — Determinism & Reproducibility", () => {
  const studentMetrics = {
    attendanceRate: 0.60,
    assessmentAvg: 0.55,
    missingAssignmentsRatio: 0.40,
    lmsEngagementRatio: 0.50,
    trendDeteriorationSignal: 0.70,
  };
  const fixedTimestamp = "2026-09-07T12:00:00.000Z";

  const snap1 = computeRiskSnapshot("STU001", studentMetrics, DEFAULT_MODEL_VERSION, fixedTimestamp);
  const snap2 = computeRiskSnapshot("STU001", studentMetrics, DEFAULT_MODEL_VERSION, fixedTimestamp);

  assert.deepEqual(snap1, snap2, "Repeated runs on identical inputs must produce byte-identical RiskSnapshot output");
});

test("Risk Scoring Engine — Ranked Factors & Contribution Sorting", () => {
  const studentMetrics = {
    attendanceRate: 0.20,             // high deficit (0.8 * 0.30 = 0.24)
    assessmentAvg: 0.90,              // low deficit (0.1 * 0.25 = 0.025)
    missingAssignmentsRatio: 0.80,    // high deficit (0.8 * 0.20 = 0.16)
    lmsEngagementRatio: 0.90,         // low deficit (0.1 * 0.10 = 0.01)
    trendDeteriorationSignal: 0.10,   // low deficit (0.1 * 0.15 = 0.015)
  };

  const snapshot = computeRiskSnapshot("STU002", studentMetrics, DEFAULT_MODEL_VERSION);

  assert.ok(snapshot.factors.length >= 3, "Snapshot must contain at least 3 ranked factors");
  for (let i = 0; i < snapshot.factors.length - 1; i++) {
    assert.ok(
      snapshot.factors[i].contribution >= snapshot.factors[i + 1].contribution,
      "Factors must be sorted descending by contribution"
    );
  }
  assert.equal(snapshot.factors[0].name, "attendance_deficit", "Top factor should be attendance_deficit");
});

test("Risk Scoring Engine — Band Threshold Boundaries", () => {
  const perfectStudent = {
    attendanceRate: 1.0,
    assessmentAvg: 1.0,
    missingAssignmentsRatio: 0.0,
    lmsEngagementRatio: 1.0,
    trendDeteriorationSignal: 0.0,
  };

  const criticalStudent = {
    attendanceRate: 0.0,
    assessmentAvg: 0.0,
    missingAssignmentsRatio: 1.0,
    lmsEngagementRatio: 0.0,
    trendDeteriorationSignal: 1.0,
  };

  const lowSnap = computeRiskSnapshot("STU_PERFECT", perfectStudent, DEFAULT_MODEL_VERSION);
  const critSnap = computeRiskSnapshot("STU_CRITICAL", criticalStudent, DEFAULT_MODEL_VERSION);

  assert.equal(lowSnap.band, "low", "Perfect metrics should produce 'low' risk band");
  assert.equal(critSnap.band, "critical", "Zero metrics should produce 'critical' risk band");
});

test("Risk Scoring Engine — Preview Model Impact", () => {
  const students = [
    {
      studentId: "S1",
      metrics: { attendanceRate: 0.65, assessmentAvg: 0.60, missingAssignmentsRatio: 0.30, lmsEngagementRatio: 0.70, trendDeteriorationSignal: 0.40 },
    },
    {
      studentId: "S2",
      metrics: { attendanceRate: 0.90, assessmentAvg: 0.90, missingAssignmentsRatio: 0.10, lmsEngagementRatio: 0.90, trendDeteriorationSignal: 0.05 },
    },
  ];

  const modifiedVersion = {
    ...DEFAULT_MODEL_VERSION,
    version: "v2.0.0",
    thresholds: {
      low: 0.0,
      moderate: 0.10,
      high: 0.30,
      critical: 0.50,
    },
  };

  const previewResult = previewModelImpact(students, DEFAULT_MODEL_VERSION, modifiedVersion);

  assert.equal(previewResult.totalStudentsScored, 2);
  assert.ok(previewResult.changedBandCount >= 1, "Preview should accurately count students transitioning risk bands");
});
