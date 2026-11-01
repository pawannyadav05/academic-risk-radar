import { Request, Response } from "express";
import crypto from "crypto";
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
import {
  AlertModel,
  MentorAssignmentModel,
  RiskModelVersionModel,
  RiskSnapshotModel,
} from "../../db/schemas.js";
import {
  computeRiskSnapshot,
  DEFAULT_MODEL_VERSION,
} from "@academic-risk-radar/scoring-engine";
import { getStudentConsolidatedProfile } from "../profile/profile-aggregator.js";

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

      // Synchronous live recalculation guarantee so student and mentor screens update immediately
      try {
        let activeVersion = DEFAULT_MODEL_VERSION;
        const versionDoc = await RiskModelVersionModel.findOne().sort({ effectiveFrom: -1 }).lean();
        if (versionDoc) {
          const weights =
            versionDoc.weights instanceof Map
              ? Object.fromEntries(versionDoc.weights)
              : versionDoc.weights;
          activeVersion = {
            version: versionDoc.version,
            effectiveFrom: versionDoc.effectiveFrom,
            weights: weights || DEFAULT_MODEL_VERSION.weights,
            thresholds: versionDoc.thresholds || DEFAULT_MODEL_VERSION.thresholds,
            createdBy: versionDoc.createdBy,
            previousVersion: versionDoc.previousVersion ?? null,
          };
        }

        const now = new Date().toISOString();
        for (const sid of uniqueStudentIds) {
          const profile = await getStudentConsolidatedProfile(sid);
          const snapshot = computeRiskSnapshot(
            sid,
            {
              attendanceRate: profile.computedMetrics.attendanceRate,
              assessmentAvg: profile.computedMetrics.assessmentAvg,
              missingAssignmentsRatio: profile.computedMetrics.missingAssignmentsRatio,
              lmsEngagementRatio: profile.computedMetrics.lmsEngagementRatio,
              trendDeteriorationSignal: 0.05,
            },
            activeVersion,
            now
          );
          await RiskSnapshotModel.create(snapshot);

          // Stage 2 M5 Hook: Automatically generate/deduplicate alert for high/critical students
          if (["high", "critical"].includes(snapshot.band)) {
            const assignment = await MentorAssignmentModel.findOne({
              studentId: sid,
              assignedTo: null,
            }).lean();
            const mentorId = assignment?.mentorId || "MTR-001";
            const existingAlert = await AlertModel.findOne({ studentId: sid, status: "open" });
            if (existingAlert) {
              existingAlert.riskSnapshotId = snapshot._id;
              await existingAlert.save();
            } else {
              const slaDeadline = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
              await AlertModel.create({
                _id: crypto.randomUUID(),
                studentId: sid,
                mentorId,
                riskSnapshotId: snapshot._id,
                status: "open",
                createdAt: now,
                acknowledgedAt: null,
                escalatedAt: null,
                slaDeadline,
              });
            }
          }
        }
      } catch (syncErr: any) {
        console.warn(`[InstructorImport] Live scoring recalculation note: ${syncErr.message}`);
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

