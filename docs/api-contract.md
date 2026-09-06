# API Surface & Contract

All API endpoints follow REST conventions and return JSON responses.

```
GET  /api/v1/students/:id/risk          # M3 — own risk + factors, or mentor/HoD/Dean view
GET  /api/v1/students/:id/profile       # M2 — consolidated academic standing
GET  /api/v1/alerts?mentorId=&status=   # M5 — mentor alert inbox
POST /api/v1/alerts/:id/acknowledge     # M5 — acknowledge alert
POST /api/v1/interventions              # M6 — record mentoring action
PATCH /api/v1/interventions/:id/outcome # M6 — update intervention outcome
GET  /api/v1/analytics/department/:id   # M7 — department level reporting (HoD)
GET  /api/v1/analytics/institution      # M7 — institutional level reporting (Dean)
GET  /api/v1/admin/model-versions       # M8 — list scoring model versions
POST /api/v1/admin/model-versions       # M8 — create model version & preview band-change impact
POST /api/v1/admin/model-versions/:v/activate  # M8 — activate model version
GET  /api/v1/admin/audit?entityType=&from=&to= # M8 — fetch audit entries
POST /api/v1/admin/connectors/:name/sync       # M1 — trigger data sync/import
GET  /api/v1/admin/connectors/status           # M1 — connector status overview
```

## Security & Field-Level Access Control Rules
- `student`: Can only call `GET /api/v1/students/:id/risk` where `:id` matches their authenticated user ID.
- `admin`: Calling any endpoint receives aggregated risk snapshots and factor metrics only; raw `assessmentRecords` and `attendanceRecords` are filtered out at the API response projection layer.
- `mentor`: Can access alerts, students, and interventions for assigned mentees only.
