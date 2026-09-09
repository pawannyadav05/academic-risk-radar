# Academic Risk Radar — Master Build Plan

**Read this entire file before writing any code, regardless of which module you're building.** This file is the single source of truth. Build exactly what is specified for your assigned module — no additional features, no "nice to have" extras, no gold-plating — and implement every listed field, endpoint, and behavior in full. Do not invent scope in either direction.

---

## 0. Project context (applies to every module)

**Project:** Academic Early-Warning and Mentoring Intervention Platform ("Academic Risk Radar"). It consolidates attendance, assessment, assignment, and LMS-engagement signals into a single student-level view, detects meaningful deterioration against each student's own baseline, and routes explained alerts to the assigned faculty mentor, who records the intervention and its outcome.

**Track:** J — Next.js (frontend) + Node.js (backend API) + MongoDB (database) + BullMQ/Redis (queued jobs).

**Governance constraint — non-negotiable, applies to every module that touches student data:** this is an early-support system, never a disciplinary one. Risk bands are visible to the student themselves with contributing factors; they are never exposed to recruiters, never printed on a transcript, and never used as an eligibility filter anywhere. This is enforced as an access-control rule in the backend authorization layer, not a UI convention or a comment.

**Team:** 4 people — Team Member 1 (Pawan), Team Member 2 (Vani), Team Member 3 (Nilesh), and Team Member 4 (Piyush Kumar Singh). Maximum 3 people are actively working at any given time (the 4th may be unavailable on a given day/week) — this affects scheduling, not module ownership; every person below still owns their assigned modules end to end.

**Timeline:** 7–8 weeks total, full spec scope (all 8 modules, all 6 roles) — nothing is cut for time. AI coding tools (Antigravity / Claude Code) generate scaffolding, CRUD, and boilerplate; humans review and hand-write scoring logic, access-control rules, and integration.

**Non-negotiables regardless of module:**
- Every risk band ships with a ranked, explainable list of contributing factors traceable to source records — no unexplained score.
- Field-level access control: a student can never read another student's data; an administrator can never read raw marks. Both are asserted by automated negative-case tests.
- Scoring must be reproducible: same inputs + same model version → same band, every time. No wall-clock-dependent or random logic in the scoring path.
- No ML/scikit-learn model anywhere — a weighted rules engine is what this project uses, and it's also what keeps scoring explainable.
- No real-time/websocket scoring — scoring runs as a queued batch job (BullMQ), never inline in a request.
- No in-process cron — use BullMQ repeatable jobs.
- Every third-party integration (ERP/LMS/SSO) sits behind an adapter interface with a working file-import/CSV fallback.
- No real institutional data exists yet — every module is developed and tested against synthetic/seed data matching the real schema exactly, so swapping in real data later requires no code changes.

**Repo:** already set up by Team Member 1 at the GitHub URL shared in the team group. Clone it — do not create your own folder structure. The full layout is in Section 2. Work only inside your assigned module's folder(s); do not edit another person's module folder without coordinating in the group first.

---

## 1. Shared contract — build this before any module-specific work starts

This must exist and be pushed to the repo before anyone writes module logic. Whoever is first to start (or all four together in one sitting) builds these three artifacts:

**`packages/shared-types/index.ts`** — every type below, and only these types. No module redefines its own version of any of these:

```typescript
export interface Student {
  _id: string;
  name: string;
  enrolmentId: string;
  sectionIds: string[];
  programme: string;
}

export interface AttendanceRecord {
  studentId: string;
  sectionId: string;
  date: string;       // ISO date
  status: "present" | "absent" | "late";
  sourceRef: string;
}

export interface AssessmentRecord {
  studentId: string;
  courseId: string;
  type: string;
  score: number;
  maxScore: number;
  date: string;
  sourceRef: string;
}

export interface AssignmentSubmission {
  studentId: string;
  courseId: string;
  assignmentId: string;
  submittedAt: string | null;
  status: "submitted" | "missing" | "late";
}

export interface LmsActivity {
  studentId: string;
  courseId: string;
  date: string;
  activityType: string;
  durationSec: number;
}

export interface QuarantineRecord {
  originalCollection: string;
  rawRecord: unknown;
  reason: string;
  ingestedAt: string;
}

export type RiskBand = "low" | "moderate" | "high" | "critical";

export interface RiskFactor {
  name: string;
  weight: number;
  contribution: number;
  value: number;
}

export interface RiskSnapshot {
  _id: string;
  studentId: string;
  computedAt: string;
  modelVersion: string;
  band: RiskBand;
  factors: RiskFactor[];
}

export interface RiskModelVersion {
  version: string;
  effectiveFrom: string;
  weights: Record<string, number>;
  thresholds: Record<RiskBand, number>;
  createdBy: string;
  previousVersion: string | null;
}

export type AlertStatus = "open" | "acknowledged" | "escalated" | "closed";

export interface Alert {
  _id: string;
  studentId: string;
  mentorId: string;
  riskSnapshotId: string;
  status: AlertStatus;
  createdAt: string;
  acknowledgedAt: string | null;
  escalatedAt: string | null;
  slaDeadline: string;
}

export interface Intervention {
  _id: string;
  alertId: string;
  mentorId: string;
  action: string;
  notes: string;
  createdAt: string;
  followUpDate: string | null;
  outcome: string | null;
  outcomeRecordedAt: string | null;
}

export interface MentorAssignment {
  studentId: string;
  mentorId: string;
  assignedFrom: string;
  assignedTo: string | null;
}

export type UserRole = "student" | "instructor" | "mentor" | "hod" | "dean" | "admin";

export interface User {
  _id: string;
  role: UserRole;
  name: string;
  email: string;
  departmentId?: string;
  sectionIds?: string[];
}

export interface AuditEntry {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  before: unknown;
  after: unknown;
  timestamp: string;
}
```

**`glossary.md`** — canonical name for every domain noun. Do not deviate from this list:

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

**`api-contract.md`** — the full endpoint list in Section 4 below, copied verbatim into the repo.

**RBAC role list** — exactly six roles, defined in `shared-types.ts` as `UserRole`: `student`, `instructor`, `mentor`, `hod`, `dean`, `admin`. Permissions per role are defined in Section 5 under each module that enforces them — do not add or remove roles.

---

## 2. Repo structure (already set up — clone, do not recreate)

```
academic-risk-radar/
├── apps/
│   ├── web/                      # Next.js frontend
│   │   ├── app/
│   │   │   ├── (student)/risk/
│   │   │   ├── (instructor)/sections/
│   │   │   ├── (mentor)/inbox/
│   │   │   ├── (mentor)/interventions/
│   │   │   ├── (hod)/dashboard/
│   │   │   ├── (dean)/dashboard/
│   │   │   └── (admin)/{model-versions,connectors,audit,users}/
│   │   ├── components/
│   │   ├── lib/api-client.ts
│   │   └── lib/auth.ts
│   ├── api/                      # Node/Express (or NestJS) REST API
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── ingestion/         # M1
│   │   │   │   ├── profile/           # M2
│   │   │   │   ├── scoring/           # M3
│   │   │   │   ├── trends/            # M4
│   │   │   │   ├── alerts/            # M5
│   │   │   │   ├── interventions/     # M6
│   │   │   │   ├── analytics/         # M7
│   │   │   │   └── admin/             # M8
│   │   │   ├── auth/                  # RBAC middleware, field-level guards
│   │   │   ├── db/                    # Mongo models/schemas, indexes
│   │   │   └── shared/
│   │   └── package.json
│   └── workers/                  # BullMQ queue consumers — separate deployable
│       ├── src/
│       │   ├── scoring.worker.ts      # M3 (+ M4 rules inline)
│       │   ├── ingestion.worker.ts    # M1
│       │   └── escalation.worker.ts   # M5 SLA breach → HoD
│       └── package.json
├── packages/
│   ├── shared-types/               # Section 1 — every collection/API type
│   ├── scoring-engine/             # pure TS, zero framework imports, unit-testable in isolation
│   └── config/                     # eslint, tsconfig base
├── infra/
│   ├── docker-compose.yml          # mongo, redis, api, workers, web
│   └── github-actions/             # CI: lint + typecheck + test on every PR
├── docs/
│   ├── glossary.md
│   ├── api-contract.md
│   └── model-specification.md      # every factor, weight, source field, band definition
└── README.md
```

**Git rule:** one feature branch per module (`feat/m3-scoring`, `feat/m5-alerts`, etc.). Changes to `packages/shared-types` go through their own PR, reviewed by whoever's module is affected, merged before dependent module PRs. Every PR must pass lint + typecheck + tests in CI before merge.

---

## 3. Full data model (reference — implement only the collections your module owns; read others as needed)

See the `shared-types` interfaces in Section 1 for exact shapes. MongoDB collections: `students`, `enrolments`, `courses`, `sections`, `attendanceRecords`, `assessmentRecords`, `assignmentSubmissions`, `lmsActivity`, `quarantine`, `riskSnapshots` (append-only, indexed on `(studentId, computedAt)`), `riskModelVersions`, `alerts` (indexed on `(mentorId, status)` and `(slaDeadline, status)`), `interventions`, `mentorAssignments`, `auditEntries`, `users`.

---

## 4. Full API surface (reference — implement only the routes your module owns)

```
GET  /api/v1/students/:id/risk          # M3 — own risk + factors, or mentor/HoD/Dean view
GET  /api/v1/students/:id/profile       # M2
GET  /api/v1/alerts?mentorId=&status=   # M5
POST /api/v1/alerts/:id/acknowledge     # M5
POST /api/v1/interventions              # M6
PATCH /api/v1/interventions/:id/outcome # M6
GET  /api/v1/analytics/department/:id   # M7
GET  /api/v1/analytics/institution      # M7
GET  /api/v1/admin/model-versions       # M8
POST /api/v1/admin/model-versions       # M8 — create + preview band-change impact
POST /api/v1/admin/model-versions/:v/activate  # M8
GET  /api/v1/admin/audit?entityType=&from=&to= # M8
POST /api/v1/admin/connectors/:name/sync       # M1
GET  /api/v1/admin/connectors/status           # M1
```

Every list/analytics endpoint is paginated and role-filtered server-side — never fetch-all-then-filter-in-the-frontend.

---

## 5. Module briefs — one per person

Paste your own section below (Sections 0–4 plus your one numbered section) into Antigravity when you start.

### 5.1 — TEAM MEMBER 1(Pawan): M3 (Risk Scoring Engine) + M8 (Configuration & Audit)

**Build:**
- A versioned rule-and-weight scoring engine (`packages/scoring-engine`, pure TypeScript, zero framework imports, unit-testable in isolation) that takes a student's aggregated profile (from M2) and trend signals (from M4) and produces a `RiskSnapshot`: a `band` plus a ranked `factors[]` array, each factor showing its `name`, `weight`, `contribution`, and raw `value`.
- The engine must be deterministic: same input document + same `modelVersion` → identical output, every run. No randomness, no current-time-dependent branching inside the scoring function itself.
- `riskModelVersions` collection: each version has its own `weights`, `thresholds`, `effectiveFrom` date, `createdBy`, and a pointer to `previousVersion` for rollback.
- Admin endpoints (M8): `GET/POST /api/v1/admin/model-versions`, `POST /api/v1/admin/model-versions/:v/activate`. The `POST` (create) endpoint must run a **preview**: before committing a new version, compute how many currently-scored students would change band under the new weights/thresholds, and return that count to the caller — do not commit until the admin confirms.
- Audit log: `auditEntries` collection is append-only. Every model-version change, every activation/rollback writes one entry with `before`/`after` snapshots. `GET /api/v1/admin/audit` supports filtering by `entityType`, `from`, `to`, and pagination.
- A BullMQ worker (`scoring.worker.ts`) that runs the scoring engine as a queued batch job over all students, writes a new `RiskSnapshot` per student (append — never overwrite a previous snapshot), and is triggerable both on a schedule and manually per cohort.
- Field-level access control on `/students/:id/risk`: a student can only ever fetch their own record; an admin calling any endpoint must never receive raw `assessmentRecords`/`attendanceRecords` — only aggregated risk data.

**Depends on:** M2's student profile (Team Member 3) as scoring input; M4's trend signals (Team Member 2) as an additional scoring input.

**Produces for others:** `RiskSnapshot` documents, consumed by M5 (Team Member 2, alert generation) and M7 (Team Member 4, dashboards).

**Acceptance criteria:**
- Running the scoring job twice on identical input + same model version produces byte-identical `factors[]` and `band`.
- Every `RiskSnapshot` has at least 3 ranked factors.
- Automated test: student A's request for student B's `/risk` endpoint returns 403/404, never data.
- Automated test: admin's request for raw `assessmentRecords` returns 403/404.
- Model-version preview endpoint returns an accurate changed-band count before any commit.

**Do NOT build:** ingestion connectors (M1), alert routing/mentor inbox (M5), intervention forms (M6), dashboards (M7). If your scoring logic needs a field that doesn't exist yet in M2's profile output, flag it in the team channel and get it added to `shared-types` first — do not invent a workaround field locally.

---

### 5.2 — TEAM MEMBER 2(Vani): M4 (Trend & Anomaly Detection) + M5 (Alert Routing & Mentor Inbox)

**Build:**
- A trend-detection module that, for each student, computes a rolling baseline (e.g. trailing 4–6 week average) per relevant metric (attendance rate, average score, submission rate, LMS activity) from M1's normalised source collections, and flags: (a) slow deterioration against the student's own baseline, and (b) a sudden-drop rule (e.g. a defined percentage drop week-over-week). Output is a set of trend signals per student, passed into Team Member 1's scoring engine as one category of risk factors — do not build a separate ML model; this is arithmetic over the aggregated collections.
- Since no real institutional data exists yet, also own the **synthetic seed-data generator**: a script that fabricates several weeks of `attendanceRecords`, `assessmentRecords`, `assignmentSubmissions`, and `lmsActivity` for a set of fake students, deliberately including a few students with an engineered downward trend, so M4 (and the demo) has something real to detect. Generated data must match the `shared-types` schema exactly.
- `alerts` collection and routing logic (M5): given a `RiskSnapshot` that crosses a threshold, generate an `Alert` linked to the correct `mentorId` via `mentorAssignments`. Deduplicate — do not create a new alert for the same underlying issue every time the batch runs; update/extend the existing open alert instead.
- Mentor inbox endpoints: `GET /api/v1/alerts?mentorId=&status=`, `POST /api/v1/alerts/:id/acknowledge`.
- SLA tracking: every alert gets a `slaDeadline` on creation. A BullMQ worker (`escalation.worker.ts`) checks for alerts past `slaDeadline` still `open`, sets `status: "escalated"` and `escalatedAt`, and notifies the HoD (in-app notification is sufficient for v1; no email/SMS infra required).

**Depends on:** M1's normalised source collections (Team Member 3) as trend-detection input; Team Member 1's `RiskSnapshot` output as the trigger for alert generation.

**Produces for others:** `Alert` documents, consumed by M6 (Team Member 4, interventions reference an `alertId`) and M8 (Team Member 1, audit writes on every status change).

**Acceptance criteria:**
- Running trend detection against the seed data correctly flags the students engineered to show a downward trend, and does not flag stable students.
- The same underlying risk condition never produces two open alerts for the same student — verify with a test that runs the batch twice.
- An alert past its `slaDeadline` transitions to `escalated` automatically without manual intervention.
- Acknowledging an alert sets `acknowledgedAt` and updates `status`, and this is reflected in the mentor inbox on next fetch.

**Do NOT build:** the scoring engine itself or model versioning (M3/M8 — Team Member 1's), ingestion connectors (M1 — Team Member 3's), the intervention recording form or dashboards (M6/M7 — Team Member 4's).

---

### 5.3 — TEAM MEMBER 3(Nilesh): M1 (Ingestion & Normalisation) + M2 (Student Academic Profile)

**Build:**
- Import/connector functions for all 4 source types (attendance, marks, assignments, LMS activity). Since no real institutional data or connector access exists yet, build these as **CSV/file importers matching the exact schema in Section 1** — this is not a shortcut, it is the correct v1 implementation per the spec's "working file-import fallback" requirement; live API connectors can be swapped in later without changing anything downstream.
- Validation on every imported row; anything malformed goes into the `quarantine` collection with a `reason` — never dropped, and a bad row must never fail the whole batch import.
- `GET /api/v1/admin/connectors/status`, `POST /api/v1/admin/connectors/:name/sync` — trigger and report on import runs.
- M2: a consolidated per-student profile — an aggregation/materialized view built from `students`, `enrolments`, `attendanceRecords`, `assessmentRecords`, `assignmentSubmissions`, `lmsActivity` — that answers "what does this student's academic standing currently look like" in one document. `GET /api/v1/students/:id/profile`.
- This module is a dependency for both Team Member 1's (M3) and Team Member 2's (M4) work — prioritize getting a working version of M1+M2 out early, even a minimal one, rather than polishing before handing off.

**Depends on:** nothing — this is the entry point of the pipeline. Can start immediately in week 1.

**Produces for others:** normalised source collections (used directly by Team Member 2's M4) and the consolidated student profile (used by Team Member 1's M3).

**Acceptance criteria:**
- Importing a file with some malformed rows completes successfully, with the bad rows visible in `quarantine` and a reason recorded for each.
- The student profile endpoint returns a correct, complete view for a seeded test student, matching what's in the underlying source collections.
- Re-running an import with the same file does not create duplicate records (idempotent import).

**Do NOT build:** any scoring or trend logic (M3/M4 — Team Member 1/Team Member 2's), alerts (M5 — Team Member 2's), interventions or dashboards (M6/M7 — Team Member 4's).

---

### 5.4 — TEAM MEMBER 4 (Piyush Kumar Singh): M6 (Intervention & Outcome Tracking) + M7 (Dashboards & Reporting)

**Build:**
- `interventions` collection and endpoints: `POST /api/v1/interventions` (mentor records an action taken in response to an `alertId`, with `action`, `notes`, optional `followUpDate`), `PATCH /api/v1/interventions/:id/outcome` (mentor later records what happened — did the student's band improve after the action).
- A simple intervention form in the mentor's UI (`apps/web/app/(mentor)/interventions/`), linked from the alert inbox so a mentor can go straight from an open alert to logging an action.
- Dashboards (M7) for all 5 non-admin roles (student, instructor, mentor, HoD, Dean), each showing role-scoped data only: `GET /api/v1/analytics/department/:id`, `GET /api/v1/analytics/institution`. Build 2–4 charts per role off the aggregations Team Member 1's M3 and Team Member 2's M4 already compute — do not re-implement aggregation logic that already exists.
- The student-facing risk view (`apps/web/app/(student)/risk/`) needs a deliberately non-alarming design — plain language, calm colour choices, not red/urgent styling for a "high" band.

**Depends on:** Team Member 2's `Alert` documents (to link interventions to alerts); Team Member 1's `RiskSnapshot` and Team Member 2's trend output (as data for dashboards).

**Produces for others:** none downstream — this is the last stage of the pipeline (dashboards and closed-loop intervention tracking).

**Acceptance criteria:**
- A mentor can go from an open alert → log an intervention → later update its outcome, and this is reflected correctly when queried back.
- Each role's dashboard shows only that role's permitted data (verify against the RBAC rules in Section 1) — an instructor's dashboard must not show another section's students.
- Dashboards render correctly against the seed data with no more than a small number of test students (full-scale performance testing is out of scope at this stage).

**Do NOT build:** scoring or trend logic (M3/M4), alert generation/routing/SLA logic (M5 — Team Member 2's; you only consume `Alert` documents, you don't create or route them), ingestion (M1 — Team Member 3's).

---

## 6. Testing requirements (every module)

- Reproducibility test (Team Member 1's module, but every module's output should be stable across repeated runs on the same input).
- Authorization negative-case tests: student → another student's data (denied), instructor → another section (denied), admin → raw marks (denied), mentor → a student not assigned to them (denied). Each module owner writes the negative-case test for their own endpoints.
- One end-to-end journey per module, chained together in week 6 integration: student views own risk → mentor sees alert, acknowledges, logs intervention → dashboard reflects it.
- All tests run in CI on every PR; a PR cannot merge if lint, typecheck, or tests fail.

## 7. Naming and consistency rules (every AI agent session must follow this)

- Never redefine a type that exists in `packages/shared-types` — import it.
- Never invent a new name for an existing domain concept — check `glossary.md` first.
- If a new shared type or API route is genuinely needed, propose it as a change to `packages/shared-types` / `docs/api-contract.md` in its own small PR — do not create it inline inside a module and hope it merges later.
- Use ESLint/Prettier conventions already configured in `packages/config`: camelCase for variables/functions, PascalCase for types/components.

---

## 8. Quick reference — every module and who owns it

Read this table first if you only have one minute. It's the single-glance version of Section 5 — use it to confirm you're looking at the right person's brief before you paste anything into Antigravity.

| # | Module | What it does | Owner | Depends on | Feeds into |
|---|---|---|---|---|---|
| M1 | Ingestion & Normalisation | Imports attendance/marks/assignments/LMS data, validates it, quarantines bad rows | **Team Member 3(Nilesh)** | Nothing — entry point | M2 (Team Member 3), M4 (Team Member 2) |
| M2 | Student Academic Profile | Consolidates all of M1's data into one per-student view | **Team Member 3(Nilesh)** | M1 | M3 (Team Member 1) |
| M3 | Risk Scoring Engine | Versioned rules-and-weights engine producing a band + ranked, explainable factors | **Team Member 1(Pawan)** | M2, M4 | M5 (Team Member 2), M7 (Team Member 4) |
| M4 | Trend & Anomaly Detection | Rolling-baseline + sudden-drop detection per student; also owns the synthetic seed-data generator | **Team Member 2(Vani)** | M1 | M3 (Team Member 1) |
| M5 | Alert Routing & Mentor Inbox | Turns a risk snapshot into a deduplicated alert, routes to mentor, tracks SLA/escalation | **Team Member 2(Vani)** | M3 | M6 (Team Member 4), M8 audit (Team Member 1) |
| M6 | Intervention & Outcome Tracking | Mentor logs an action on an alert and records the outcome | **Team Member 4 (Piyush Kumar Singh)** | M5 | M7 (Team Member 4) |
| M7 | Dashboards & Reporting | Role-scoped dashboards for student/instructor/mentor/HoD/Dean | **Team Member 4 (Piyush Kumar Singh)** | M2, M3, M4 | Nothing downstream — last stage |
| M8 | Configuration & Audit | Weight/threshold versioning + band-change preview + immutable audit log | **Team Member 1 (Pawan)** | Nothing (independent), logs writes from every module | Everything writes to it, nothing depends on it |

**By person, both modules together:**
- **Team Member 1 (Pawan):** M3 + M8 — Section 5.1
- **Team Member 2 (Vani):** M4 + M5 — Section 5.2
- **Team Member 3 (Nilesh):** M1 + M2 — Section 5.3
- **Team Member 4 (Piyush Kumar Singh):** M6 + M7 — Section 5.4

If you're pasting this file into Antigravity, paste Sections 0–4 (shared, everyone) plus **only your own subsection of Section 5** — this table is just to confirm you've picked the right one before you do.
