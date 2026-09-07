# MANDATORY RULES: FETCH LATEST CODE, READ DOCS, USE FEATURE BRANCHES

## 1. MANDATORY STEP 0: FETCH LATEST REMOTE CODE FIRST
Before writing code, editing files, or running commands:
- **ALWAYS FETCH LATEST REPOSITORY CHANGES**: Run `git fetch origin` and `git pull origin main` to sync the local workspace with the latest commits merged on GitHub.
- Starting work on outdated code causes merge conflicts and breaks team collaboration. Always sync first!

## 2. READ ALL DOCUMENTATION BEFORE WRITING CODE
After pulling the latest code, scan and read all documentation files in `docs/`:
1. `docs/stage-wise-development-plan.md` — Read to identify the CURRENT STAGE (Stage 1, Stage 2, or Stage 3) and check exact "WHAT TO BUILD NOW" vs "WHAT NOT TO BUILD YET" boundaries for your assigned module.
2. `docs/build-plan.md` — Master build plan detailing module ownership, data models, and non-negotiables.
3. `docs/glossary.md` — Canonical terminology guide (`studentId`, `band`, `computedAt`, `factors`, `intervention`, `mentorAssignment`). Never use unauthorized naming.
4. `docs/api-contract.md` — Verbatim REST API endpoint specification and RBAC rules.
5. `docs/model-specification.md` — Scoring model formula, factor weights, and risk band thresholds.

## 3. MANDATORY GIT FEATURE BRANCH WORKFLOW
- **NEVER COMMIT OR PUSH DIRECTLY TO THE `main` BRANCH.**
- After syncing latest `main`, check out or create your dedicated feature branch:
  - Team Member 1 (Pawan): `feat/m3-scoring`, `feat/m8-admin`
  - Team Member 2 (Vani): `feat/m4-trends`, `feat/m5-alerts`
  - Team Member 3 (Nilesh): `feat/m1-ingestion`, `feat/m2-profile`
  - Team Member 4 (Krish): `feat/m6-interventions`, `feat/m7-analytics`
- All changes must be pushed to your feature branch on GitHub (`git push origin <branch-name>`).
- The Team Lead / Repo Owner (Pawan) will review the Pull Request (PR) on GitHub and merge it into `main`.

## 4. CORE ARCHITECTURE RULES
- **Never redefine domain types**: Always import interfaces from `@academic-risk-radar/shared-types`.
- **Stay in scope**: Implement ONLY what belongs to your assigned module and current stage.
