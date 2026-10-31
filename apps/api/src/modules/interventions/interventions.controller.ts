import { Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { InterventionModel, AlertModel } from "../../db/schemas.js";

/**
 * Sanitize a string ID to prevent NoSQL injection.
 * Only allows alphanumeric characters, hyphens, underscores, and dots.
 */
function sanitizeId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 128) return null;
  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) return null;
  return trimmed;
}

/**
 * POST /api/v1/interventions
 * Record a mentor's intervention action in response to an alert.
 *
 * Required body fields: alertId, action, notes
 * Optional body fields: followUpDate
 * mentorId is derived from req.user.identityId || req.user.id (authenticated mentor)
 */
export async function createIntervention(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Missing user authentication" });
    }

    const { alertId: rawAlertId, action: rawAction, notes: rawNotes, followUpDate } = req.body;

    // Validate and sanitize required fields to prevent NoSQL injection
    const alertId = sanitizeId(rawAlertId);
    if (!alertId) {
      return res.status(400).json({ error: "Validation error: 'alertId' is required and must be a valid identifier string" });
    }
    if (!rawAction || typeof rawAction !== "string" || rawAction.trim().length === 0) {
      return res.status(400).json({ error: "Validation error: 'action' is required and must be a non-empty string" });
    }
    if (!rawNotes || typeof rawNotes !== "string") {
      return res.status(400).json({ error: "Validation error: 'notes' is required and must be a string" });
    }
    const action = rawAction.trim();
    const notes = String(rawNotes);

    if (mongoose.connection.readyState !== 1) {
      return res.status(404).json({ error: "Alert not found" });
    }

    // Verify the alert exists using explicit $eq operator
    const alert = await AlertModel.findOne({ _id: { $eq: String(alertId) } });
    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    // RBAC: Only the assigned mentor can create interventions for their alerts
    const effectiveMentorId = user.identityId || user.id;
    if (alert.mentorId !== user.id && alert.mentorId !== effectiveMentorId) {
      return res.status(403).json({
        error: "Forbidden: Only the assigned mentor can create interventions for this alert",
      });
    }

    const now = new Date().toISOString();
    const sanitizedFollowUp = followUpDate && typeof followUpDate === "string" ? followUpDate : null;
    const intervention = new InterventionModel({
      _id: crypto.randomUUID(),
      alertId: String(alertId),
      mentorId: String(effectiveMentorId),
      action,
      notes,
      createdAt: now,
      followUpDate: sanitizedFollowUp,
      outcome: null,
      outcomeRecordedAt: null,
      status: "active",
      withdrawnAt: null,
      withdrawnBy: null,
    });

    await intervention.save();

    return res.status(201).json({ intervention });
  } catch (err) {
    console.error("Error creating intervention:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PATCH /api/v1/interventions/:id/outcome
 * Update the outcome of an existing intervention.
 *
 * Required body fields: outcome (one of: "improved", "no_change", "deteriorated", "inconclusive")
 */
export async function updateInterventionOutcome(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Missing user authentication" });
    }

    const id = sanitizeId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Validation error: Invalid intervention ID format" });
    }

    const { outcome } = req.body;

    // Validate outcome value — strict allowlist prevents injection
    const allowedOutcomes = ["improved", "no_change", "deteriorated", "inconclusive"];
    if (!outcome || typeof outcome !== "string" || !allowedOutcomes.includes(outcome)) {
      return res.status(400).json({
        error: `Validation error: 'outcome' must be one of: ${allowedOutcomes.join(", ")}`,
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(404).json({ error: "Intervention not found" });
    }

    // Find the intervention using sanitized ID and explicit $eq operator
    const intervention = await InterventionModel.findOne({ _id: { $eq: String(id) } });
    if (!intervention) {
      return res.status(404).json({ error: "Intervention not found" });
    }

    // Cannot update outcome of a withdrawn intervention
    if (intervention.status === "withdrawn") {
      return res.status(400).json({
        error: "Validation error: Cannot update outcome of a withdrawn intervention",
      });
    }

    // RBAC: Only the original mentor can update the outcome
    const effectiveMentorId = user.identityId || user.id;
    if (intervention.mentorId !== user.id && intervention.mentorId !== effectiveMentorId) {
      return res.status(403).json({
        error: "Forbidden: Only the original mentor can update the outcome of this intervention",
      });
    }

    // Update outcome fields
    intervention.outcome = outcome;
    intervention.outcomeRecordedAt = new Date().toISOString();
    await intervention.save();

    return res.status(200).json({ intervention });
  } catch (err) {
    console.error("Error updating intervention outcome:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE /api/v1/interventions/:id
 * Soft delete / withdraw an intervention.
 *
 * Marks record status: "withdrawn", records withdrawnAt and withdrawnBy.
 * Retains record for institutional audit history while hiding it from default list views.
 */
export async function withdrawIntervention(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Missing user authentication" });
    }

    const id = sanitizeId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Validation error: Invalid intervention ID format" });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(404).json({ error: "Intervention not found" });
    }

    const intervention = await InterventionModel.findOne({ _id: { $eq: String(id) } });
    if (!intervention) {
      return res.status(404).json({ error: "Intervention not found" });
    }

    // RBAC: Only the assigned mentor can withdraw their intervention
    const effectiveMentorId = user.identityId || user.id;
    if (intervention.mentorId !== user.id && intervention.mentorId !== effectiveMentorId) {
      return res.status(403).json({
        error: "Forbidden: Only the assigned mentor can withdraw this intervention",
      });
    }

    // If already withdrawn, return idempotent success
    if (intervention.status === "withdrawn") {
      return res.status(200).json({
        message: "Intervention is already withdrawn",
        intervention,
      });
    }

    // Perform soft delete
    intervention.status = "withdrawn";
    intervention.withdrawnAt = new Date().toISOString();
    intervention.withdrawnBy = String(user.id);
    await intervention.save();

    return res.status(200).json({
      message: "Intervention withdrawn successfully",
      intervention,
    });
  } catch (err) {
    console.error("Error withdrawing intervention:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/v1/interventions
 * List interventions for a mentor, with optional filtering and pagination.
 *
 * Query params:
 *   - mentorId?: string (defaults to req.user.identityId || req.user.id for mentor role)
 *   - alertId?: string — filter by specific alert
 *   - status?: string — filter by status ('active', 'withdrawn')
 *   - includeWithdrawn?: boolean string ('true' to include withdrawn records, default false)
 *   - page?: number (default 1)
 *   - limit?: number (default 20, max 100)
 */
export async function listInterventions(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Missing user authentication" });
    }

    const effectiveUserMentorId = user.identityId || user.id;
    // Sanitize query parameters to prevent NoSQL injection
    const queryMentorId = sanitizeId(req.query.mentorId as string);
    const mentorId = queryMentorId || String(effectiveUserMentorId);
    const rawAlertId = req.query.alertId ? sanitizeId(req.query.alertId as string) : undefined;
    const includeWithdrawn = req.query.includeWithdrawn === "true";
    const statusParam = req.query.status ? sanitizeId(req.query.status as string) : undefined;

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    // RBAC: Mentors can only list their own interventions
    if (user.role === "mentor" && mentorId !== user.id && mentorId !== effectiveUserMentorId) {
      return res.status(403).json({
        error: "Forbidden: Mentors can only view their own interventions",
      });
    }

    // Build filter with sanitized values and explicit $eq operators to prevent NoSQL injection
    const filter: Record<string, any> = { mentorId: { $eq: String(mentorId) } };
    if (rawAlertId) {
      filter.alertId = { $eq: String(rawAlertId) };
    }

    // Default: hide withdrawn records unless specifically requested
    const allowedStatuses = ["active", "withdrawn"] as const;
    if (statusParam && (allowedStatuses as readonly string[]).includes(statusParam)) {
      filter.status = { $eq: statusParam };
    } else if (!includeWithdrawn) {
      filter.status = { $ne: "withdrawn" };
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        interventions: [],
        totalCount: 0,
        page,
        limit,
        totalPages: 0,
      });
    }

    const [interventions, totalCount] = await Promise.all([
      InterventionModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      InterventionModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      interventions,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    console.error("Error listing interventions:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
