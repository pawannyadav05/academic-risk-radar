import { Request, Response } from "express";
import crypto from "crypto";
import { InterventionModel, AlertModel } from "../../db/schemas.js";

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

    const { alertId, action, notes, followUpDate } = req.body;

    // Validate required fields
    if (!alertId || typeof alertId !== "string") {
      return res.status(400).json({ error: "Validation error: 'alertId' is required and must be a string" });
    }
    if (!action || typeof action !== "string" || action.trim().length === 0) {
      return res.status(400).json({ error: "Validation error: 'action' is required and must be a non-empty string" });
    }
    if (!notes || typeof notes !== "string") {
      return res.status(400).json({ error: "Validation error: 'notes' is required and must be a string" });
    }

    // Verify the alert exists
    const alert = await AlertModel.findById(alertId);
    if (!alert) {
      return res.status(404).json({ error: `Alert not found: ${alertId}` });
    }

    // RBAC: Only the assigned mentor can create interventions for their alerts
    if (alert.mentorId !== user.id) {
      return res.status(403).json({
        error: "Forbidden: Only the assigned mentor can create interventions for this alert",
      });
    }

    const now = new Date().toISOString();
    const intervention = new InterventionModel({
      _id: crypto.randomUUID(),
      alertId,
      mentorId: user.id,
      action: action.trim(),
      notes,
      createdAt: now,
      followUpDate: followUpDate || null,
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

    const { id } = req.params;
    const { outcome } = req.body;

    // Validate outcome value
    const allowedOutcomes = ["improved", "no_change", "deteriorated", "inconclusive"];
    if (!outcome || !allowedOutcomes.includes(outcome)) {
      return res.status(400).json({
        error: `Validation error: 'outcome' must be one of: ${allowedOutcomes.join(", ")}`,
      });
    }

    // Find the intervention
    const intervention = await InterventionModel.findById(id);
    if (!intervention) {
      return res.status(404).json({ error: `Intervention not found: ${id}` });
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

    const mentorId = (req.query.mentorId as string) || user.id;
    const alertId = req.query.alertId as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    // RBAC: Mentors can only list their own interventions
    if (user.role === "mentor" && mentorId !== user.id) {
      return res.status(403).json({
        error: "Forbidden: Mentors can only view their own interventions",
      });
    }

    // Build filter
    const filter: Record<string, string> = { mentorId };
    if (alertId) {
      filter.alertId = alertId;
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
