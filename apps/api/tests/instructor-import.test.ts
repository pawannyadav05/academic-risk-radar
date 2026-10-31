process.env.NODE_ENV = "test";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import http from "node:http";
import express from "express";
import rateLimit from "express-rate-limit";
import { authenticateUser } from "../src/auth/rbac.middleware.js";
import { signToken } from "../src/auth/jwt.service.js";
import instructorImportRouter from "../src/modules/ingestion/instructor-import.routes.js";

function createTestApp() {
  const app = express();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
  });
  app.use(express.json());
  app.use(limiter);
  app.use(authenticateUser);
  app.use("/api/v1", instructorImportRouter);
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

async function authFetch(url: string, claims?: any, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (claims) {
    headers.set("Authorization", `Bearer ${signToken(claims)}`);
  }
  return fetch(url, { ...init, headers });
}

describe("Instructor Section Academic Submission — RBAC & Validation Tests", () => {
  it("POST /sections/:sectionId/imports/:source returns 401 when unauthenticated", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/sections/SEC-CSE-101/imports/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvData: "studentId,sectionId,date,status,sourceRef\nSTU-001,SEC-CSE-101,2026-03-01T09:00:00Z,present,RFID" }),
      });
      assert.equal(res.status, 401, "Unauthenticated request should return 401");
    } finally {
      close();
    }
  });

  it("POST /sections/:sectionId/imports/:source returns 403 for student role", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(
        `http://127.0.0.1:${port}/api/v1/sections/SEC-CSE-101/imports/attendance`,
        { id: "stu-1", name: "Student", email: "student@radar.edu", role: "student" },
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvData: "studentId,sectionId,date,status,sourceRef\nSTU-001,SEC-CSE-101,2026-03-01T09:00:00Z,present,RFID" }),
        }
      );
      assert.equal(res.status, 403, "Student should not be able to submit section data");
    } finally {
      close();
    }
  });

  it("POST /sections/:sectionId/imports/:source returns 403 for mentor role", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(
        `http://127.0.0.1:${port}/api/v1/sections/SEC-CSE-101/imports/attendance`,
        { id: "mtr-1", name: "Mentor", email: "mentor@radar.edu", role: "mentor" },
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvData: "studentId,sectionId,date,status,sourceRef\nSTU-001,SEC-CSE-101,2026-03-01T09:00:00Z,present,RFID" }),
        }
      );
      assert.equal(res.status, 403, "Mentor should not be able to submit section data");
    } finally {
      close();
    }
  });

  it("NEGATIVE ACCESS: Instructor CANNOT submit data for a section outside their assigned scope (returns 403)", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(
        `http://127.0.0.1:${port}/api/v1/sections/SEC-OTHER-999/imports/attendance`,
        {
          id: "inst-1",
          name: "Instructor Pawan",
          email: "instructor@radar.edu",
          role: "instructor",
          sectionIds: ["SEC-CSE-101"],
        },
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvData: "studentId,sectionId,date,status,sourceRef\nSTU-001,SEC-OTHER-999,2026-03-01T09:00:00Z,present,RFID" }),
        }
      );
      assert.equal(res.status, 403, "Instructor must be denied access to unassigned section");
      const body = (await res.json()) as any;
      assert.ok(body.error.includes("not assigned to section"), "Error message should mention section assignment");
    } finally {
      close();
    }
  });

  it("POST /sections/:sectionId/imports/:source returns 400 for unsupported source", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(
        `http://127.0.0.1:${port}/api/v1/sections/SEC-CSE-101/imports/unsupported_type`,
        {
          id: "inst-1",
          name: "Instructor Pawan",
          email: "instructor@radar.edu",
          role: "instructor",
          sectionIds: ["SEC-CSE-101"],
        },
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvData: "sample data" }),
        }
      );
      assert.equal(res.status, 400, "Unsupported source should return 400");
    } finally {
      close();
    }
  });

  it("POST /sections/:sectionId/imports/:source returns 400 for empty csvData", async () => {
    const app = createTestApp();
    const { port, close } = await startServer(app);
    try {
      const res = await authFetch(
        `http://127.0.0.1:${port}/api/v1/sections/SEC-CSE-101/imports/attendance`,
        {
          id: "inst-1",
          name: "Instructor Pawan",
          email: "instructor@radar.edu",
          role: "instructor",
          sectionIds: ["SEC-CSE-101"],
        },
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvData: "" }),
        }
      );
      assert.equal(res.status, 400, "Empty csvData should return 400");
    } finally {
      close();
    }
  });
});

