import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireRole } from "../../auth/rbac.middleware.js";
import {
  getDepartmentAnalytics,
  getInstitutionAnalytics,
} from "./analytics.controller.js";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

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

// Apply the rate limiting middleware to all requests in this router
router.use(apiLimiter);

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
