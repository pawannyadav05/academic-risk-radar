import assert from "node:assert/strict";
import { describe, it } from "node:test";
import bcrypt from "bcryptjs";
import { seedDemoDatabase } from "../src/modules/trends/seed-demo.js";
import { UserModel, StudentModel, AlertModel, RiskSnapshotModel } from "../src/db/schemas.js";

describe("M4/M5: Deterministic Database Demo Seeding (seed:demo)", () => {
  it("should verify bcrypt hash compatibility with demo password Password123!", async () => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync("Password123!", salt);
    assert.equal(bcrypt.compareSync("Password123!", hash), true);
    assert.equal(bcrypt.compareSync("WrongPassword", hash), false);
  });

  it("should have seedDemoDatabase function exported", () => {
    assert.equal(typeof seedDemoDatabase, "function");
  });

  it("should verify schemas have required demo collections defined", () => {
    assert.ok(UserModel);
    assert.ok(StudentModel);
    assert.ok(AlertModel);
    assert.ok(RiskSnapshotModel);
  });
});
