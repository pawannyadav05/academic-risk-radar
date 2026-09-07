# Academic Risk Radar

Academic early-warning platform that consolidates student risk signals from attendance, marks, assignments, and LMS data using an explainable weighted scoring engine, with mentor alerting and intervention tracking. Built with Next.js, Node.js, and MongoDB.

---

## 📌 Master Build Plan & Single Source of Truth
The canonical master build plan for this project is saved in the repository at:
👉 **[`docs/build-plan.md`](docs/build-plan.md)**

Whenever switching AI agents or starting a new development session, refer to `docs/build-plan.md` for exact module ownership, API contracts, data models, and non-negotiable project rules.

---

## 📚 Project Documentation

- **Master Build Plan**: [`docs/build-plan.md`](docs/build-plan.md)
- **Canonical Glossary**: [`docs/glossary.md`](docs/glossary.md)
- **API Contract**: [`docs/api-contract.md`](docs/api-contract.md)
- **Scoring Model Specification**: [`docs/model-specification.md`](docs/model-specification.md)

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
| **M4** | Trend & Anomaly Detection | Team Member 2(Vani) |
| **M5** | Alert Routing & Mentor Inbox | Team Member 2(Vani) |
| **M6** | Intervention & Outcome Tracking | Team Member 4 |
| **M7** | Dashboards & Reporting | Team Member 4 |
| **M8** | Configuration & Audit Control | Team Member 1 (Pawan) |
