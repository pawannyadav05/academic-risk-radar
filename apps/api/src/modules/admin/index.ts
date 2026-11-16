import { Router } from "express";
import { requireRole } from "../../auth/rbac.middleware.js";
import {
  listModelVersions,
  proposeOrCreateModelVersion,
  activateModelVersion,
  getAuditTrail,
} from "./admin.controller.js";
import { listTerms, createTerm } from "./terms.controller.js";

// Module M8: Configuration & Audit Router (Team Member 1 - Pawan)
const router = Router();

/**
 * GET /api/v1/admin/model-versions
 * List all model configuration versions from the database.
 */
router.get("/model-versions", requireRole("admin"), listModelVersions);

/**
 * POST /api/v1/admin/model-versions
 * Compute band-change impact preview against historical student data.
 * If commit: true, persist version to MongoDB and emit an immutable audit entry.
 */
router.post("/model-versions", requireRole("admin"), proposeOrCreateModelVersion);

/**
 * POST /api/v1/admin/model-versions/:v/activate
 * Activate a specified model version and emit an immutable audit entry.
 */
router.post("/model-versions/:v/activate", requireRole("admin"), activateModelVersion);

/**
 * GET /api/v1/admin/audit
 * Paginated, filterable audit log reader.
 */
router.get("/audit", requireRole("admin"), getAuditTrail);

/**
 * GET /api/v1/admin/terms
 * List all academic terms (newest first).
 */
router.get("/terms", requireRole("admin"), listTerms);

/**
 * POST /api/v1/admin/terms
 * Create a new academic term with 5 CSV payloads in JSON body.
 */
router.post("/terms", requireRole("admin"), createTerm);

export default router;
