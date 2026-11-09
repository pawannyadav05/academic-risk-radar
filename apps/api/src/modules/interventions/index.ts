import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireRole } from "../../auth/rbac.middleware.js";
import {
  createIntervention,
  updateInterventionOutcome,
  withdrawIntervention,
  listInterventions,
} from "./interventions.controller.js";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Module M6: Intervention & Outcome Tracking (Team Member 4 — Piyush Kumar Singh)
 *
 * API Routes (from docs/api-contract.md):
 *   POST  /api/v1/interventions              — Record a mentoring action linked to an alertId
 *   PATCH /api/v1/interventions/:id/outcome  — Update intervention outcome (e.g., "improved", "no_change")
 *   GET   /api/v1/interventions              — List interventions for a mentor (paginated)
 *
 * Stage 1: Route scaffolds only (schema defined in schemas.ts). ✅ COMPLETE
 * Stage 2: Full controller logic with DB persistence. ✅ COMPLETE
 *
 * Depends on: M5 Alert documents (Team Member 2) — interventions reference an alertId.
 * Produces for: M7 dashboards (Team Member 4) — closed-loop outcome tracking.
 */
const router = Router();

// Apply the rate limiting middleware to all requests in this router
router.use(apiLimiter);

/**
 * GET /interventions
 * List interventions for the authenticated mentor, with optional filtering and pagination.
 * RBAC: mentor, instructor, and HoD may view their own mentoring work; dean and admin
 * retain their existing oversight access.
 */
router.get(
  "/interventions",
  requireRole("mentor", "instructor", "hod", "dean", "admin"),
  listInterventions
);

/**
 * POST /interventions
 * Record a mentor's intervention action in response to an alert.
 * RBAC: Faculty who are assigned as the student's mentor can create interventions.
 *
 * Request body: { alertId: string, action: string, notes: string, followUpDate?: string }
 * Response: 201 — { intervention: Intervention }
 */
router.post(
  "/interventions",
  requireRole("mentor", "instructor", "hod", "admin"),
  createIntervention
);

/**
 * PATCH /interventions/:id/outcome
 * Update the outcome of an existing intervention.
 * RBAC: Faculty who are assigned as the student's mentor can update outcomes.
 *
 * Request body: { outcome: "improved" | "no_change" | "deteriorated" | "inconclusive" }
 * Response: 200 — { intervention: Intervention }
 */
router.patch(
  "/interventions/:id/outcome",
  requireRole("mentor", "instructor", "hod", "admin"),
  updateInterventionOutcome
);

/**
 * DELETE /interventions/:id
 * Soft delete / withdraw an intervention.
 * RBAC: Faculty who are assigned as the student's mentor can withdraw interventions.
 *
 * Response: 200 — { message: string, intervention: Intervention }
 */
router.delete(
  "/interventions/:id",
  requireRole("mentor", "instructor", "hod", "admin"),
  withdrawIntervention
);

export default router;
