# Academic Risk Radar

Academic early-warning platform that consolidates student risk signals from attendance, marks, assignments, and LMS data using an explainable weighted scoring engine, with mentor alerting and intervention tracking. Built with Next.js, Node.js, and MongoDB.

---

## 📌 Master Build Plan & Single Source of Truth
The canonical master build plan for this project is saved in the repository at:
👉 **[`docs/build-plan.md`](docs/build-plan.md)**
👉 **[`docs/stage-wise-development-plan.md`](docs/stage-wise-development-plan.md)**

Whenever switching AI agents or starting a new development session, refer to `docs/build-plan.md` and `docs/stage-wise-development-plan.md` for exact module ownership, stage boundaries, API contracts, data models, and non-negotiable project rules.

---

## 📚 Project Documentation

- **Master Build Plan**: [`docs/build-plan.md`](docs/build-plan.md)
- **Stage-Wise Development Plan**: [`docs/stage-wise-development-plan.md`](docs/stage-wise-development-plan.md)
- **Canonical Glossary**: [`docs/glossary.md`](docs/glossary.md)
- **API Contract**: [`docs/api-contract.md`](docs/api-contract.md)
- **Scoring Model Specification**: [`docs/model-specification.md`](docs/model-specification.md)

---

## 🌿 Git Feature Branching & Pull Request Workflow (For Teammates)

All team members must work on dedicated **feature branches**. **Direct commits to `main` are strictly prohibited.**

### Workflow Steps for Collaborators:
1. **Sync latest main from GitHub**:
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Create and switch to your feature branch**:
   ```bash
   # Example for Team Member 3 working on Module M1
   git checkout -b feat/m1-ingestion
   ```
3. **Commit changes locally**:
   ```bash
   git commit -m "feat(m1): implement CSV importer and quarantine validation logic"
   ```
4. **Push feature branch to GitHub**:
   ```bash
   git push origin feat/m1-ingestion
   ```
5. **Open a Pull Request (PR)** on GitHub targeting the `main` branch.
6. **Merge Approval**: The Team Lead / Repo Owner (**Pawan**) will review the Pull Request, inspect CI build status, and merge it into `main`.

---

## 🤖 AI Agent Setup & Kickoff Prompt (For Teammates)

This repository includes configuration files (`CLAUDE.md`, `.cursorrules`, `.gemini/rules/00-docs-first.md`) that instruct AI tools (Antigravity, Claude Code, Cursor, Windsurf, Copilot) to **automatically fetch latest code from GitHub**, **scan all documentation in `docs/` before writing code**, and **enforce feature branch development**.

### Recommended AI Kickoff Prompt
When opening a new AI coding session, copy and paste this command into your AI chat:

> *"First run git fetch origin and git pull origin main to pull the latest changes from GitHub. Then scan and read all .md files under the docs/ folder (`docs/stage-wise-development-plan.md`, `docs/build-plan.md`, `docs/glossary.md`, `docs/api-contract.md`, `docs/model-specification.md`) and check packages/shared-types/index.ts. Ensure we work on a feature branch (never main). I am Team Member [X] working on Module [M_X]. We are currently in Stage 1 (Week 5 Evaluation). Follow the exact 'WHAT TO BUILD NOW' checklist for my module in Stage 1."*

---

## 🚀 Workspace Setup

### Prerequisites
- Node.js v20+ / v22+
- npm v10+

### Getting Started
```bash
# Clone the repository
git clone https://github.com/pawannyadav05/academic-risk-radar.git
cd academic-risk-radar

# Install dependencies across all monorepo workspaces
npm install

# Build shared types package
npm run build --workspace=packages/shared-types

# Verify TypeScript typechecking
npm run typecheck
```

---

## 👥 Module Ownership Quick Reference

| Module | Name | Owner | Feature Branch |
|---|---|---|---|
| **M1** | Ingestion & Normalisation | Team Member 3 (Nilesh) | `feat/m1-ingestion` |
| **M2** | Student Academic Profile | Team Member 3 (Nilesh) | `feat/m2-profile` |
| **M3** | Risk Scoring Engine | Team Member 1 (Pawan) | `feat/m3-scoring` |
| **M4** | Trend & Anomaly Detection | Team Member 2 (Vani) | `feat/m4-trends` |
| **M5** | Alert Routing & Mentor Inbox | Team Member 2 (Vani) | `feat/m5-alerts` |
| **M6** | Intervention & Outcome Tracking | Team Member 4 (Krish) | `feat/m6-interventions` |
| **M7** | Dashboards & Reporting | Team Member 4 (Krish) | `feat/m7-analytics` |
| **M8** | Configuration & Audit Control | Team Member 1 (Pawan) | `feat/m8-admin` |
