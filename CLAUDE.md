# CLAUDE CODE INSTRUCTIONS — FETCH FIRST, DOCS FIRST & FEATURE BRANCHES

## 🚨 MANDATORY STEP 0: FETCH LATEST REMOTE CODE FIRST
Before taking any action, editing code, or running commands:
1. Run `git fetch origin` and `git pull origin main` to pull down the latest merged code from GitHub.
2. Never work on outdated code. Always pull latest `main` before starting a feature task.

## 🚨 MANDATORY STEP 1: READ DOCUMENTATION
After pulling latest code, scan and read all markdown documentation files in `docs/`:
1. `docs/stage-wise-development-plan.md` — Identify the current stage (Stage 1 vs Stage 2 vs Stage 3) and read your assigned module's "WHAT TO BUILD NOW" checklist.
2. `docs/build-plan.md` — Master build plan detailing system architecture, module ownership, and data structures.
3. `docs/glossary.md` — Canonical domain dictionary (`studentId`, `band`, `computedAt`, `factors`, `intervention`, etc.). Do not use unauthorized terms.
4. `docs/api-contract.md` — REST endpoints specification and field-level RBAC rules.
5. `docs/model-specification.md` — Scoring engine weights and risk band thresholds.

## 🌿 MANDATORY GIT FEATURE BRANCH WORKFLOW
- **NEVER COMMIT OR PUSH DIRECTLY TO `main`.**
- Always create or check out a feature branch dedicated to your module:
  - Team Member 1 (Pawan): `feat/m3-scoring` / `feat/m8-admin`
  - Team Member 2 (Vani): `feat/m4-trends` / `feat/m5-alerts`
  - Team Member 3: `feat/m1-ingestion` / `feat/m2-profile`
  - Team Member 4: `feat/m6-interventions` / `feat/m7-analytics`
- Push commits to your remote feature branch (`git push origin <feature-branch>`).
- Open a Pull Request (PR) on GitHub. The Repo Lead (Pawan) will review and merge your PR into `main`.

## 📌 CORE DEVELOPMENT RULES
- Always import domain types from `@academic-risk-radar/shared-types`. Never redefine interfaces locally.
- Build strictly within your assigned module directory (`apps/api/src/modules/<your-module>/`).
- Respect field-level access control: Students can only view own risk; Admins cannot view raw assessment/attendance marks.
- Scoring engine logic must remain pure and deterministic (zero framework imports in `packages/scoring-engine`).
