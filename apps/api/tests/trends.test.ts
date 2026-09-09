import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AggregatedStudentMetrics,
  calculateRollingBaseline,
  computeTrendDeteriorationSignal,
} from "../src/modules/trends/rolling-baseline.js";

describe("M4: Trend & Anomaly Detection — Rolling Baseline & Deterioration Engine", () => {
  describe("calculateRollingBaseline", () => {
    it("should accurately compute rolling average across past metric windows", () => {
      const history: AggregatedStudentMetrics[] = [
        { studentId: "STD100", attendanceRate: 0.95, assessmentAvg: 0.90, missingAssignmentsRatio: 0.0, lmsEngagementSec: 3600 },
        { studentId: "STD100", attendanceRate: 0.90, assessmentAvg: 0.85, missingAssignmentsRatio: 0.0, lmsEngagementSec: 3200 },
        { studentId: "STD100", attendanceRate: 0.92, assessmentAvg: 0.88, missingAssignmentsRatio: 0.0, lmsEngagementSec: 3400 },
        { studentId: "STD100", attendanceRate: 0.91, assessmentAvg: 0.89, missingAssignmentsRatio: 0.0, lmsEngagementSec: 3500 },
      ];

      const baseline = calculateRollingBaseline(history, 4);

      assert.equal(baseline.studentId, "STD100");
      assert.equal(baseline.windowWeeks, 4);
      assert.equal(baseline.avgAttendanceRate, 0.92);
      assert.equal(baseline.avgAssessmentAvg, 0.88);
      assert.equal(baseline.avgMissingRatio, 0.0);
      assert.equal(baseline.avgLmsEngagementSec, 3425);
    });

    it("should handle empty or small history arrays gracefully", () => {
      const emptyBaseline = calculateRollingBaseline([]);
      assert.equal(emptyBaseline.avgAttendanceRate, 1.0);
      assert.equal(emptyBaseline.avgAssessmentAvg, 1.0);
      assert.equal(emptyBaseline.avgMissingRatio, 0.0);

      const singleWeekHistory: AggregatedStudentMetrics[] = [
        { studentId: "STD101", attendanceRate: 0.80, assessmentAvg: 0.75, missingAssignmentsRatio: 0.1, lmsEngagementSec: 1800 },
      ];
      const singleBaseline = calculateRollingBaseline(singleWeekHistory, 4);
      assert.equal(singleBaseline.windowWeeks, 1);
      assert.equal(singleBaseline.avgAttendanceRate, 0.80);
    });
  });

  describe("computeTrendDeteriorationSignal", () => {
    it("should return low trend signal (~0.0) for stable or improving academic metrics", () => {
      const baseline = {
        studentId: "STD100",
        windowWeeks: 4,
        avgAttendanceRate: 0.90,
        avgAssessmentAvg: 0.85,
        avgMissingRatio: 0.0,
        avgLmsEngagementSec: 3000,
      };

      const recent: AggregatedStudentMetrics = {
        studentId: "STD100",
        attendanceRate: 0.92,
        assessmentAvg: 0.88,
        missingAssignmentsRatio: 0.0,
        lmsEngagementSec: 3200,
      };

      const result = computeTrendDeteriorationSignal(baseline, recent);

      assert.equal(result.trendDeteriorationSignal, 0.0);
      assert.equal(result.details.isSuddenDrop, false);
      assert.equal(result.details.attendanceDrop, 0.0);
      assert.equal(result.details.assessmentDrop, 0.0);
    });

    it("should detect sudden drop (>20% drop) and return elevated deterioration signal (>= 0.55)", () => {
      const baseline = {
        studentId: "STD102",
        windowWeeks: 4,
        avgAttendanceRate: 0.90,
        avgAssessmentAvg: 0.85,
        avgMissingRatio: 0.0,
        avgLmsEngagementSec: 3600,
      };

      // Attendance drops from 90% -> 50% (40% drop)
      const recent: AggregatedStudentMetrics = {
        studentId: "STD102",
        attendanceRate: 0.50,
        assessmentAvg: 0.80,
        missingAssignmentsRatio: 0.10,
        lmsEngagementSec: 1800,
      };

      const result = computeTrendDeteriorationSignal(baseline, recent);

      assert.equal(result.details.isSuddenDrop, true);
      assert.equal(result.details.attendanceDrop, 0.40);
      assert.ok(result.trendDeteriorationSignal >= 0.55, `Signal should be >= 0.55, got ${result.trendDeteriorationSignal}`);
    });

    it("should detect severe combined deterioration across attendance, assessments, missing assignments, and LMS", () => {
      const baseline = {
        studentId: "STD103",
        windowWeeks: 4,
        avgAttendanceRate: 0.95,
        avgAssessmentAvg: 0.90,
        avgMissingRatio: 0.05,
        avgLmsEngagementSec: 4000,
      };

      const recent: AggregatedStudentMetrics = {
        studentId: "STD103",
        attendanceRate: 0.40,
        assessmentAvg: 0.45,
        missingAssignmentsRatio: 0.60,
        lmsEngagementSec: 400,
      };

      const result = computeTrendDeteriorationSignal(baseline, recent);

      assert.equal(result.details.isSuddenDrop, true);
      assert.ok(result.trendDeteriorationSignal >= 0.95, `Signal should be >= 0.95, got ${result.trendDeteriorationSignal}`);
    });
  });
});
