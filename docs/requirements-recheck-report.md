# Academic Risk Radar - Requirements Recheck Report

**Scope:** P01 Academic Risk Radar, Track J (Next.js, Node.js, MongoDB, BullMQ/Redis), delivered as an academic assignment using synthetic data and CSV imports.

**Review date:** 4 November 2026

**Assessment result:** The application is buildable. This report distinguishes the minimum assignment scope from production-only requirements that are deliberately deferred because no university data systems are available.

## Verification results

| Check | Result |
|---|---|
| TypeScript typecheck | Pass |
| ESLint | Pass |
| Production build | Pass |
| API test suite | 125 passed, 3 failed |
| Scoring-engine test suite | 4 passed, 0 failed |

The three remaining API failures are detailed below. The test suite was run using local loopback networking; these are application/test-contract failures, not a sandbox limitation.

## Fix now

### 1. Enforce intervention access through mentor assignment

**Problem:** Intervention access must be determined by the current faculty member's mentor assignment, not their job-title role alone. An instructor or HoD who is the assigned mentor must be able to act only for that mentee.

**Evidence:** `apps/api/src/modules/interventions/index.ts` permits eligible faculty through the routes, while controllers verify the alert/intervention `mentorId` against the authenticated user's identity.

**Required fix:** Preserve the controller ownership checks and cover both instructor and HoD mentor identities with positive assigned-mentee tests and negative non-assigned-mentee tests.

### 2. Resolve the alert denial-message contract

**Problem:** The cross-mentor alert test expects a mentor-specific message, but the controller returns a faculty-wide message. The access control itself returns `403`, so this is a contract mismatch rather than an authorization bypass.

**Required fix:** Choose one stable API wording and make the test match it. Prefer role-neutral wording such as `Forbidden: You can only view alerts assigned to you`, then avoid exact full-message assertions unless the wording is part of the public API.

### 3. Validate all required headers before processing attendance rows

**Problem:** A legacy attendance CSV without `sectionId` is reported as a bad data row rather than a malformed header.

**Required fix:** For session-based attendance, validate `studentId`, `sectionId`, `date`, `status`, and `sourceRef` in the header before iterating through data rows. Quarantine the file with a clear missing-header reason.

### 4. Resolve assessment-history ordering

**Problem:** The profile aggregator sorts assessment history newest-first, but the test asserts the original/oldest-first ordering. The computed average is correct; only the list contract is inconsistent.

**Required fix:** Decide and document the response order. For a student-facing assessment history, newest-first is reasonable; update the test to expect 90 then 80. Otherwise remove the descending sort and keep the test expectation.

### 5. Add durable recurring jobs

**Problem:** Workers exist, but no BullMQ repeatable-job/job-scheduler registration was found for nightly scoring or repeated SLA escalation checks.

**Required fix:** Register a single idempotent nightly scoring schedule and a frequent SLA-check schedule at worker startup or in a dedicated scheduler process. Test that duplicate deployments do not create duplicate schedules.

## Implement for the assignment

### API documentation

- Add a small `openapi.yaml` file using OpenAPI 3.1. It should document only the endpoints that exist now: authentication, profile/risk, alerts, interventions, scoring, analytics, model versions, audit, and CSV imports.
- For each endpoint, record the method, path, required request fields, responses, and authentication/role requirement. The existing `docs/api-contract.md` can remain as the readable explanation.

### Data input and authentication

- Keep CSV import as the only implemented input method for attendance, assessments, assignments, and LMS-activity records.
- Continue using synthetic/seeded data for the demonstration.
- Keep the existing local JWT login for the assignment demonstration.
- Add a short note in the README stating that live university integrations are outside the assignment scope because no source-system credentials or data contracts were supplied.

### Privacy and operational basics

- Keep a brief DPDP note: academic data is used only for academic support; students can request access/correction through an administrator; academic records are retained according to institutional policy.
- Do not log passwords, JWTs, marks, attendance records, or intervention notes.
- Keep `/health` for the assignment. Add `/ready` only if the Docker deployment is being demonstrated; it should confirm that MongoDB and Redis are reachable.
- Ordinary, concise application logs are sufficient. Structured JSON logging is useful but optional for this submission.

### Evidence and quality

- Update CI to run the complete API test suite, build all workspaces, and fail on test failures. It currently only runs the scoring-engine tests.
- Fix the three failing API tests before submission.
- Keep basic role-isolation, scoring, ingestion, and intervention tests. Add one database-backed test proving that an instructor or HoD who is an assigned mentor can create an intervention, while another faculty member cannot.
- Add a short README setup guide and a concise explanation of the risk model and demo accounts.

## Explicitly deferred - do not build for this assignment

- Live ERP/SIS, LMS, email-provider, and university SSO/LDAP integrations.
- OAuth/OIDC SSO, refresh-token rotation, and TOTP MFA.
- External Sentry/error-monitoring accounts and external uptime monitoring.
- Full 30,000-student load testing, production SLA evidence, OWASP ZAP, and enterprise deployment hardening.
- Multi-tenant `institutionId` rollout, complex self-service data deletion, and field-level encryption infrastructure.
- Full notification-digest system, SMS delivery, and production report scheduling.
- A complete production runbook, formal backup/restore drills, recorded handover, and long-term support window.

## Do not touch - preserve as completed

These are working foundations. Do not rewrite them while fixing the gaps above; make only focused extensions with regression tests.

- Track J monorepo architecture: Next.js web app, Express API, MongoDB, Redis, BullMQ workers, Docker Compose.
- Four-source ingestion coverage with validation and quarantine: attendance, assessments, assignments, and LMS activity.
- Deterministic weighted scoring engine, ranked factor attribution, model versioning, and model-impact preview.
- Append-only risk snapshots and the existing source-record indexes.
- Trend/sudden-drop detection and deterministic synthetic data generation.
- Mentor-alert deduplication and the SLA escalation worker logic.
- Existing student cross-record isolation and administrator raw-marks denial tests.
- Model-version and audit-log endpoints, plus the append-only audit pattern.
- Intervention soft-withdrawal behaviour and pagination structure; correct its authorization only.
- Passing typecheck, lint, production build, and scoring-engine test suite.

## Recommended implementation order

1. Fix the three remaining failing tests and add database-backed mentor-assignment coverage.
2. Add BullMQ recurring schedules and test idempotency.
3. Create the minimal OpenAPI 3.1 specification and document the CSV-only data-input scope in the README.
4. Add the short DPDP/privacy note, keep `/health`, and add `/ready` only when Docker is part of the demo.
5. Add only the tests and documentation needed to demonstrate the completed assignment.

## Recheck gate

Do not mark the assignment complete until the API suite is fully green, CSV imports and queued scoring work in the demonstration stack, and the minimal OpenAPI, README, and privacy notes are committed.
