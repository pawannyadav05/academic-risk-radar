import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AssessmentRecord,
  AssignmentSubmission,
  AttendanceRecord,
  LmsActivity,
} from "@academic-risk-radar/shared-types";
import { aggregateStudentProfile } from "../src/modules/profile/profile-aggregator.js";

describe("M2: Student Academic Profile Aggregator", () => {
  it("should return default metrics when no records exist for a student", () => {
    const profile = aggregateStudentProfile("STD_EMPTY", {});

    assert.equal(profile.studentId, "STD_EMPTY");
    assert.equal(profile.attendance.totalSessions, 0);
    assert.equal(profile.attendance.attendanceRate, 1.0);
    assert.equal(profile.assessments.totalAssessments, 0);
    assert.equal(profile.assessments.averageScoreRatio, 1.0);
    assert.equal(profile.assignments.totalAssignments, 0);
    assert.equal(profile.assignments.missingRatio, 0.0);
    assert.equal(profile.lms.totalActivities, 0);
    assert.equal(profile.lms.engagementRatio, 0.0);
  });

  it("should calculate attendance rate accurately considering present and late sessions", () => {
    const attendance: AttendanceRecord[] = [
      { studentId: "STD001", sectionId: "SEC_1", date: "2026-03-01T09:00:00Z", status: "present", sourceRef: "ref" },
      { studentId: "STD001", sectionId: "SEC_1", date: "2026-03-02T09:00:00Z", status: "present", sourceRef: "ref" },
      { studentId: "STD001", sectionId: "SEC_1", date: "2026-03-03T09:00:00Z", status: "late", sourceRef: "ref" },
      { studentId: "STD001", sectionId: "SEC_1", date: "2026-03-04T09:00:00Z", status: "absent", sourceRef: "ref" },
    ];

    const profile = aggregateStudentProfile("STD001", { attendance });

    assert.equal(profile.attendance.totalSessions, 4);
    assert.equal(profile.attendance.presentCount, 2);
    assert.equal(profile.attendance.lateCount, 1);
    assert.equal(profile.attendance.absentCount, 1);
    // (2 + 1*0.5) / 4 = 2.5 / 4 = 0.625
    assert.equal(profile.attendance.attendanceRate, 0.625);
    assert.equal(profile.computedMetrics.attendanceRate, 0.625);
  });

  it("should calculate assessment average accurately across different maxScores", () => {
    const assessments: AssessmentRecord[] = [
      { studentId: "STD001", courseId: "CSE101", type: "Midterm", score: 80, maxScore: 100, date: "2026-03-10T00:00:00Z", sourceRef: "ref" }, // 0.8
      { studentId: "STD001", courseId: "CSE102", type: "Quiz", score: 45, maxScore: 50, date: "2026-03-12T00:00:00Z", sourceRef: "ref" },    // 0.9
    ];

    const profile = aggregateStudentProfile("STD001", { assessments });

    assert.equal(profile.assessments.totalAssessments, 2);
    // avg(0.8, 0.9) = 0.85
    assert.equal(profile.assessments.averageScoreRatio, 0.85);
    assert.equal(profile.computedMetrics.assessmentAvg, 0.85);
    assert.equal(profile.assessments.records.length, 2);
    assert.equal(profile.assessments.records[0].percentage, 80);
    assert.equal(profile.assessments.records[1].percentage, 90);
  });

  it("should calculate missing assignment ratio accurately", () => {
    const assignments: AssignmentSubmission[] = [
      { studentId: "STD001", courseId: "CSE101", assignmentId: "A1", submittedAt: "2026-02-10T00:00:00Z", status: "submitted" },
      { studentId: "STD001", courseId: "CSE101", assignmentId: "A2", submittedAt: null, status: "missing" },
      { studentId: "STD001", courseId: "CSE102", assignmentId: "A3", submittedAt: "2026-02-15T00:00:00Z", status: "late" },
    ];

    const profile = aggregateStudentProfile("STD001", { assignments });

    assert.equal(profile.assignments.totalAssignments, 3);
    assert.equal(profile.assignments.submittedCount, 1);
    assert.equal(profile.assignments.missingCount, 1);
    assert.equal(profile.assignments.lateCount, 1);
    // 1 missing out of 3 = 0.3333
    assert.equal(profile.assignments.missingRatio, 0.3333);
    assert.equal(profile.computedMetrics.missingAssignmentsRatio, 0.3333);
  });

  it("should aggregate LMS activities and compute engagement ratio", () => {
    const lms: LmsActivity[] = [
      { studentId: "STD001", courseId: "CSE101", date: "2026-03-01T10:00:00Z", activityType: "video", durationSec: 1800 },
      { studentId: "STD001", courseId: "CSE101", date: "2026-03-02T10:00:00Z", activityType: "quiz", durationSec: 1800 },
    ];

    const profile = aggregateStudentProfile("STD001", { lms });

    assert.equal(profile.lms.totalActivities, 2);
    assert.equal(profile.lms.totalDurationSec, 3600);
    // 3600 / 7200 target = 0.5
    assert.equal(profile.lms.engagementRatio, 0.5);
    assert.equal(profile.computedMetrics.lmsEngagementRatio, 0.5);
  });
});
