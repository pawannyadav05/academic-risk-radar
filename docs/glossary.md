# Canonical Glossary

This table lists the single canonical name for every domain noun in the **Academic Risk Radar** platform. Do not deviate from these terms in code, API parameters, or schema definitions.

| Concept | Canonical name | Never use |
|---|---|---|
| Student identifier | `studentId` | `sid`, `student_id` |
| Risk category | `band` | `riskLevel`, `score` |
| When a snapshot was computed | `computedAt` | `scoredAt`, `date` |
| Model config version | `modelVersion` / `RiskModelVersion.version` | `configVersion` |
| Ranked reason for a band | `factors` (array of `RiskFactor`) | `reasons`, `drivers` |
| Alert lifecycle state | `status` (`AlertStatus`) | `state` |
| Mentor's action on an alert | `acknowledgedAt` | `ackTime`, `seenAt` |
| Recorded mentoring action | `intervention` (`Intervention`) | `action` alone, `note` |
| Person assigned to mentor a student | `mentorAssignment` (`MentorAssignment`) | `mentorship` |

---

## Allowed Roles (`UserRole`)

- `student` — Can view their own risk band and contributing factors.
- `instructor` — Can view course section aggregations.
- `mentor` — Receives risk alerts and logs interventions.
- `hod` — Head of Department; receives escalated SLA alerts and department analytics.
- `dean` — Institutional level overview and reporting.
- `admin` — Manages model versions, system connectors, and views audit logs.
