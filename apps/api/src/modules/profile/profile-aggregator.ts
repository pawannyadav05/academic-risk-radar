import {
  AssessmentRecord,
  AssignmentSubmission,
  AttendanceRecord,
  LmsActivity,
} from "@academic-risk-radar/shared-types";
import {
  AssessmentRecordModel,
  AssignmentSubmissionModel,
  AttendanceRecordModel,
  LmsActivityModel,
} from "../../db/schemas.js";

export interface StudentProfileSummary {
  studentId: string;
  attendance: {
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    attendanceRate: number; // 0.0 to 1.0
    subjectBreakdown?: Array<{
      courseId: string;
      percentage: number;
    }>;
  };
  assessments: {
    totalAssessments: number;
    averageScoreRatio: number; // 0.0 to 1.0
    records: Array<{
      courseId: string;
      type: string;
      score: number;
      maxScore: number;
      percentage: number;
      date: string;
    }>;
  };
  assignments: {
    totalAssignments: number;
    submittedCount: number;
    missingCount: number;
    lateCount: number;
    missingRatio: number; // 0.0 to 1.0
  };
  lms: {
    totalActivities: number;
    totalDurationSec: number;
    engagementRatio: number; // 0.0 to 1.0
  };
  computedMetrics: {
    attendanceRate: number;
    assessmentAvg: number;
    missingAssignmentsRatio: number;
    lmsEngagementRatio: number;
  };
}

/**
 * Pure aggregation function for Module M2: Student Academic Profile.
 * Combines raw records from institutional sources into a single consolidated standing.
 * Deterministic and unit-testable without database connections.
 */
export function aggregateStudentProfile(
  studentId: string,
  records: {
    attendance?: AttendanceRecord[];
    assessments?: AssessmentRecord[];
    assignments?: AssignmentSubmission[];
    lms?: LmsActivity[];
  }
): StudentProfileSummary {
  const attendanceList = records.attendance ?? [];
  const assessmentList = records.assessments ?? [];
  const assignmentList = records.assignments ?? [];
  const lmsList = records.lms ?? [];

  // 1. Attendance Aggregation: support both subject-wise percentages & session counts
  // When instructors submit subject percentages, overall attendance is the average across all subjects.
  const subjectPercentages = new Map<string, number>();
  const sortedAttendance = [...attendanceList].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const att of sortedAttendance) {
    if (att.courseId && typeof att.percentage === "number") {
      const rawPct = att.percentage;
      const normalizedPct = rawPct <= 1.0 && rawPct > 0 ? rawPct * 100 : rawPct;
      subjectPercentages.set(att.courseId, normalizedPct);
    }
  }

  let attendanceRate = 1.0;
  const subjectBreakdown: Array<{ courseId: string; percentage: number }> = [];

  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;

  for (const att of attendanceList) {
    if (att.status === "present") presentCount++;
    else if (att.status === "absent") absentCount++;
    else if (att.status === "late") lateCount++;
  }
  const totalSessions = attendanceList.length;

  if (subjectPercentages.size > 0) {
    let sum = 0;
    subjectPercentages.forEach((pct, courseId) => {
      sum += pct;
      subjectBreakdown.push({ courseId, percentage: Math.round(pct) });
    });
    const avgPct = sum / subjectPercentages.size;
    attendanceRate = Number((avgPct / 100).toFixed(4));
  } else {
    // Fallback session rate
    attendanceRate =
      totalSessions > 0
        ? Number(((presentCount + lateCount * 0.5) / totalSessions).toFixed(4))
        : 1.0;
  }

  // 2. Assessment Aggregation: accumulate across all historical records
  let totalScoreRatio = 0;
  const assessmentDetails = assessmentList.map((rec) => {
    const ratio = rec.maxScore > 0 ? rec.score / rec.maxScore : 0;
    totalScoreRatio += ratio;
    return {
      courseId: rec.courseId,
      type: rec.type,
      score: rec.score,
      maxScore: rec.maxScore,
      percentage: Number((ratio * 100).toFixed(2)),
      date: rec.date,
    };
  });
  // Sort newest first
  assessmentDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const assessmentAvg =
    assessmentList.length > 0
      ? Number((totalScoreRatio / assessmentList.length).toFixed(4))
      : 1.0;

  // 3. Assignment Submissions Aggregation
  let submittedCount = 0;
  let missingCount = 0;
  let lateAssignmentCount = 0;

  for (const asgn of assignmentList) {
    if (asgn.status === "submitted") submittedCount++;
    else if (asgn.status === "missing") missingCount++;
    else if (asgn.status === "late") lateAssignmentCount++;
  }
  const totalAssignments = assignmentList.length;
  const missingRatio =
    totalAssignments > 0
      ? Number((missingCount / totalAssignments).toFixed(4))
      : 0.0;

  // 4. LMS Engagement Aggregation
  let totalDurationSec = 0;
  for (const act of lmsList) {
    totalDurationSec += act.durationSec;
  }
  // Baseline target: e.g. 7200 seconds (2 hours) of weekly active study = 1.0 ratio
  const TARGET_LMS_DURATION_SEC = 7200;
  const lmsEngagementRatio =
    totalDurationSec >= TARGET_LMS_DURATION_SEC
      ? 1.0
      : Number((totalDurationSec / TARGET_LMS_DURATION_SEC).toFixed(4));

  return {
    studentId,
    attendance: {
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate,
      subjectBreakdown,
    },
    assessments: {
      totalAssessments: assessmentList.length,
      averageScoreRatio: assessmentAvg,
      records: assessmentDetails,
    },
    assignments: {
      totalAssignments,
      submittedCount,
      missingCount,
      lateCount: lateAssignmentCount,
      missingRatio,
    },
    lms: {
      totalActivities: lmsList.length,
      totalDurationSec,
      engagementRatio: lmsEngagementRatio,
    },
    computedMetrics: {
      attendanceRate,
      assessmentAvg,
      missingAssignmentsRatio: missingRatio,
      lmsEngagementRatio,
    },
  };
}

/**
 * DB query helper: fetches student records across collections and computes the consolidated profile.
 */
export async function getStudentConsolidatedProfile(
  studentId: string
): Promise<StudentProfileSummary> {
  const [attendance, assessments, assignments, lms] = await Promise.all([
    AttendanceRecordModel.find({ studentId }).lean<AttendanceRecord[]>(),
    AssessmentRecordModel.find({ studentId }).lean<AssessmentRecord[]>(),
    AssignmentSubmissionModel.find({ studentId }).lean<AssignmentSubmission[]>(),
    LmsActivityModel.find({ studentId }).lean<LmsActivity[]>(),
  ]);

  return aggregateStudentProfile(studentId, {
    attendance,
    assessments,
    assignments,
    lms,
  });
}
