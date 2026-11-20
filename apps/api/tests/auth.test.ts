import assert from "node:assert/strict";
import { describe, it } from "node:test";
import express from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { UserModel, PasswordResetOtpModel } from "../src/db/schemas.js";
import authRouter from "../src/auth/auth.routes.js";
import { authenticateUser } from "../src/auth/rbac.middleware.js";

describe("Authentication & JWT Session Tests (Team Member 1 — Pawan)", () => {
  function createAuthTestServer() {
    const app = express();
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
    });
    app.use(express.json());
    app.use(limiter);
    app.use(authenticateUser);

    app.use("/api/v1/auth", authRouter);

    return app;
  }

  it("POST /auth/login with missing email or password returns 400 Bad Request", async () => {
    const app = createAuthTestServer();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      });

      assert.equal(res.status, 400);
      const json = (await res.json()) as any;
      assert.match(json.error, /Missing or invalid/i);
    } finally {
      server.close();
    }
  });

  it("POST /auth/login with non-existent user returns 401 Unauthorized", async () => {
    const app = createAuthTestServer();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    // Mock UserModel.findOne to return null
    const originalFindOne = UserModel.findOne;
    UserModel.findOne = (() => Promise.resolve(null)) as any;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "unknown@example.com", password: "Password123!" }),
      });

      assert.equal(res.status, 401);
      const json = (await res.json()) as any;
      assert.match(json.error, /Invalid email or password/i);
    } finally {
      UserModel.findOne = originalFindOne;
      server.close();
    }
  });

  it("POST /auth/login with invalid password returns 401 Unauthorized", async () => {
    const app = createAuthTestServer();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("CorrectPassword123!", salt);

    const mockUser = {
      _id: "USER_TEST_1",
      name: "Test User",
      email: "test@example.com",
      passwordHash,
      role: "instructor",
      assignedSections: ["SEC_101"],
    };

    const originalFindOne = UserModel.findOne;
    UserModel.findOne = (() => Promise.resolve(mockUser)) as any;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com", password: "WrongPassword!" }),
      });

      assert.equal(res.status, 401);
      const json = (await res.json()) as any;
      assert.match(json.error, /Invalid email or password/i);
    } finally {
      UserModel.findOne = originalFindOne;
      server.close();
    }
  });

  it("POST /auth/login with correct credentials returns 200 and signed JWT token", async () => {
    const app = createAuthTestServer();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("CorrectPassword123!", salt);

    const mockUser = {
      _id: "INST_001",
      name: "Prof. Ananya Sen",
      email: "instructor@radar.edu",
      passwordHash,
      role: "instructor",
      departmentId: "CSE",
      sectionIds: ["SEC-CSE-101"],
      identityId: "INST_001",
    };

    const originalFindOne = UserModel.findOne;
    UserModel.findOne = (() => Promise.resolve(mockUser)) as any;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "instructor@radar.edu", password: "CorrectPassword123!" }),
      });

      assert.equal(res.status, 200);
      const json = (await res.json()) as any;
      assert.equal(json.status, "success");
      assert.ok(json.token, "Response must include signed JWT token");
      assert.equal(json.user.email, "instructor@radar.edu");
      assert.equal(json.user.role, "instructor");

      // Verify GET /auth/me using the issued token in Authorization header
      const meRes = await fetch(`http://127.0.0.1:${port}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${json.token}` },
      });
      assert.equal(meRes.status, 200);
      const meJson = (await meRes.json()) as any;
      assert.equal(meJson.user.email, "instructor@radar.edu");
      assert.equal(meJson.user.role, "instructor");
    } finally {
      UserModel.findOne = originalFindOne;
      server.close();
    }
  });

  it("GET /auth/me without token returns 401 Unauthorized", async () => {
    const app = createAuthTestServer();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/me`);
      assert.equal(res.status, 401);
    } finally {
      server.close();
    }
  });

  it("POST /auth/logout returns 200 with success status", async () => {
    const app = createAuthTestServer();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/logout`, {
        method: "POST",
      });
      assert.equal(res.status, 200);
      const json = (await res.json()) as any;
      assert.equal(json.status, "success");
    } finally {
      server.close();
    }
  });

  describe("Forgot Password & OTP Workflow", () => {
    it("POST /auth/forgot-password/request-otp validates missing fields", async () => {
      const app = createAuthTestServer();
      const server = app.listen(0);
      const port = (server.address() as any).port;

      try {
        const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/forgot-password/request-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: "12409922" }), // missing email
        });
        assert.equal(res.status, 400);
      } finally {
        server.close();
      }
    });

    it("POST /auth/forgot-password/request-otp returns 404 when student/email does not match", async () => {
      const app = createAuthTestServer();
      const server = app.listen(0);
      const port = (server.address() as any).port;

      const origFindOne = UserModel.findOne;
      UserModel.findOne = (() => Promise.resolve(null)) as any;

      try {
        const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/forgot-password/request-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: "UNKNOWN_ID", email: "wrong@radar.edu" }),
        });
        assert.equal(res.status, 404);
      } finally {
        UserModel.findOne = origFindOne;
        server.close();
      }
    });

    it("POST /auth/forgot-password/request-otp succeeds for valid student and sends OTP", async () => {
      const app = createAuthTestServer();
      const server = app.listen(0);
      const port = (server.address() as any).port;

      const origUserFindOne = UserModel.findOne;
      const origOtpFindOne = PasswordResetOtpModel.findOne;
      const origOtpCreate = PasswordResetOtpModel.create;

      UserModel.findOne = (() =>
        Promise.resolve({
          _id: "12409922",
          name: "Rahul Sharma",
          email: "student@radar.edu",
          role: "student",
        })) as any;

      PasswordResetOtpModel.findOne = (() => ({
        sort: () => Promise.resolve(null),
      })) as any;

      let createdDoc: any = null;
      PasswordResetOtpModel.create = ((doc: any) => {
        createdDoc = doc;
        return Promise.resolve(doc);
      }) as any;

      try {
        const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/forgot-password/request-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: "12409922", email: "student@radar.edu" }),
        });

        assert.equal(res.status, 200);
        const json = (await res.json()) as any;
        assert.equal(json.status, "success");
        assert.equal(json.remainingRequestsToday, 9);
        assert.ok(createdDoc);
        assert.equal(createdDoc.studentId, "12409922");
      } finally {
        UserModel.findOne = origUserFindOne;
        PasswordResetOtpModel.findOne = origOtpFindOne;
        PasswordResetOtpModel.create = origOtpCreate;
        server.close();
      }
    });

    it("POST /auth/forgot-password/request-otp enforces 10 requests per day cap", async () => {
      const app = createAuthTestServer();
      const server = app.listen(0);
      const port = (server.address() as any).port;

      const origUserFindOne = UserModel.findOne;
      const origOtpFindOne = PasswordResetOtpModel.findOne;

      UserModel.findOne = (() =>
        Promise.resolve({
          _id: "12409922",
          name: "Rahul Sharma",
          email: "student@radar.edu",
          role: "student",
        })) as any;

      const recentWindow = new Date().toISOString();
      PasswordResetOtpModel.findOne = (() => ({
        sort: () =>
          Promise.resolve({
            studentId: "12409922",
            requestCountToday: 10, // already at 10 requests
            windowStart: recentWindow,
          }),
      })) as any;

      try {
        const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/forgot-password/request-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: "12409922", email: "student@radar.edu" }),
        });

        assert.equal(res.status, 429);
        const json = (await res.json()) as any;
        assert.match(json.error, /Daily verification limit reached/i);
        assert.equal(json.remainingRequestsToday, 0);
      } finally {
        UserModel.findOne = origUserFindOne;
        PasswordResetOtpModel.findOne = origOtpFindOne;
        server.close();
      }
    });

    it("POST /auth/forgot-password/reset validates minimum password length", async () => {
      const app = createAuthTestServer();
      const server = app.listen(0);
      const port = (server.address() as any).port;

      try {
        const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/forgot-password/reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: "12409922", otp: "123456", newPassword: "short" }),
        });
        assert.equal(res.status, 400);
        const json = (await res.json()) as any;
        assert.match(json.error, /at least 8 characters/i);
      } finally {
        server.close();
      }
    });

    it("POST /auth/forgot-password/reset succeeds with valid OTP and updates password", async () => {
      const app = createAuthTestServer();
      const server = app.listen(0);
      const port = (server.address() as any).port;

      const origOtpFindOne = PasswordResetOtpModel.findOne;
      const origOtpDelete = PasswordResetOtpModel.deleteMany;
      const origUserUpdate = UserModel.updateOne;
      const origUserFindOne = UserModel.findOne;

      UserModel.findOne = (() =>
        Promise.resolve({
          _id: "12409922",
          email: "student@radar.edu",
          name: "Test User",
        })) as any;

      const validRawOtp = "789123";
      const otpHash = await bcrypt.hash(validRawOtp, 10);
      const futureExpiry = new Date(Date.now() + 600000).toISOString();

      PasswordResetOtpModel.findOne = (() => ({
        sort: () =>
          Promise.resolve({
            studentId: "12409922",
            otpHash,
            expiresAt: futureExpiry,
            attempts: 0,
            save: () => Promise.resolve(),
          }),
      })) as any;

      let updatedPasswordHash: string | null = null;
      UserModel.updateOne = ((query: any, update: any) => {
        updatedPasswordHash = update.$set.passwordHash;
        return Promise.resolve({ modifiedCount: 1 });
      }) as any;

      PasswordResetOtpModel.deleteMany = (() => Promise.resolve({ deletedCount: 1 })) as any;

      try {
        const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/forgot-password/reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: "12409922",
            otp: validRawOtp,
            newPassword: "BrandNewPassword2026!",
          }),
        });

        assert.equal(res.status, 200);
        const json = (await res.json()) as any;
        assert.equal(json.status, "success");
        assert.ok(updatedPasswordHash);
        const isMatch = await bcrypt.compare("BrandNewPassword2026!", updatedPasswordHash!);
        assert.equal(isMatch, true);
      } finally {
        PasswordResetOtpModel.findOne = origOtpFindOne;
        PasswordResetOtpModel.deleteMany = origOtpDelete;
        UserModel.updateOne = origUserUpdate;
        UserModel.findOne = origUserFindOne;
        server.close();
      }
    });
  });
});
