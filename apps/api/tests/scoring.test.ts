import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import scoringRouter from "../src/modules/scoring/index.js";

test("Module M3 — Scoring Router Stage 1 Scaffold", async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/v1", scoringRouter);

  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === "object" && address !== null ? address.port : 0;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/students/STU100/risk`);
    assert.equal(res.status, 501, "Scaffold endpoint should return HTTP 501 Not Implemented");

    const body = (await res.json()) as any;
    assert.equal(body.status, "not_implemented");
    assert.equal(body.module, "M3");
    assert.equal(body.studentId, "STU100");
  } finally {
    server.close();
  }
});
