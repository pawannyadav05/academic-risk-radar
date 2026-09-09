/**
 * Module M4: Trend & Anomaly Detection — Rolling Baseline & Deterioration Engine
 * Pure mathematical helper for trailing baseline calculation and sudden drop detection.
 */

export interface AggregatedStudentMetrics {
  studentId: string;
  attendanceRate: number;            // 0.0 (0%) to 1.0 (100%)
  assessmentAvg: number;             // 0.0 (0%) to 1.0 (100%)
  missingAssignmentsRatio: number;   // 0.0 (0%) to 1.0 (100% missing)
  lmsEngagementSec: number;          // Total engagement duration in seconds
}

export interface StudentRollingBaseline {
  studentId: string;
  windowWeeks: number;
  avgAttendanceRate: number;
  avgAssessmentAvg: number;
  avgMissingRatio: number;
  avgLmsEngagementSec: number;
}

export interface TrendAnalysisResult {
  studentId: string;
  trendDeteriorationSignal: number;  // 0.0 (stable/improving) to 1.0 (critical deterioration)
  details: {
    attendanceDrop: number;          // Percentage point decrease from baseline
    assessmentDrop: number;          // Percentage point decrease from baseline
    missingRatioIncrease: number;    // Increase in missing assignments ratio from baseline
    lmsDropRatio: number;            // Relative drop ratio from baseline LMS duration
    isSuddenDrop: boolean;           // True if > 20% drop week-over-week in major metrics
  };
}

/**
 * Compute trailing rolling baseline across past metric windows (e.g., 4-6 weeks)
 */
export function calculateRollingBaseline(
  history: AggregatedStudentMetrics[],
  windowWeeks: number = 4
): StudentRollingBaseline {
  if (!history || history.length === 0) {
    return {
      studentId: "",
      windowWeeks,
      avgAttendanceRate: 1.0,
      avgAssessmentAvg: 1.0,
      avgMissingRatio: 0.0,
      avgLmsEngagementSec: 0,
    };
  }

  const sample = history.slice(-windowWeeks);
  const count = sample.length;
  const studentId = sample[0].studentId;

  const totalAttendance = sample.reduce((sum, m) => sum + m.attendanceRate, 0);
  const totalAssessment = sample.reduce((sum, m) => sum + m.assessmentAvg, 0);
  const totalMissing = sample.reduce((sum, m) => sum + m.missingAssignmentsRatio, 0);
  const totalLms = sample.reduce((sum, m) => sum + m.lmsEngagementSec, 0);

  return {
    studentId,
    windowWeeks: count,
    avgAttendanceRate: Number((totalAttendance / count).toFixed(4)),
    avgAssessmentAvg: Number((totalAssessment / count).toFixed(4)),
    avgMissingRatio: Number((totalMissing / count).toFixed(4)),
    avgLmsEngagementSec: Math.round(totalLms / count),
  };
}

/**
 * Compute trend deterioration signal (0.0 to 1.0) by comparing recent window metrics to rolling baseline
 */
export function computeTrendDeteriorationSignal(
  baseline: StudentRollingBaseline,
  recent: AggregatedStudentMetrics
): TrendAnalysisResult {
  const attendanceDrop = Math.max(0, baseline.avgAttendanceRate - recent.attendanceRate);
  const assessmentDrop = Math.max(0, baseline.avgAssessmentAvg - recent.assessmentAvg);
  const missingRatioIncrease = Math.max(0, recent.missingAssignmentsRatio - baseline.avgMissingRatio);

  const lmsDropRatio =
    baseline.avgLmsEngagementSec > 0
      ? Math.max(0, (baseline.avgLmsEngagementSec - recent.lmsEngagementSec) / baseline.avgLmsEngagementSec)
      : 0;

  // Sudden drop definition: >= 0.20 (20 percentage points) drop in attendance or assessment, or missing ratio jump >= 0.25
  const isSuddenDrop = attendanceDrop >= 0.20 || assessmentDrop >= 0.20 || missingRatioIncrease >= 0.25;

  // Weighted raw deterioration signal
  // Attendance & Assessment carry 35% weight each, Missing assignments 15%, LMS engagement 15%
  const normAttendance = Math.min(1.0, attendanceDrop / 0.40);
  const normAssessment = Math.min(1.0, assessmentDrop / 0.40);
  const normMissing = Math.min(1.0, missingRatioIncrease / 0.50);
  const normLms = Math.min(1.0, lmsDropRatio);

  let rawSignal =
    0.35 * normAttendance +
    0.35 * normAssessment +
    0.15 * normMissing +
    0.15 * normLms;

  if (isSuddenDrop) {
    rawSignal = Math.max(rawSignal, 0.55);
  }

  const trendDeteriorationSignal = Number(Math.min(1.0, Math.max(0.0, rawSignal)).toFixed(4));

  return {
    studentId: recent.studentId || baseline.studentId,
    trendDeteriorationSignal,
    details: {
      attendanceDrop: Number(attendanceDrop.toFixed(4)),
      assessmentDrop: Number(assessmentDrop.toFixed(4)),
      missingRatioIncrease: Number(missingRatioIncrease.toFixed(4)),
      lmsDropRatio: Number(lmsDropRatio.toFixed(4)),
      isSuddenDrop,
    },
  };
}
