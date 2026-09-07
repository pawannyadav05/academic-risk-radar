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

## 🤖 AI Agent Setup & Kickoff Prompt (For Teammates)

This repository includes configuration files (`CLAUDE.md`, `.cursorrules`, `.gemini/rules/00-docs-first.md`) that instruct AI tools (Antigravity, Claude Code, Cursor, Windsurf, Copilot) to **automatically scan all documentation in `docs/` before writing code**.

### Recommended AI Kickoff Prompt
When opening a new AI coding session, copy and paste this command into your AI chat:

> *"First scan and read all .md files under the docs/ folder (`docs/stage-wise-development-plan.md`, `docs/build-plan.md`, `docs/glossary.md`, `docs/api-contract.md`, `docs/model-specification.md`) and check packages/shared-types/index.ts. I am Team Member [X] working on Module [M_X]. We are currently in Stage 1 (Week 5 Evaluation). Follow the exact 'WHAT TO BUILD NOW' checklist for my module in Stage 1."*

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

| Module | Name | Owner |
|---|---|---|
| **M1** | Ingestion & Normalisation | Team Member 3 |
| **M2** | Student Academic Profile | Team Member 3 |
| **M3** | Risk Scoring Engine | Team Member 1 (Pawan) |
| **M4** | Trend & Anomaly Detection | Team Member 2 (Vani) |
| **M5** | Alert Routing & Mentor Inbox | Team Member 2 (Vani) |
| **M6** | Intervention & Outcome Tracking | Team Member 4 |
| **M7** | Dashboards & Reporting | Team Member 4 |
| **M8** | Configuration & Audit Control | Team Member 1 (Pawan) |
