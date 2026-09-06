# Module M5: Alert Routing & Mentor Inbox (Owner: Team Member 2)

Build alert generation, deduplication, mentor inbox, and SLA escalation worker in this directory.
Endpoints to expose:
- `GET /api/v1/alerts?mentorId=&status=`
- `POST /api/v1/alerts/:id/acknowledge`

Use `@academic-risk-radar/shared-types` for data structures.
