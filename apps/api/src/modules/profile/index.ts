import { Router, Request, Response } from "express";
import { getStudentConsolidatedProfile } from "./profile-aggregator.js";

// Module M2: Student Academic Profile (Team Member 3 - Nilesh)
const router = Router();

/**
 * GET /api/v1/students/:id/profile
 * Returns consolidated academic standing combining attendance, assessments,
 * assignments, and LMS engagement.
 */
router.get("/students/:id/profile", async (req: Request, res: Response) => {
  const { id: studentId } = req.params;

  if (!studentId) {
    return res.status(400).json({ error: "studentId is required" });
  }

  try {
    const profile = await getStudentConsolidatedProfile(studentId);
    return res.json({
      status: "success",
      profile,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to fetch student academic profile",
      details: err.message,
    });
  }
});

export default router;
