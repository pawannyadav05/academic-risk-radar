import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireRole } from "../../auth/rbac.middleware.js";
import { importSectionAcademicData } from "./instructor-import.controller.js";

const router = Router();

const importLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(importLimiter);

/**
 * POST /api/v1/sections/:sectionId/imports/:source
 * Protected academic submission endpoint for instructors.
 */
router.post(
  "/sections/:sectionId/imports/:source",
  requireRole("instructor", "admin"),
  importSectionAcademicData
);

export default router;

