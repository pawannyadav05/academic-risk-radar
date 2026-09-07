import { RiskBand, RiskFactor, RiskModelVersion, RiskSnapshot } from "@academic-risk-radar/shared-types";

export interface StudentScoringMetrics {
  attendanceRate: number;            // 0.0 to 1.0 (1.0 = 100% attendance)
  assessmentAvg: number;             // 0.0 to 1.0 (1.0 = 100% average marks)
  missingAssignmentsRatio: number;   // 0.0 to 1.0 (1.0 = all assignments missing)
  lmsEngagementRatio: number;        // 0.0 to 1.0 (1.0 = target engagement met)
  trendDeteriorationSignal: number;   // 0.0 to 1.0 (1.0 = severe deterioration signal)
}

export const DEFAULT_MODEL_VERSION: RiskModelVersion = {
  version: "v1.0.0",
  effectiveFrom: "2026-01-01T00:00:00.000Z",
  weights: {
    attendance_deficit: 0.30,
    assessment_deficit: 0.25,
    missing_assignments: 0.20,
    lms_engagement_deficit: 0.10,
    trend_deterioration: 0.15,
  },
  thresholds: {
    low: 0.0,
    moderate: 0.25,
    high: 0.50,
    critical: 0.75,
  },
  createdBy: "system",
  previousVersion: null,
};

/**
 * Pure deterministic risk scoring function for Module M3.
 * Same input metrics + same model version -> byte-identical RiskSnapshot output every run.
 */
export function computeRiskSnapshot(
  studentId: string,
  metrics: StudentScoringMetrics,
  modelVersion: RiskModelVersion = DEFAULT_MODEL_VERSION,
  computedAt: string = new Date().toISOString()
): RiskSnapshot {
  const clamp = (val: number) => Math.min(1.0, Math.max(0.0, val));

  // Compute factor raw values
  const factorValues: Record<string, number> = {
    attendance_deficit: clamp(1.0 - metrics.attendanceRate),
    assessment_deficit: clamp(1.0 - metrics.assessmentAvg),
    missing_assignments: clamp(metrics.missingAssignmentsRatio),
    lms_engagement_deficit: clamp(1.0 - metrics.lmsEngagementRatio),
    trend_deterioration: clamp(metrics.trendDeteriorationSignal),
  };

  const factors: RiskFactor[] = [];
  let totalScore = 0.0;

  for (const [name, weight] of Object.entries(modelVersion.weights)) {
    const rawVal = factorValues[name] ?? 0.0;
    const contribution = Number((weight * rawVal).toFixed(4));
    totalScore += contribution;

    factors.push({
      name,
      weight: Number(weight.toFixed(4)),
      contribution,
      value: Number(rawVal.toFixed(4)),
    });
  }

  // Sort factors descending by contribution to highlight primary risk drivers
  factors.sort((a, b) => b.contribution - a.contribution);

  // Determine Risk Band based on model thresholds
  let band: RiskBand = "low";
  if (totalScore >= modelVersion.thresholds.critical) {
    band = "critical";
  } else if (totalScore >= modelVersion.thresholds.high) {
    band = "high";
  } else if (totalScore >= modelVersion.thresholds.moderate) {
    band = "moderate";
  } else {
    band = "low";
  }

  return {
    _id: `snapshot_${studentId}_${computedAt.replace(/[:.-]/g, "_")}`,
    studentId,
    computedAt,
    modelVersion: modelVersion.version,
    band,
    factors,
  };
}

/**
 * Preview impact of changing model version weights/thresholds against a dataset of student snapshots.
 * Returns total count of students whose band would change under new version.
 */
export function previewModelImpact(
  studentsWithMetrics: { studentId: string; metrics: StudentScoringMetrics }[],
  currentVersion: RiskModelVersion,
  newVersion: RiskModelVersion
): {
  totalStudentsScored: number;
  changedBandCount: number;
  bandTransitions: Record<string, number>;
} {
  let changedBandCount = 0;
  const bandTransitions: Record<string, number> = {};

  for (const item of studentsWithMetrics) {
    const currentSnap = computeRiskSnapshot(item.studentId, item.metrics, currentVersion);
    const newSnap = computeRiskSnapshot(item.studentId, item.metrics, newVersion);

    if (currentSnap.band !== newSnap.band) {
      changedBandCount++;
      const transitionKey = `${currentSnap.band}->${newSnap.band}`;
      bandTransitions[transitionKey] = (bandTransitions[transitionKey] || 0) + 1;
    }
  }

  return {
    totalStudentsScored: studentsWithMetrics.length,
    changedBandCount,
    bandTransitions,
  };
}
