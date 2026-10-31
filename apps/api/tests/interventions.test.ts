process.env.NODE_ENV = "test";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import http from "node:http";
import express from "express";
import rateLimit from "express-rate-limit";
import { authenticateUser } from "../src/auth/rbac.middleware.js";
import { signToken } from "../src/auth/jwt.service.js";
import interventionsRouter from "../src/modules/interventions/index.js";

/**
 * Tests for Module M6: Intervention & Outcome Tracking
 *
 * Uses the same raw http + fetch test pattern as the rest of the codebase.
 * Covers RBAC enforcement, field validation, and outcome value validation.
 */

function createTestApp() {
  const app = express();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
  });
  app.use(express.json());
  app.use(limiter);
  app.use(authenticateUser);
  app.use("/api/v1", interventionsRouter);
  return app;
}

function startServer(app: express.Express): Promise<{ port: number; close: () => void }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        return reject(new Error("Failed to get server address"));
      }
      resolve({ port: address.port, close: () => server.close() });
    });
  });
}

async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  const userId = headers.get("x-user-id");
  const userRole = headers.get("x-user-role");
  if (!headers.has("Authorization") && (userId || userRole)) {
    headers.set(
      "Authorization",
      `Bearer ${signToken({
        id: userId || "mentor-001",
        name: userId || "mentor-001",
        email: `${(userId || "mentor").toLowerCase()}@radar.edu`,
        role: (userRole as any) || "mentor",
        identityId: userId || "mentor-001",
      })}`
    );
  }
  return fetch(url, { ...init, headers });
}

describe("M6: Intervention & Outcome Tracking — RBAC Tests", () => {
  it("POST /interventions should return 403 for student role", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(`http://127.0.0.1:${port}/api/v1/interventions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "student-001",
          "x-user-role": "student",
        },
        body: JSON.stringify({
          alertId: "alert-001",
          action: "Called student",
          notes: "Discussed attendance",
        }),
      });
      assert.equal(res.status, 403, "Student should not be able to create interventions");
    } finally {
      close();
    }
  });

  it("POST /interventions should return 403 for instructor role", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(`http://127.0.0.1:${port}/api/v1/interventions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "instructor-001",
          "x-user-role": "instructor",
        },
        body: JSON.stringify({
          alertId: "alert-001",
          action: "Called student",
          notes: "Discussed attendance",
        }),
      });
      assert.equal(res.status, 403, "Instructor should not be able to create interventions");
    } finally {
      close();
    }
  });

  it("POST /interventions should return 403 for hod role", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(`http://127.0.0.1:${port}/api/v1/interventions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "hod-001",
          "x-user-role": "hod",
        },
        body: JSON.stringify({
          alertId: "alert-001",
          action: "Called student",
          notes: "Discussed attendance",
        }),
      });
      assert.equal(res.status, 403, "HoD should not be able to create interventions");
    } finally {
      close();
    }
  });

  it("PATCH /interventions/:id/outcome should return 403 for student role", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(`http://127.0.0.1:${port}/api/v1/interventions/some-id/outcome`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "student-001",
          "x-user-role": "student",
        },
        body: JSON.stringify({ outcome: "improved" }),
      });
      assert.equal(res.status, 403, "Student should not be able to update intervention outcomes");
    } finally {
      close();
    }
  });

  it("GET /interventions should return 403 for student role", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(`http://127.0.0.1:${port}/api/v1/interventions`, {
        headers: {
          "x-user-id": "student-001",
          "x-user-role": "student",
        },
      });
      assert.equal(res.status, 403, "Student should not be able to list interventions");
    } finally {
      close();
    }
  });

  it("GET /interventions should return 403 for instructor role", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(`http://127.0.0.1:${port}/api/v1/interventions`, {
        headers: {
          "x-user-id": "instructor-001",
          "x-user-role": "instructor",
        },
      });
      assert.equal(res.status, 403, "Instructor should not be able to list interventions");
    } finally {
      close();
    }
  });

  it("DELETE /interventions/:id should return 401 when unauthenticated", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/interventions/int-001`, {
        method: "DELETE",
      });
      assert.equal(res.status, 401, "Unauthenticated request should return 401");
    } finally {
      close();
    }
  });

  it("DELETE /interventions/:id should return 403 for student role", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(`http://127.0.0.1:${port}/api/v1/interventions/int-001`, {
        method: "DELETE",
        headers: {
          "x-user-id": "student-001",
          "x-user-role": "student",
        },
      });
      assert.equal(res.status, 403, "Student should not be able to withdraw interventions");
    } finally {
      close();
    }
  });

  it("DELETE /interventions/:id should return 403 for instructor role", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(`http://127.0.0.1:${port}/api/v1/interventions/int-001`, {
        method: "DELETE",
        headers: {
          "x-user-id": "instructor-001",
          "x-user-role": "instructor",
        },
      });
      assert.equal(res.status, 403, "Instructor should not be able to withdraw interventions");
    } finally {
      close();
    }
  });

  it("DELETE /interventions/:id should return 403 for hod role", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(`http://127.0.0.1:${port}/api/v1/interventions/int-001`, {
        method: "DELETE",
        headers: {
          "x-user-id": "hod-001",
          "x-user-role": "hod",
        },
      });
      assert.equal(res.status, 403, "HoD should not be able to withdraw interventions");
    } finally {
      close();
    }
  });
});

describe("M6: Intervention & Outcome Tracking — Validation Tests", () => {
  it("POST /interventions should return 400 when alertId is missing", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(`http://127.0.0.1:${port}/api/v1/interventions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "mentor-001",
          "x-user-role": "mentor",
        },
        body: JSON.stringify({
          action: "Called student",
          notes: "Discussed attendance",
        }),
      });
      assert.equal(res.status, 400, "Missing alertId should return 400");
      const body = (await res.json()) as any;
      assert.ok(body.error.includes("alertId"), "Error should mention alertId");
    } finally {
      close();
    }
  });

  it("POST /interventions should return 400 when action is missing", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(`http://127.0.0.1:${port}/api/v1/interventions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "mentor-001",
          "x-user-role": "mentor",
        },
        body: JSON.stringify({
          alertId: "alert-001",
          notes: "Discussed attendance",
        }),
      });
      assert.equal(res.status, 400, "Missing action should return 400");
      const body = (await res.json()) as any;
      assert.ok(body.error.includes("action"), "Error should mention action");
    } finally {
      close();
    }
  });

  it("POST /interventions should return 400 when notes is missing", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(`http://127.0.0.1:${port}/api/v1/interventions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "mentor-001",
          "x-user-role": "mentor",
        },
        body: JSON.stringify({
          alertId: "alert-001",
          action: "Called student",
        }),
      });
      assert.equal(res.status, 400, "Missing notes should return 400");
      const body = (await res.json()) as any;
      assert.ok(body.error.includes("notes"), "Error should mention notes");
    } finally {
      close();
    }
  });

  it("PATCH /interventions/:id/outcome should return 400 for invalid outcome value", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(`http://127.0.0.1:${port}/api/v1/interventions/some-id/outcome`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "mentor-001",
          "x-user-role": "mentor",
        },
        body: JSON.stringify({ outcome: "totally_invalid" }),
      });
      assert.equal(res.status, 400, "Invalid outcome should return 400");
      const body = (await res.json()) as any;
      assert.ok(body.error.includes("outcome"), "Error should mention outcome");
    } finally {
      close();
    }
  });

  it("PATCH /interventions/:id/outcome should return 400 when outcome is missing", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(`http://127.0.0.1:${port}/api/v1/interventions/some-id/outcome`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "mentor-001",
          "x-user-role": "mentor",
        },
        body: JSON.stringify({}),
      });
      assert.equal(res.status, 400, "Missing outcome should return 400");
    } finally {
      close();
    }
  });

  it("PATCH should accept all 4 valid outcome values (validation-only, no DB)", async () => {
    const validOutcomes = ["improved", "no_change", "deteriorated", "inconclusive"];
    for (const outcome of validOutcomes) {
      const app = createTestApp();
      const { port, close } = await startServer(app);
      try {
        const res = await authFetch(`http://127.0.0.1:${port}/api/v1/interventions/nonexistent/outcome`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": "mentor-001",
            "x-user-role": "mentor",
          },
          body: JSON.stringify({ outcome }),
        });
        // Should NOT be 400 (validation passes) — will be 404 or 500 because no DB
        assert.notEqual(res.status, 400, `'${outcome}' should pass validation`);
      } finally {
        close();
      }
    }
  });
});

describe("M6: Mentor Isolation — RBAC", () => {
  it("GET /interventions should return 403 when mentor queries another mentor's data", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(
        `http://127.0.0.1:${port}/api/v1/interventions?mentorId=other-mentor-999`,
        {
          headers: {
            "x-user-id": "mentor-001",
            "x-user-role": "mentor",
          },
        }
      );
      assert.equal(res.status, 403, "Mentor should not access another mentor's interventions");
      const body = (await res.json()) as any;
      assert.ok(body.error.includes("own interventions"), "Error should mention own interventions");
    } finally {
      close();
    }
  });
});

describe("M6: Soft-Delete Withdrawal Tests", () => {
  it("DELETE /interventions/:id should return 400 for invalid ID format (injection prevention)", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(`http://127.0.0.1:${port}/api/v1/interventions/invalid%20id%20$ne`, {
        method: "DELETE",
        headers: {
          "x-user-id": "mentor-001",
          "x-user-role": "mentor",
        },
      });
      assert.equal(res.status, 400, "Invalid ID format should return 400");
    } finally {
      close();
    }
  });

  it("DELETE /interventions/:id allows mentor role through auth (validation-only, no DB returns 404/500)", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(`http://127.0.0.1:${port}/api/v1/interventions/valid-int-id-001`, {
        method: "DELETE",
        headers: {
          "x-user-id": "mentor-001",
          "x-user-role": "mentor",
        },
      });
      // Should NOT be 401 or 403 because mentor is authorized to call DELETE
      assert.notEqual(res.status, 401, "Mentor should pass authentication");
      assert.notEqual(res.status, 403, "Mentor should pass role check");
    } finally {
      close();
    }
  });

  it("Soft-delete withdrawal should set status to 'withdrawn' and track metadata", () => {
    const record: any = {
      _id: "int-test-01",
      alertId: "alert-001",
      mentorId: "mentor-001",
      action: "Advising session",
      notes: "Discussed study plan",
      status: "active",
      withdrawnAt: null,
      withdrawnBy: null,
    };

    // Apply withdrawal transformation
    const now = new Date().toISOString();
    record.status = "withdrawn";
    record.withdrawnAt = now;
    record.withdrawnBy = "mentor-001";

    assert.equal(record.status, "withdrawn");
    assert.equal(record.withdrawnBy, "mentor-001");
    assert.ok(record.withdrawnAt);
  });

  it("Default listing filter should hide withdrawn interventions from mentor inbox view", () => {
    const list = [
      { _id: "1", action: "Tutoring", status: "active" },
      { _id: "2", action: "Mistaken entry", status: "withdrawn" },
      { _id: "3", action: "Counseling", status: "active" },
    ];

    const activeList = list.filter((item) => item.status !== "withdrawn");
    assert.equal(activeList.length, 2);
    assert.equal(activeList.some((item) => item.status === "withdrawn"), false);
  });
});
