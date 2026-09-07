# Academic Risk Radar — In-Depth Stage-Wise Development & Evaluation Blueprint

> **SINGLE SOURCE OF TRUTH FOR AI AGENTS & TEAM MEMBERS**
> Read this entire document to understand the exact, granular requirements for each development stage. When instructed to work on a specific Stage (Stage 1, Stage 2, or Stage 3), implement **ONLY** the items explicitly listed under "WHAT TO BUILD IN THIS STAGE" for your assigned module. Do not build future stage requirements ahead of time.

---

## 1. Master Evaluation Alignment & Timeline Mapping

| Evaluation Milestone | Academic Week | Project Stage | Marks | Primary Focus | Gate Status |
|---|---|---|---|---|---|
| **Foundation Review** | Week 5 | **Stage 1** | **25 Marks** | Monorepo Setup, Shared Types, Schemas, CSV Parsers, Pure Scoring Engine Logic, Seed Data Script, Basic Route Scaffolds | **ACTIVE STAGE (Week 1)** |
| **Functional System Review** | Week 9 | **Stage 2** | **30 Marks** | Full DB Persistence, BullMQ Queue Workers, REST APIs, RBAC Middleware, Negative Access Tests, Alert Inbox, Intervention Logging | Defer to Stage 2 |
| **Product Readiness & Defence** | Week 13 | **Stage 3** | **45 Marks** | Role Dashboards (2-4 charts/role), Performance Optimization, Docker Deployment, CI/CD, Edge Case Handling, AI Engineering Log | Defer to Stage 3 |

---

## 2. Team Member 1 (Pawan): Detailed Blueprint (Modules M3 & M8)

### 📌 Module Ownership
- **Module M3**: Risk Scoring Engine (`packages/scoring-engine`, `apps/api/src/modules/scoring/`, `apps/workers/src/scoring.worker.ts`)
- **Module M8**: Configuration & Audit (`apps/api/src/modules/admin/`, `apps/web/app/(admin)/`)

---

### 🔹 STAGE 1: Week 5 Evaluation — Foundation Review (25 Marks)

#### Owned Files in Stage 1:
- `package.json`, `tsconfig.json`, `.gitignore`
- `packages/config/*`
- `packages/shared-types/index.ts`
- `packages/scoring-engine/package.json`, `tsconfig.json`, `src/index.ts`, `src/engine.ts`, `tests/engine.test.ts`
- `docs/glossary.md`, `docs/api-contract.md`, `docs/model-specification.md`, `docs/build-plan.md`, `docs/stage-wise-development-plan.md`
- `infra/docker-compose.yml`, `.github/workflows/ci.yml`
- `apps/api/src/db/schemas.ts` (Mongoose models for `Student`, `RiskSnapshot`, `RiskModelVersion`, `AuditEntry`, `User`)
- `apps/api/src/modules/scoring/index.ts` (Scaffold Express Router)
- `apps/api/src/modules/admin/index.ts` (Scaffold Express Router)

#### Granular Tasks for Stage 1:
1. **Monorepo Environment Setup**: Configure `npm workspaces` for `apps/*` and `packages/*`. Ensure `npm run typecheck` works across all workspaces.
2. **Shared Types Contract**: Export all 17 canonical domain interfaces in `packages/shared-types/index.ts` matching Section 1 of the Master Build Plan.
3. **Pure Scoring Engine (`packages/scoring-engine/src/engine.ts`)**:
   - Implement `computeRiskSnapshot(studentId, metrics, modelVersion, computedAt)`:
     - Input metrics: `attendanceRate`, `assessmentAvg`, `missingAssignmentsRatio`, `lmsEngagementRatio`, `trendDeteriorationSignal`.
     - Factor values: `attendance_deficit` = `1.0 - attendanceRate`, `assessment_deficit` = `1.0 - assessmentAvg`, `missing_assignments` = `missingAssignmentsRatio`, `lms_engagement_deficit` = `1.0 - lmsEngagementRatio`, `trend_deterioration` = `trendDeteriorationSignal`.
     - Contribution: `weight * factorValue`. Total Score: `SUM(contribution)`.
     - Band assignment based on thresholds: `low` (<0.25), `moderate` (>=0.25), `high` (>=0.50), `critical` (>=0.75).
     - Sort `factors[]` descending by `contribution`.
   - Implement `previewModelImpact(studentsWithMetrics, currentVersion, newVersion)` function.
4. **Automated Scoring Unit Tests (`packages/scoring-engine/tests/engine.test.ts`)**:
   - Write tests for byte-identical reproducibility (same inputs -> identical output), factor sorting, threshold boundary conditions, and preview impact calculations.
5. **Database Schemas (`apps/api/src/db/schemas.ts`)**:
   - Define Mongoose schemas for `Student`, `RiskSnapshot` (append-only), `RiskModelVersion`, `AuditEntry` (append-only), and `User`.

#### ✅ STAGE 1 CHECKLIST (WHAT TO BUILD NOW):
- [x] Monorepo npm workspaces configured.
- [x] All 17 canonical types exported from `@academic-risk-radar/shared-types`.
- [x] Pure deterministic scoring function `computeRiskSnapshot()` built and tested.
- [x] Unit test suite passing (`npm test --workspace=packages/scoring-engine`).
- [x] Mongoose models defined in `apps/api/src/db/schemas.ts`.

#### ❌ STAGE 1 BOUNDARY (WHAT NOT TO BUILD YET):
- Do NOT build live BullMQ queue background processing.
- Do NOT write live API endpoints for band preview or model version activation.
- Do NOT implement RBAC middleware logic yet.

---

### 🔹 STAGE 2: Week 9 Evaluation — Functional System Review (30 Marks)

#### Owned Files in Stage 2:
- `apps/api/src/auth/rbac.middleware.ts`
- `apps/api/src/modules/scoring/scoring.controller.ts`
- `apps/api/src/modules/admin/admin.controller.ts`
- `apps/api/src/modules/admin/audit.service.ts`
- `apps/workers/src/scoring.worker.ts`
- `apps/api/tests/rbac.test.ts`

#### Granular Tasks for Stage 2:
1. **RBAC & Access Control Middleware (`apps/api/src/auth/rbac.middleware.ts`)**:
   - Implement `authenticateUser`, `requireRole`, and `enforceStudentAccessControl`.
   - **Security Rules**:
     - `student` can ONLY fetch their own record (`req.user.id === params.id`).
     - `admin` requesting API endpoints receives aggregated risk data ONLY — raw `assessmentRecords` and `attendanceRecords` projections are strictly stripped.
2. **Student Risk API (`GET /api/v1/students/:id/risk`)**:
   - Fetch latest snapshot from append-only `riskSnapshots` collection sorted by `computedAt: -1`.
   - Return HTTP 403/404 if a student attempts to query another student's ID.
3. **Model Version Management API (`apps/api/src/modules/admin/admin.controller.ts`)**:
   - `GET /api/v1/admin/model-versions`: List all model configuration versions.
   - `POST /api/v1/admin/model-versions`: Compute band-change impact preview against historical student data before committing. If `commit: true`, save version and emit audit entry.
   - `POST /api/v1/admin/model-versions/:v/activate`: Activate version, update `effectiveFrom`, emit audit entry.
   - `GET /api/v1/admin/audit`: Paginated, filterable audit log reader.
4. **Audit Logging Service (`apps/api/src/modules/admin/audit.service.ts`)**:
   - Write immutable `AuditEntry` documents to `auditEntries` collection on every model change or activation.
5. **BullMQ Scoring Worker (`apps/workers/src/scoring.worker.ts`)**:
   - Build worker listening on `risk-scoring-queue`. Executes `computeRiskSnapshot()` per student and appends new snapshot to MongoDB.
6. **Automated RBAC Security Tests**:
   - Write tests asserting HTTP 403 on unauthorized student queries and admin raw marks access.

---

### 🔹 STAGE 3: Week 13 Evaluation — Product Readiness (45 Marks)

#### Owned Files in Stage 3:
- `apps/web/app/(admin)/model-versions/page.tsx`
- `apps/web/app/(admin)/audit/page.tsx`
- `infra/docker-compose.yml`
- `.github/workflows/ci.yml`

#### Granular Tasks for Stage 3:
1. **Admin Model Version UI (`/admin/model-versions`)**:
   - Build UI displaying active weights/thresholds, custom weight editor form, live band-change preview summary, and activation button.
2. **Admin Audit Trail UI (`/admin/audit`)**:
   - Build interactive table displaying timestamped audit entries with entity type and actor filtering.
3. **Scoring Engine Optimization & Benchmarking**:
   - Ensure scoring engine executes in < 5ms per student for batch scaling.
4. **CI/CD & Docker Verification**:
   - Ensure Docker Compose launches `mongodb`, `redis`, `api`, `workers`, and `web` cleanly.

---

## 3. Team Member 2: Detailed Blueprint (Modules M4 & M5)

### 📌 Module Ownership
- **Module M4**: Trend & Anomaly Detection (`apps/api/src/modules/trends/`, seed data generator)
- **Module M5**: Alert Routing & Mentor Inbox (`apps/api/src/modules/alerts/`, `apps/workers/src/escalation.worker.ts`, `apps/web/app/(mentor)/inbox/`)

---

### 🔹 STAGE 1: Week 5 Evaluation — Foundation Review (25 Marks)

#### Owned Files in Stage 1:
- `apps/api/src/modules/trends/index.ts`
- `apps/api/src/modules/trends/seed-generator.ts`
- `apps/api/src/modules/alerts/index.ts`
- `apps/api/src/db/schemas.ts` (Alert & MentorAssignment schema definitions)

#### Granular Tasks for Stage 1:
1. **Synthetic Seed Data Generator (`apps/api/src/modules/trends/seed-generator.ts`)**:
   - Write a script that fabricates multi-week historical records matching `shared-types` exactly: `attendanceRecords`, `assessmentRecords`, `assignmentSubmissions`, and `lmsActivity`.
   - Deliberately engineer 15-20% of synthetic students to show downward academic deterioration (e.g. attendance dropping from 90% -> 50% over 4 weeks).
2. **Rolling Baseline Math Helper**:
   - Implement `calculateRollingBaseline(records, windowWeeks)` to compute trailing metric averages per student.
3. **Alert Schema Definition**:
   - Add `Alert` (`studentId`, `mentorId`, `riskSnapshotId`, `status`, `createdAt`, `acknowledgedAt`, `escalatedAt`, `slaDeadline`) and `MentorAssignment` models to `schemas.ts`.

#### ✅ STAGE 1 CHECKLIST (WHAT TO BUILD NOW):
- [x] Synthetic seed data script generating realistic student history with downward trends.
- [x] Mathematical rolling baseline computation helper.
- [x] `Alert` and `MentorAssignment` schema definitions in `schemas.ts`.

#### ❌ STAGE 1 BOUNDARY (WHAT NOT TO BUILD YET):
- Do NOT build BullMQ SLA escalation workers.
- Do NOT write alert deduplication or auto-routing API logic.
- Do NOT build the Mentor Inbox UI page.

---

### 🔹 STAGE 2: Week 9 Evaluation — Functional System Review (30 Marks)

#### Owned Files in Stage 2:
- `apps/api/src/modules/trends/trends.service.ts`
- `apps/api/src/modules/alerts/alerts.controller.ts`
- `apps/workers/src/escalation.worker.ts`

#### Granular Tasks for Stage 2:
1. **Trend & Anomaly Signals Engine (`trends.service.ts`)**:
   - Calculate slow deterioration against student's baseline and sudden-drop rules (e.g. >20% week-over-week drop).
   - Produce `trendDeteriorationSignal` (0.0 to 1.0) passed to Team Member 1's scoring engine.
2. **Alert Generation & Deduplication Logic**:
   - Given a `RiskSnapshot` with `band` = `high` or `critical`, look up `mentorId` via `MentorAssignment`.
   - **Deduplication Rule**: Check for existing open alert for the same student. If open alert exists, update `riskSnapshotId`; do NOT create duplicate open alerts.
3. **Mentor Inbox API (`alerts.controller.ts`)**:
   - `GET /api/v1/alerts?mentorId=&status=`: Fetch alerts assigned to mentor.
   - `POST /api/v1/alerts/:id/acknowledge`: Set `status: "acknowledged"`, update `acknowledgedAt`.
4. **BullMQ SLA Escalation Worker (`apps/workers/src/escalation.worker.ts`)**:
   - Worker checks for open alerts past `slaDeadline`. Sets `status: "escalated"`, updates `escalatedAt`, and emits HoD notification.

---

### 🔹 STAGE 3: Week 13 Evaluation — Product Readiness (45 Marks)

#### Owned Files in Stage 3:
- `apps/web/app/(mentor)/inbox/page.tsx`
- `apps/web/app/(mentor)/inbox/components/*`

#### Granular Tasks for Stage 3:
1. **Mentor Alert Inbox UI (`/inbox`)**:
   - Build interactive inbox page with status tabs (`open`, `acknowledged`, `escalated`, `closed`), SLA countdown badges, and one-click acknowledge button.
2. **Trend Anomaly Tuning**:
   - Refine week-over-week sudden drop sensitivity parameters based on seed data runs.

---

## 4. Team Member 3: Detailed Blueprint (Modules M1 & M2)

### 📌 Module Ownership
- **Module M1**: Ingestion & Normalisation (`apps/api/src/modules/ingestion/`, CSV importers, quarantine collection)
- **Module M2**: Student Academic Profile (`apps/api/src/modules/profile/`, consolidated profile view)

---

### 🔹 STAGE 1: Week 5 Evaluation — Foundation Review (25 Marks)

#### Owned Files in Stage 1:
- `apps/api/src/modules/ingestion/index.ts`
- `apps/api/src/modules/ingestion/csv-importers.ts`
- `apps/api/src/modules/profile/index.ts`
- `apps/api/src/db/schemas.ts` (`quarantine` collection schema)

#### Granular Tasks for Stage 1:
1. **CSV Importers (`csv-importers.ts`)**:
   - Build file import functions for 4 source data types: `AttendanceRecord`, `AssessmentRecord`, `AssignmentSubmission`, and `LmsActivity`.
2. **Row Validation & Quarantine Logic**:
   - Validate imported fields (e.g. check score <= maxScore, valid date strings, non-empty student IDs).
   - If a row is malformed, write to `quarantine` collection with `originalCollection`, `rawRecord`, `reason`, and `ingestedAt`. Never throw or crash the import batch.
3. **Consolidated Profile Logic Placeholder**:
   - Implement initial aggregation function combining student records into one profile structure.

#### ✅ STAGE 1 CHECKLIST (WHAT TO BUILD NOW):
- [x] CSV importers built for all 4 source types.
- [x] Row validation writing invalid records to `quarantine` collection with explicit reasons.
- [x] Initial profile aggregation function signature defined.

#### ❌ STAGE 1 BOUNDARY (WHAT NOT TO BUILD YET):
- Do NOT build live API sync endpoints (`POST /connectors/:name/sync`).
- Do NOT build live third-party ERP/LMS integrations.
- Do NOT build quarantine resolution admin UI pages.

---

### 🔹 STAGE 2: Week 9 Evaluation — Functional System Review (30 Marks)

#### Owned Files in Stage 2:
- `apps/api/src/modules/ingestion/ingestion.controller.ts`
- `apps/api/src/modules/profile/profile.controller.ts`
- `apps/workers/src/ingestion.worker.ts`

#### Granular Tasks for Stage 2:
1. **Connector Sync API (`ingestion.controller.ts`)**:
   - `POST /api/v1/admin/connectors/:name/sync`: Trigger CSV import run.
   - `GET /api/v1/admin/connectors/status`: Return summary of total imported vs quarantined rows.
2. **Idempotency Guarantee**:
   - Ensure re-running file import with identical records does not create duplicate database entries (use unique compound indexes or upserts).
3. **Student Profile Endpoint (`profile.controller.ts`)**:
   - `GET /api/v1/students/:id/profile`: Return consolidated academic profile summarizing attendance rate, assessment average, missing assignment count, and LMS total duration.

---

### 🔹 STAGE 3: Week 13 Evaluation — Product Readiness (45 Marks)

#### Owned Files in Stage 3:
- `apps/web/app/(admin)/connectors/page.tsx`

#### Granular Tasks for Stage 3:
1. **Connector Status & Quarantine UI (`/admin/connectors`)**:
   - Build admin page showing import sync history, success counts, and table of quarantined records with failure reasons.
2. **Query Performance Optimization**:
   - Add MongoDB compound indexes on `(studentId, date)` and `(courseId, studentId)` for instant profile aggregations.

---

## 5. Team Member 4: Detailed Blueprint (Modules M6 & M7)

### 📌 Module Ownership
- **Module M6**: Intervention & Outcome Tracking (`apps/api/src/modules/interventions/`, `apps/web/app/(mentor)/interventions/`)
- **Module M7**: Dashboards & Reporting (`apps/api/src/modules/analytics/`, role dashboards)

---

### 🔹 STAGE 1: Week 5 Evaluation — Foundation Review (25 Marks)

#### Owned Files in Stage 1:
- `apps/api/src/modules/interventions/index.ts`
- `apps/api/src/modules/analytics/index.ts`
- `apps/web/app/(student)/risk/page.tsx`
- `apps/web/app/(instructor)/sections/page.tsx`, `(mentor)/inbox/page.tsx`, `(hod)/dashboard/page.tsx`, `(dean)/dashboard/page.tsx`

#### Granular Tasks for Stage 1:
1. **Intervention Schema Definition**:
   - Define `Intervention` schema in `schemas.ts` (`alertId`, `mentorId`, `action`, `notes`, `createdAt`, `followUpDate`, `outcome`, `outcomeRecordedAt`).
2. **Non-Alarming Student Risk UI (`/student/risk`)**:
   - Build Next.js page displaying risk standing and contributing factors in plain language, using calm color palettes (no red/alarming styling for high risk).
3. **Role Page Route Scaffolding**:
   - Create clean page scaffolds in `apps/web/app/` for all 5 non-admin roles.

#### ✅ STAGE 1 CHECKLIST (WHAT TO BUILD NOW):
- [x] `Intervention` schema defined in `schemas.ts`.
- [x] Supportive, non-alarming student risk UI built in `apps/web/app/(student)/risk/page.tsx`.
- [x] Route scaffolds created for Instructor, Mentor, HoD, and Dean pages.

#### ❌ STAGE 1 BOUNDARY (WHAT NOT TO BUILD YET):
- Do NOT build multi-chart analytics dashboards.
- Do NOT build intervention logging or outcome update API endpoints.

---

### 🔹 STAGE 2: Week 9 Evaluation — Functional System Review (30 Marks)

#### Owned Files in Stage 2:
- `apps/api/src/modules/interventions/interventions.controller.ts`
- `apps/api/src/modules/analytics/analytics.controller.ts`
- `apps/web/app/(mentor)/interventions/page.tsx`

#### Granular Tasks for Stage 2:
1. **Intervention Logging API (`interventions.controller.ts`)**:
   - `POST /api/v1/interventions`: Record mentor action linked to `alertId`.
   - `PATCH /api/v1/interventions/:id/outcome`: Update intervention outcome (e.g., "improved", "no_change").
2. **Mentor Intervention UI (`/interventions`)**:
   - Build form allowing mentors to record actions, notes, follow-up dates, and update outcomes.
3. **Analytics API Endpoints (`analytics.controller.ts`)**:
   - `GET /api/v1/analytics/department/:id`: Return department risk band distributions for HoD.
   - `GET /api/v1/analytics/institution`: Return institution-wide risk trends for Dean.

---

### 🔹 STAGE 3: Week 13 Evaluation — Product Readiness (45 Marks)

#### Owned Files in Stage 3:
- `apps/web/app/(instructor)/sections/page.tsx`
- `apps/web/app/(hod)/dashboard/page.tsx`
- `apps/web/app/(dean)/dashboard/page.tsx`

#### Granular Tasks for Stage 3:
1. **Role Dashboards (2-4 Charts per Role)**:
   - **Instructor Dashboard**: Section risk breakdown & attendance deficit distribution charts.
   - **HoD Dashboard**: Department-wide risk band pie chart & SLA escalation trend chart.
   - **Dean Dashboard**: Cross-department comparison & intervention success rate charts.
2. **Closed-Loop Outcome Tracking**:
   - Display pre-intervention vs post-intervention student risk band improvements.
3. **AI Engineering Log Documentation**:
   - Maintain `docs/ai-engineering-log.md` detailing prompts, verification steps, and code changes for final defense viva.

---

## 6. Stage-Wise Test & Verification Command Reference

```bash
# STAGE 1 VERIFICATION COMMANDS (Run during Week 5)
npm run build --workspace=packages/shared-types
npm run build --workspace=packages/scoring-engine
npm test --workspace=packages/scoring-engine
npm run typecheck

# STAGE 2 VERIFICATION COMMANDS (Run during Week 9)
npm run test --workspace=apps/api
npm --prefix apps/api run test:rbac

# STAGE 3 VERIFICATION COMMANDS (Run during Week 13)
docker-compose -f infra/docker-compose.yml up --build
npm run build --workspace=apps/web
```
