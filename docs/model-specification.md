# Risk Scoring Model Specification

The Academic Risk Radar utilizes a versioned, fully deterministic, weighted scoring engine. Scoring is non-disciplinary, explainable, and reproducible across runs.

## 1. Input Features & Factors

The scoring engine evaluates five primary signal categories:

1. **Attendance Deficit** (`attendance_deficit`)
   - Weight: Default 0.30
   - Metric: `(1.0 - attendance_rate)`
2. **Assessment Grade Deficit** (`assessment_deficit`)
   - Weight: Default 0.25
   - Metric: `(1.0 - assessment_average_percentage)`
3. **Missing Assignments** (`missing_assignments`)
   - Weight: Default 0.20
   - Metric: `(missing_submission_count / total_assignments)`
4. **LMS Engagement Deficit** (`lms_engagement_deficit`)
   - Weight: Default 0.10
   - Metric: Normalized engagement time drop below target baseline.
5. **Trend Deterioration Signal** (`trend_deterioration`)
   - Weight: Default 0.15
   - Metric: Trend signal value computed by M4 (e.g. sudden drop week-over-week or steady decline).

## 2. Band Thresholds

Total Composite Risk Score = `SUM(factor.weight * factor.value)` (scale 0.0 to 1.0)

- **`low`**: Risk score < 0.25
- **`moderate`**: 0.25 <= Risk score < 0.50
- **`high`**: 0.50 <= Risk score < 0.75
- **`critical`**: Risk score >= 0.75

## 3. Explainability Guarantee
Each generated `RiskSnapshot` must contain a ranked array of `factors[]` sorted descending by their `contribution` (`weight * value`). The system always presents the top factors explaining why a student fell into a specific risk band.
