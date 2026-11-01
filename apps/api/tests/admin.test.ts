import assert from "node:assert/strict";
import { describe, it } from "node:test";
import express from "express";
import rateLimit from "express-rate-limit";
import { authenticateUser } from "../src/auth/rbac.middleware.js";
import { signToken } from "../src/auth/jwt.service.js";
import adminRouter from "../src/modules/admin/index.js";
import ingestionRouter from "../src/modules/ingestion/index.js";

/**
 * Module M8: Configuration & Audit Router Tests (Stage 2)
 * Owned by Team Member 1 (Pawan)
 */
describe("Module M8 — Admin Router (Stage 2)", () => {
  function createTestServer() {
    const app = express();
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
    });
    app.use(express.json());
    app.use(limiter);
    app.use(authenticateUser);
    app.use("/api/v1/admin", adminRouter);
    app.use("/api/v1/admin", ingestionRouter);
    return app;
  }

  function getAdminAuthHeaders(extraHeaders: Record<string, string> = {}) {
    const token = signToken({
      id: "ADMIN_01",
      name: "System Admin",
      email: "admin@radar.edu",
      role: "admin",
      identityId: "ADMIN_01",
    });
    return {
      Authorization: `Bearer ${token}`,
      ...extraHeaders,
    };
  }

  function getStudentAuthHeaders(extraHeaders: Record<string, string> = {}) {
    const token = signToken({
      id: "STUDENT_01",
      name: "Rahul Sharma",
      email: "student@radar.edu",
      role: "student",
      identityId: "STU-001",
    });
    return {
      Authorization: `Bearer ${token}`,
      ...extraHeaders,
    };
  }

  it("GET /api/v1/admin/model-versions lists model versions with status 200", async () => {
    const app = createTestServer();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/admin/model-versions`, {
        headers: getAdminAuthHeaders(),
      });

      assert.equal(res.status, 200, "Should return HTTP 200 for admin listing");
      const body = (await res.json()) as any;
      assert.ok(Array.isArray(body), "Should return an array of model versions");
      assert.ok(body.length > 0, "Should have at least the default version");
      assert.equal(body[0].version, "v1.0.0");
    } finally {
      server.close();
    }
  });

  it("POST /api/v1/admin/model-versions computes impact preview without committing", async () => {
    const app = createTestServer();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/admin/model-versions`, {
        method: "POST",
        headers: getAdminAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          version: "v1.1.0-sim",
          weights: {
            attendance_deficit: 0.40,
            assessment_deficit: 0.30,
            missing_assignments: 0.15,
            lms_engagement_deficit: 0.05,
            trend_deterioration: 0.10,
          },
          thresholds: {
            low: 0.0,
            moderate: 0.20,
            high: 0.45,
            critical: 0.70,
          },
          commit: false,
        }),
      });

      assert.equal(res.status, 200, "Should return HTTP 200 with preview");
      const body = (await res.json()) as any;
      assert.equal(body.status, "preview");
      assert.equal(body.committed, false);
      assert.ok(body.preview, "Should return preview calculation");
      assert.ok(typeof body.preview.totalStudentsScored === "number");
      assert.ok(typeof body.preview.changedBandCount === "number");
    } finally {
      server.close();
    }
  });

  it("POST /api/v1/admin/model-versions returns 400 when missing required fields", async () => {
    const app = createTestServer();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/admin/model-versions`, {
        method: "POST",
        headers: getAdminAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          version: "v1.2.0-incomplete",
        }),
      });

      assert.equal(res.status, 400, "Should return HTTP 400 when weights/thresholds are missing");
    } finally {
      server.close();
    }
  });

  it("POST /api/v1/admin/model-versions/:v/activate returns 404 for non-existent version", async () => {
    const app = createTestServer();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/admin/model-versions/v9.9.9-ghost/activate`, {
        method: "POST",
        headers: getAdminAuthHeaders(),
      });

      assert.equal(res.status, 404, "Activating non-existent version should return HTTP 404");
    } finally {
      server.close();
    }
  });

  it("GET /api/v1/admin/audit returns paginated audit log reader", async () => {
    const app = createTestServer();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/admin/audit?page=1&limit=10`, {
        headers: getAdminAuthHeaders(),
      });

      assert.equal(res.status, 200, "Should return HTTP 200 for audit trail query");
      const body = (await res.json()) as any;
      assert.ok(Array.isArray(body.entries), "Should return array of audit entries");
      assert.equal(body.page, 1);
      assert.equal(body.limit, 10);
      assert.ok(typeof body.total === "number");
    } finally {
      server.close();
    }
  });

  it("GET /api/v1/admin/connectors/status returns 200 for admin and 403 for unauthorized role", async () => {
    const app = createTestServer();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      // 1. Unauthenticated -> 401
      const unauthRes = await fetch(`http://127.0.0.1:${port}/api/v1/admin/connectors/status`);
      assert.equal(unauthRes.status, 401, "Should return 401 when no token is provided");

      // 2. Student role -> 403
      const studentRes = await fetch(`http://127.0.0.1:${port}/api/v1/admin/connectors/status`, {
        headers: getStudentAuthHeaders(),
      });
      assert.equal(studentRes.status, 403, "Should return 403 for student role");

      // 3. Admin role -> 200
      const adminRes = await fetch(`http://127.0.0.1:${port}/api/v1/admin/connectors/status`, {
        headers: getAdminAuthHeaders(),
      });
      assert.equal(adminRes.status, 200, "Should return 200 for admin role");
      const body = (await adminRes.json()) as any;
      assert.equal(body.status, "operational");
      assert.ok(body.sources);
    } finally {
      server.close();
    }
  });

  it("GET /api/v1/admin/connectors/quarantine requires admin role", async () => {
    const app = createTestServer();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      // Student role -> 403
      const studentRes = await fetch(`http://127.0.0.1:${port}/api/v1/admin/connectors/quarantine`, {
        headers: getStudentAuthHeaders(),
      });
      assert.equal(studentRes.status, 403, "Should return 403 for student role");

      // Admin role -> 200
      const adminRes = await fetch(`http://127.0.0.1:${port}/api/v1/admin/connectors/quarantine`, {
        headers: getAdminAuthHeaders(),
      });
      assert.equal(adminRes.status, 200, "Should return 200 for admin role");
      const body = (await adminRes.json()) as any;
      assert.equal(body.status, "success");
      assert.ok(Array.isArray(body.quarantined));
    } finally {
      server.close();
    }
  });

  it("POST /api/v1/admin/connectors/:name/sync requires admin role", async () => {
    const app = createTestServer();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      // Student role -> 403
      const studentRes = await fetch(`http://127.0.0.1:${port}/api/v1/admin/connectors/attendance/sync`, {
        method: "POST",
        headers: getStudentAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ csvData: "studentId,sectionId,date,status\nSTU-001,SEC-1,2026-03-01,present" }),
      });
      assert.equal(studentRes.status, 403, "Should return 403 for student role on sync");
    } finally {
      server.close();
    }
  });
});
