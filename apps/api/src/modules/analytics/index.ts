import { Router } from "express";
import { requireRole } from "../../auth/rbac.middleware.js";
import {
  getDepartmentAnalytics,
  getInstitutionAnalytics,
} from "./analytics.controller.js";

/**
 * Module M7: Dashboards & Reporting (Team Member 4 — Piyush Kumar Singh)
 *
 * API Routes (from docs/api-contract.md):
 *   GET /api/v1/analytics/department/:id  — Department-level risk band distributions (HoD)
 *   GET /api/v1/analytics/institution     — Institution-wide risk trends (Dean)
 *
 * Stage 1: Route scaffolds only. ✅ COMPLETE
 * Stage 2: Full controller logic with aggregation queries. ✅ COMPLETE
 *
 * Depends on: M2 student profiles (Team Member 3), M3 RiskSnapshots (Team Member 1),
 *             M4 trend signals (Team Member 2).
 * Produces for: Nothing downstream — this is the last stage of the pipeline.
 *
 * RBAC Rules:
 *   - HoD: Can only access analytics for their own department.
 *   - Dean: Can access institution-wide analytics.
 *   - All endpoints are paginated and role-filtered server-side.
 */
const router = Router();

/**
 * GET /analytics/department/:id
 * Return department-level risk band distributions for HoD view.
 * RBAC: hod (own department only), dean, admin
 */
router.get(
  "/analytics/department/:id",
  requireRole("hod", "dean", "admin"),
  getDepartmentAnalytics
);

/**
 * GET /analytics/institution
 * Return institution-wide risk trends for Dean view.
 * RBAC: dean, admin only
 */
router.get(
  "/analytics/institution",
  requireRole("dean", "admin"),
  getInstitutionAnalytics
);

export default router;
