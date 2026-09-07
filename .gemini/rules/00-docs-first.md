# MANDATORY RULE: READ ALL DOCS BEFORE WRITING ANY CODE

Before generating code, creating endpoints, or making architectural modifications, you MUST FIRST scan and read all documentation files in `docs/`:

1. `docs/stage-wise-development-plan.md` — Read to identify the CURRENT STAGE (Stage 1, Stage 2, or Stage 3) and check exact "WHAT TO BUILD NOW" vs "WHAT NOT TO BUILD YET" boundaries for your assigned module.
2. `docs/build-plan.md` — Master build plan detailing module ownership, data models, and non-negotiables.
3. `docs/glossary.md` — Canonical terminology guide (`studentId`, `band`, `computedAt`, `factors`, `intervention`, `mentorAssignment`). Never use unauthorized naming.
4. `docs/api-contract.md` — Verbatim REST API endpoint specification and RBAC rules.
5. `docs/model-specification.md` — Scoring model formula, factor weights, and risk band thresholds.

## Key Rules:
- **Never redefine domain types**: Always import interfaces from `@academic-risk-radar/shared-types`.
- **Stay in scope**: Implement ONLY what belongs to your assigned module and current stage.
