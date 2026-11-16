import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireRole } from "../../auth/rbac.middleware.js";
import {
  importSectionAcademicData,
  getInstructorTeachingAssignments,
} from "./instructor-import.controller.js";

const router = Router();

const importLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(importLimiter);

/**
 * GET /api/v1/instructor/teaching-assignments
 * Returns assigned subjects and sections for the logged-in instructor.
 */
router.get(
  "/instructor/teaching-assignments",
  requireRole("instructor", "mentor", "hod", "admin"),
  getInstructorTeachingAssignments
);

/**
 * POST /api/v1/sections/:sectionId/imports/:source
 * Protected academic submission endpoint for instructors.
 */
router.post(
  "/sections/:sectionId/imports/:source",
  requireRole("instructor", "mentor", "hod", "admin"),
  importSectionAcademicData
);

export default router;

