import { Router, Request, Response } from "express";

/**
 * Module M6: Intervention & Outcome Tracking (Team Member 4 — Piyush Kumar Singh)
 *
 * API Routes (from docs/api-contract.md):
 *   POST  /api/v1/interventions              — Record a mentoring action linked to an alertId
 *   PATCH /api/v1/interventions/:id/outcome  — Update intervention outcome (e.g., "improved", "no_change")
 *
 * Stage 1: Route scaffolds only (schema defined in schemas.ts).
 * Stage 2: Full controller logic with DB persistence.
 *
 * Depends on: M5 Alert documents (Team Member 2) — interventions reference an alertId.
 * Produces for: M7 dashboards (Team Member 4) — closed-loop outcome tracking.
 */
const router = Router();

/**
 * POST /interventions
 * Record a mentor's intervention action in response to an alert.
 *
 * Request body shape (Stage 2):
 *   { alertId: string, mentorId: string, action: string, notes: string, followUpDate?: string }
 *
 * Response (Stage 2):
 *   201 — { intervention: Intervention }
 *   400 — Validation error (missing required fields)
 *   403 — RBAC: only the assigned mentor can create interventions for their alerts
 */
router.post("/interventions", (_req: Request, res: Response) => {
  res.status(501).json({
    status: "not_implemented",
    message: "POST /interventions — Stage 2 implementation pending",
    module: "M6",
    owner: "Team Member 4 (Piyush Kumar Singh)",
  });
});

/**
 * PATCH /interventions/:id/outcome
 * Update the outcome of an existing intervention.
 *
 * Request body shape (Stage 2):
 *   { outcome: string, outcomeRecordedAt?: string }
 *
 * Allowed outcome values: "improved", "no_change", "deteriorated", "inconclusive"
 *
 * Response (Stage 2):
 *   200 — { intervention: Intervention }
 *   404 — Intervention not found
 *   403 — RBAC: only the original mentor can update outcome
 */
router.patch("/interventions/:id/outcome", (_req: Request, res: Response) => {
  res.status(501).json({
    status: "not_implemented",
    message: "PATCH /interventions/:id/outcome — Stage 2 implementation pending",
    module: "M6",
    owner: "Team Member 4 (Piyush Kumar Singh)",
  });
});

export default router;
