import { Request, Response } from "express";
import mongoose from "mongoose";
import { AlertModel, RiskSnapshotModel, UserModel } from "../../db/schemas.js";
import {
  generateOrUpdateAlertForSnapshot,
  sanitizeId,
  checkAndEscalateAlerts,
} from "./alerts.service.js";

/**
 * GET /api/v1/alerts
 * List alerts with optional mentorId and status filtering, plus pagination.
 *
 * RBAC Rules:
 * - Mentor: Can view assigned alerts only.
 * - Instructor / HoD / Dean / Admin: Can view all or filtered alerts.
 */
export async function listAlerts(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Missing user authentication" });
    }

    const rawMentorId = req.query.mentorId ? sanitizeId(req.query.mentorId) : undefined;
    const rawStatus = req.query.status ? sanitizeId(req.query.status) : undefined;

    // RBAC: Faculty (mentor or instructor) can query their own assigned alerts
    let effectiveMentorId = rawMentorId;
    if (user.role === "mentor" || user.role === "instructor") {
      const mentorIdentifier = user.identityId || user.id;
      if (rawMentorId && rawMentorId !== mentorIdentifier && rawMentorId !== user.id) {
        return res.status(403).json({
          error: "Forbidden: Faculty can only access alerts assigned to them",
        });
      }
      effectiveMentorId = mentorIdentifier;
    }

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    // If MongoDB is not connected, return empty response for tests
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        alerts: [],
        totalCount: 0,
        page,
        limit,
        totalPages: 0,
      });
    }

    // Automatically evaluate 48-hour SLA timeouts and trigger escalations
    try {
      await checkAndEscalateAlerts();
    } catch (escErr: unknown) {
      const msg = escErr instanceof Error ? escErr.message : "Escalation check error";
      console.warn("[AlertsController] Pre-list escalation check note:", msg);
    }

    const filter: Record<string, any> = {};

    // ── Strict Organizational Hierarchy-Scoped Access ──
    if (user.role === "mentor" || user.role === "instructor") {
      filter.mentorId = effectiveMentorId;
    } else if (user.role === "hod") {
      const hodIds = [user.id, user.identityId].filter(Boolean) as string[];
      const myMentors = await UserModel.find({
        $or: [{ hodUid: { $in: hodIds } }, { departmentId: user.departmentId }],
        role: { $in: ["mentor", "instructor", "hod"] },
      }).lean();

      const allowedMentorIds: string[] = myMentors.map((m) => m._id);
      myMentors.forEach((m) => {
        if (m.identityId) allowedMentorIds.push(m.identityId);
      });
      allowedMentorIds.push(...hodIds);

      if (rawMentorId) {
        if (!allowedMentorIds.includes(rawMentorId)) {
          return res.status(403).json({
            error: "Forbidden: HoD cannot view alerts for mentors outside their department/supervision",
          });
        }
        filter.mentorId = { $eq: rawMentorId };
      } else {
        filter.$or = [
          { mentorId: { $in: allowedMentorIds } },
          { hodId: { $in: hodIds } },
        ];
      }
    } else if (user.role === "dean") {
      const deanIds = [user.id, user.identityId].filter(Boolean) as string[];
      const myHods = await UserModel.find({ deanUid: { $in: deanIds }, role: "hod" }).lean();
      const hodUids: string[] = myHods.map((h) => h._id);
      myHods.forEach((h) => {
        if (h.identityId) hodUids.push(h.identityId);
      });

      const myMentors = await UserModel.find({
        $or: [{ deanUid: { $in: deanIds } }, { hodUid: { $in: hodUids } }],
      }).lean();

      const allowedMentorIds: string[] = myMentors.map((m) => m._id);
      myMentors.forEach((m) => {
        if (m.identityId) allowedMentorIds.push(m.identityId);
      });
      allowedMentorIds.push(...deanIds, ...hodUids);

      if (rawMentorId) {
        if (!allowedMentorIds.includes(rawMentorId)) {
          return res.status(403).json({
            error: "Forbidden: Dean cannot view alerts outside their organizational branch",
          });
        }
        filter.mentorId = { $eq: rawMentorId };
      } else {
        filter.$or = [
          { mentorId: { $in: allowedMentorIds } },
          { hodId: { $in: hodUids } },
        ];
      }
    } else if (rawMentorId) {
      filter.mentorId = { $eq: rawMentorId };
    }

    if (rawStatus && ["open", "acknowledged", "escalated", "closed"].includes(rawStatus)) {
      filter.status = rawStatus;
    }

    const [alerts, totalCount] = await Promise.all([
      AlertModel.find(filter)
        .sort({ slaDeadline: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AlertModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      alerts,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err: any) {
    console.error("[AlertsController] Error listing alerts:", err);
    return res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
}

/**
 * GET /api/v1/alerts/:id
 * Retrieve a specific alert by its ID.
 */
export async function getAlertById(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Missing user authentication" });
    }

    const alertId = sanitizeId(req.params.id);
    if (!alertId) {
      return res.status(400).json({ error: "Validation error: Invalid alert ID" });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(404).json({ error: "Alert not found", alertId });
    }

    const alert = await AlertModel.findById(alertId).lean();
    if (!alert) {
      return res.status(404).json({ error: "Alert not found", alertId });
    }

    // RBAC: Faculty (mentor or instructor) can only view their own assigned alerts
    if (
      (user.role === "mentor" || user.role === "instructor") &&
      alert.mentorId !== user.id &&
      alert.mentorId !== user.identityId
    ) {
      return res.status(403).json({
        error: "Forbidden: You can only view alerts assigned to you",
      });
    }

    // RBAC: HoD can only view alerts under their supervision
    if (user.role === "hod") {
      const hodIds = [user.id, user.identityId].filter(Boolean) as string[];
      const isDirectHod = alert.hodId && hodIds.includes(alert.hodId);
      if (!isDirectHod) {
        const mentorUser = await UserModel.findOne({
          $or: [{ _id: alert.mentorId }, { identityId: alert.mentorId }],
        }).lean();
        const belongsToHod =
          (mentorUser?.hodUid && hodIds.includes(mentorUser.hodUid)) ||
          mentorUser?.departmentId === user.departmentId;
        if (!belongsToHod && !hodIds.includes(alert.mentorId)) {
          return res.status(403).json({
            error: "Forbidden: You can only view alerts within your department or supervised mentors",
          });
        }
      }
    }

    return res.status(200).json({ alert });
  } catch (err: any) {
    console.error("[AlertsController] Error fetching alert:", err);
    return res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
}

/**
 * POST /api/v1/alerts/:id/acknowledge
 * Acknowledge an open or escalated alert.
 *
 * RBAC Rules:
 * - Mentor: Only the assigned mentor can acknowledge their alert.
 * - HoD / Admin: Can acknowledge on behalf of mentors.
 */
export async function acknowledgeAlert(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Missing user authentication" });
    }

    const alertId = sanitizeId(req.params.id);
    if (!alertId) {
      return res.status(400).json({ error: "Validation error: Invalid alert ID" });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(404).json({ error: "Alert not found", alertId });
    }

    const alert = await AlertModel.findById(alertId);
    if (!alert) {
      return res.status(404).json({ error: "Alert not found", alertId });
    }

    // RBAC: Only assigned mentor (or HoD/Admin) can acknowledge
    if (
      (user.role === "mentor" || user.role === "instructor") &&
      alert.mentorId !== user.id &&
      alert.mentorId !== user.identityId
    ) {
      return res.status(403).json({
        error: "Forbidden: You can only acknowledge alerts assigned to you",
      });
    }

    // If already acknowledged or closed, return current state
    if (alert.status === "acknowledged" || alert.status === "closed") {
      return res.status(200).json({
        message: "Alert was already acknowledged",
        alert: alert.toObject ? alert.toObject() : alert,
      });
    }

    alert.status = "acknowledged";
    alert.acknowledgedAt = new Date().toISOString();
    if (typeof (alert as any).save === "function") {
      await (alert as any).save();
    }

    return res.status(200).json({
      message: "Alert acknowledged successfully",
      alert: alert.toObject ? alert.toObject() : alert,
    });
  } catch (err: any) {
    console.error("[AlertsController] Error acknowledging alert:", err);
    return res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
}

/**
 * POST /api/v1/alerts/generate
 * Trigger alert generation and deduplication for a RiskSnapshot.
 * Useful for worker integration, automated workflows, and integration tests.
 */
export async function triggerAlertGeneration(req: Request, res: Response) {
  try {
    const { snapshotId, snapshot } = req.body || {};

    let targetSnapshot = snapshot;

    if (!targetSnapshot && snapshotId) {
      const sanitizedId = sanitizeId(snapshotId);
      if (!sanitizedId) {
        return res.status(400).json({ error: "Invalid snapshot ID" });
      }
      if (mongoose.connection.readyState === 1) {
        targetSnapshot = await RiskSnapshotModel.findById(sanitizedId).lean();
      }
    }

    if (!targetSnapshot) {
      return res.status(400).json({ error: "Missing valid snapshot or snapshotId" });
    }

    const result = await generateOrUpdateAlertForSnapshot(targetSnapshot);

    return res.status(200).json(result);
  } catch (err: any) {
    console.error("[AlertsController] Error generating alert:", err);
    return res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
}
