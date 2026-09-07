import { Router, Request, Response } from "express";
import {
  AssessmentRecordModel,
  AssignmentSubmissionModel,
  AttendanceRecordModel,
  LmsActivityModel,
  QuarantineModel,
} from "../../db/schemas.js";
import {
  importAssessmentFromCsv,
  importAssignmentFromCsv,
  importAttendanceFromCsv,
  importLmsActivityFromCsv,
  parseAssessmentCsv,
  parseAssignmentCsv,
  parseAttendanceCsv,
  parseLmsActivityCsv,
} from "./csv-importers.js";

// Module M1: Ingestion & Normalisation (Team Member 3 - Nilesh)
const router = Router();

/**
 * GET /api/v1/admin/connectors/status
 * Returns ingestion summary: total imported records across sources and quarantined count.
 */
router.get("/connectors/status", async (req: Request, res: Response) => {
  try {
    const [
      attendanceCount,
      assessmentCount,
      assignmentCount,
      lmsCount,
      quarantineCount,
    ] = await Promise.all([
      AttendanceRecordModel.countDocuments().catch(() => 0),
      AssessmentRecordModel.countDocuments().catch(() => 0),
      AssignmentSubmissionModel.countDocuments().catch(() => 0),
      LmsActivityModel.countDocuments().catch(() => 0),
      QuarantineModel.countDocuments().catch(() => 0),
    ]);

    res.json({
      status: "operational",
      sources: {
        attendance: { count: attendanceCount, health: "active" },
        assessments: { count: assessmentCount, health: "active" },
        assignments: { count: assignmentCount, health: "active" },
        lmsActivity: { count: lmsCount, health: "active" },
      },
      quarantine: {
        totalRecords: quarantineCount,
      },
      lastChecked: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch connector status", details: err.message });
  }
});

/**
 * POST /api/v1/admin/connectors/:name/sync
 * Accepts CSV payload and runs the normalisation & quarantine pipeline.
 */
router.post("/connectors/:name/sync", async (req: Request, res: Response) => {
  const { name } = req.params;
  const csvData: string = req.body.csvData || (typeof req.body === "string" ? req.body : "");

  if (!csvData) {
    return res.status(400).json({
      error: "Missing required 'csvData' in request body",
      example: { csvData: "header1,header2\\nval1,val2" },
    });
  }

  try {
    const normalizedName = name.toLowerCase();

    switch (normalizedName) {
      case "attendance": {
        const result = await importAttendanceFromCsv(csvData);
        return res.json({ status: "success", connector: name, ...result });
      }

      case "assessment":
      case "assessments": {
        const result = await importAssessmentFromCsv(csvData);
        return res.json({ status: "success", connector: name, ...result });
      }

      case "assignment":
      case "assignments": {
        const result = await importAssignmentFromCsv(csvData);
        return res.json({ status: "success", connector: name, ...result });
      }

      case "lms":
      case "lms-activity": {
        const result = await importLmsActivityFromCsv(csvData);
        return res.json({ status: "success", connector: name, ...result });
      }

      default:
        return res.status(400).json({
          error: `Unknown connector '${name}'. Supported connectors: attendance, assessment, assignment, lms`,
        });
    }
  } catch (err: any) {
    return res.status(500).json({
      error: `Failed to process sync for connector '${name}'`,
      details: err.message,
    });
  }
});

export default router;
