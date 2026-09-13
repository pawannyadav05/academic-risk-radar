import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import adminRouter from "../src/modules/admin/index.js";

test("Module M8 — Admin Router Stage 1 Scaffold", async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/admin", adminRouter);

  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === "object" && address !== null ? address.port : 0;

  try {
    // Test GET /model-versions
    const resGet = await fetch(`http://127.0.0.1:${port}/api/v1/admin/model-versions`);
    assert.equal(resGet.status, 501, "GET /model-versions should return HTTP 501 Not Implemented");

    const bodyGet = (await resGet.json()) as any;
    assert.equal(bodyGet.status, "not_implemented");
    assert.equal(bodyGet.module, "M8");

    // Test POST /model-versions
    const resPost = await fetch(`http://127.0.0.1:${port}/api/v1/admin/model-versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: "v1.1.0" }),
    });
    assert.equal(resPost.status, 501, "POST /model-versions should return HTTP 501 Not Implemented");

    // Test GET /audit
    const resAudit = await fetch(`http://127.0.0.1:${port}/api/v1/admin/audit`);
    assert.equal(resAudit.status, 501, "GET /audit should return HTTP 501 Not Implemented");
  } finally {
    server.close();
  }
});
