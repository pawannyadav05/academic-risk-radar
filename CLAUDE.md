# CLAUDE CODE INSTRUCTIONS — DOCS FIRST MANDATE

## 🚨 MANDATORY INITIALIZATION STEP
Before generating code, editing files, or running commands, you MUST scan and read all markdown documentation files in `docs/`:

1. `docs/stage-wise-development-plan.md` — Identify the current stage (Stage 1 vs Stage 2 vs Stage 3) and read your assigned module's "WHAT TO BUILD NOW" checklist.
2. `docs/build-plan.md` — Master build plan detailing system architecture, module ownership, and data structures.
3. `docs/glossary.md` — Canonical domain dictionary (`studentId`, `band`, `computedAt`, `factors`, `intervention`, etc.). Do not use unauthorized terms.
4. `docs/api-contract.md` — REST endpoints specification and field-level RBAC rules.
5. `docs/model-specification.md` — Scoring engine weights and risk band thresholds.

## 📌 CORE DEVELOPMENT RULES
- Always import domain types from `@academic-risk-radar/shared-types`. Never redefine interfaces locally.
- Build strictly within your assigned module directory (`apps/api/src/modules/<your-module>/`).
- Respect field-level access control: Students can only view own risk; Admins cannot view raw assessment/attendance marks.
- Scoring engine logic must remain pure and deterministic (zero framework imports in `packages/scoring-engine`).
