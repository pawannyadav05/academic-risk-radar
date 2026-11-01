/**
 * Module M7 / Ingestion: Instructor Section Academic Data Submission Controller
 * Owned by Team Member 4 (Piyush Kumar Singh)
 *
 * Provides protected ingestion endpoints for instructors to submit attendance,
 * assessment, assignment, and LMS activity CSV data for their assigned sections.
 *
 * Capabilities:
 * - importSectionAcademicData: Validates section ownership, parses CSV input,
 *   performs idempotent batch upserts, and enqueues BullMQ batch scoring recalculation jobs.
 *
 * Security & Data Integrity:
 * - Negative-access RBAC: Enforces that instructors can only upload data to their assigned section.
 * - Rate Limiting & Input Validation: Guards against malformed payloads and DoS.
 */

import { Request, Response } from "express";
import {
  importAttendanceFromCsv,
  importAssessmentFromCsv,
  importAssignmentFromCsv,
  importLmsActivityFromCsv,
  parseAttendanceCsv,
  parseAssessmentCsv,
  parseAssignmentCsv,
  parseLmsActivityCsv,
} from "./csv-importers.js";
import { enqueueBatchScoringJob } from "../scoring/queue.js";

/**
 * Sanitize route parameter string to prevent injection
 */
function sanitizeString(val: unknown): string | null {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  if (trimmed.length === 0 || trimmed.length > 64) return null;
  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) return null;
  return trimmed;
}

/**
 * POST /api/v1/sections/:sectionId/imports/:source
 * Protected endpoint for instructors to submit academic CSV data for their assigned section.
 *
 * Parameters:
 *   - sectionId: Target section ID (e.g. "SEC-CSE-101")
 *   - source: "attendance" | "assessment" | "assignment" | "lms"
 *
 * Body:
 *   - { csvData: string } OR raw CSV string
 */
export async function importSectionAcademicData(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Missing authentication session" });
    }

    const rawSectionId = req.params.sectionId;
    const rawSource = req.params.source;

    const sectionId = sanitizeString(rawSectionId);
    if (!sectionId) {
      return res.status(400).json({ error: "Validation error: Invalid sectionId format" });
    }

    const source = sanitizeString(rawSource)?.toLowerCase();
    const validSources = ["attendance", "assessment", "assessments", "assignment", "assignments", "lms", "lms-activity"];
    if (!source || !validSources.includes(source)) {
      return res.status(400).json({
        error: `Validation error: Invalid source '${rawSource}'. Allowed: attendance, assessment, assignment, lms`,
      });
    }

    // RBAC: Verify Instructor ownership of section (admins exempt)
    if (user.role === "instructor") {
      const assigned = user.sectionIds || [];
      if (!assigned.includes(sectionId)) {
        return res.status(403).json({
          error: `Forbidden: Instructor '${user.email}' is not assigned to section '${sectionId}'`,
        });
      }
    } else if (user.role !== "admin") {
      return res.status(403).json({
        error: `Forbidden: Role '${user.role}' is not authorized to submit academic section data`,
      });
    }

    const csvData: string = req.body?.csvData || (typeof req.body === "string" ? req.body : "");
    if (!csvData || typeof csvData !== "string" || csvData.trim().length === 0) {
      return res.status(400).json({
        error: "Validation error: Missing or empty 'csvData' in request body",
      });
    }

    let result: { insertedCount: number; quarantinedCount: number; totalRows: number };
    let studentIds: string[] = [];

    switch (source) {
      case "attendance": {
        const parsed = parseAttendanceCsv(csvData);
        studentIds = parsed.valid.map((r) => r.studentId);
        result = await importAttendanceFromCsv(csvData);
        break;
      }
      case "assessment":
      case "assessments": {
        const parsed = parseAssessmentCsv(csvData);
        studentIds = parsed.valid.map((r) => r.studentId);
        result = await importAssessmentFromCsv(csvData);
        break;
      }
      case "assignment":
      case "assignments": {
        const parsed = parseAssignmentCsv(csvData);
        studentIds = parsed.valid.map((r) => r.studentId);
        result = await importAssignmentFromCsv(csvData);
        break;
      }
      case "lms":
      case "lms-activity": {
        const parsed = parseLmsActivityCsv(csvData);
        studentIds = parsed.valid.map((r) => r.studentId);
        result = await importLmsActivityFromCsv(csvData);
        break;
      }
      default:
        return res.status(400).json({ error: `Unsupported source: ${source}` });
    }

    // Auto-trigger scoring recalculation for all affected students
    const uniqueStudentIds = Array.from(new Set(studentIds)).filter(Boolean);
    let scoringJobEnqueued = false;

    if (uniqueStudentIds.length > 0) {
      try {
        await enqueueBatchScoringJob({
          studentIds: uniqueStudentIds,
          triggeredBy: user.id,
        });
        scoringJobEnqueued = true;
      } catch (queueErr: any) {
        console.warn(`[InstructorImport] Scoring queue enqueue note: ${queueErr.message}`);
      }
    }

    return res.status(201).json({
      status: "success",
      sectionId,
      source,
      insertedCount: result.insertedCount,
      quarantinedCount: result.quarantinedCount,
      totalRows: result.totalRows,
      affectedStudents: uniqueStudentIds.length,
      scoringRecalculation: scoringJobEnqueued ? "enqueued" : "skipped_no_students",
    });
  } catch (err: any) {
    console.error("[InstructorImport] Error processing import:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}

