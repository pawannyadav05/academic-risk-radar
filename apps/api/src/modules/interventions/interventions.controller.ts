import { Request, Response } from "express";
import crypto from "crypto";
import { InterventionModel, AlertModel } from "../../db/schemas.js";

/**
 * Sanitize a string ID to prevent NoSQL injection.
 * Only allows alphanumeric characters, hyphens, and underscores.
 */
function sanitizeId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 128) return null;
  // Only allow safe characters: alphanumeric, hyphens, underscores, dots
  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) return null;
  return trimmed;
}

/**
 * POST /api/v1/interventions
 * Record a mentor's intervention action in response to an alert.
 *
 * Required body fields: alertId, action, notes
 * Optional body fields: followUpDate
 * mentorId is derived from req.user.id (authenticated mentor)
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

    // Verify the alert exists
    const alert = await AlertModel.findById(String(alertId));
    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    // RBAC: Only the assigned mentor can create interventions for their alerts
    if (alert.mentorId !== user.id) {
      return res.status(403).json({
        error: "Forbidden: Only the assigned mentor can create interventions for this alert",
      });
    }

    const now = new Date().toISOString();
    const sanitizedFollowUp = followUpDate && typeof followUpDate === "string" ? followUpDate : null;
    const intervention = new InterventionModel({
      _id: crypto.randomUUID(),
      alertId: String(alertId),
      mentorId: String(user.id),
      action,
      notes,
      createdAt: now,
      followUpDate: sanitizedFollowUp,
      outcome: null,
      outcomeRecordedAt: null,
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

    // Find the intervention using sanitized ID
    const intervention = await InterventionModel.findById(String(id));
    if (!intervention) {
      return res.status(404).json({ error: "Intervention not found" });
    }

    // RBAC: Only the original mentor can update the outcome
    if (intervention.mentorId !== user.id) {
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
 * GET /api/v1/interventions
 * List interventions for a mentor, with optional filtering and pagination.
 *
 * Query params:
 *   - mentorId?: string (defaults to req.user.id for mentor role)
 *   - alertId?: string — filter by specific alert
 *   - page?: number (default 1)
 *   - limit?: number (default 20, max 100)
 */
export async function listInterventions(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Missing user authentication" });
    }

    // Sanitize query parameters to prevent NoSQL injection
    const mentorId = sanitizeId(req.query.mentorId as string) || String(user.id);
    const rawAlertId = req.query.alertId ? sanitizeId(req.query.alertId as string) : undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    // RBAC: Mentors can only list their own interventions
    if (user.role === "mentor" && mentorId !== user.id) {
      return res.status(403).json({
        error: "Forbidden: Mentors can only view their own interventions",
      });
    }

    // Build filter with sanitized values only
    const filter: Record<string, string> = { mentorId: String(mentorId) };
    if (rawAlertId) {
      filter.alertId = String(rawAlertId);
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
