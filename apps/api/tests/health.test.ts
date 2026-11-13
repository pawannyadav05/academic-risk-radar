process.env.NODE_ENV = "test";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import http from "node:http";
import mongoose from "mongoose";
import app from "../src/server.js";

function makeRequest(path: string): Promise<{ statusCode: number; data: any }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        return reject(new Error("Failed to get server address"));
      }

      const req = http.request(
        {
          hostname: "127.0.0.1",
          port: address.port,
          path,
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
        (res) => {
          let rawData = "";
          res.on("data", (chunk) => {
            rawData += chunk;
          });
          res.on("end", () => {
            server.close();
            try {
              const data = rawData ? JSON.parse(rawData) : null;
              resolve({ statusCode: res.statusCode || 500, data });
            } catch {
              resolve({ statusCode: res.statusCode || 500, data: rawData });
            }
          });
        }
      );

      req.on("error", (err) => {
        server.close();
        reject(err);
      });

      req.end();
    });
  });
}

describe("System Health & Readiness Probes (Assignment Gate)", () => {
  it("GET /health returns 200 with healthy status", async () => {
    const res = await makeRequest("/health");
    assert.equal(res.statusCode, 200);
    assert.equal(res.data.status, "healthy");
    assert.ok(res.data.timestamp);
  });

  it("GET /ready returns checks structure for MongoDB and Redis", async () => {
    const res = await makeRequest("/ready");
    assert.ok([200, 503].includes(res.statusCode));
    assert.ok(res.data.status === "ready" || res.data.status === "not_ready");
    assert.ok(res.data.checks);
    assert.ok(typeof res.data.checks.mongodb === "string");
    assert.ok(typeof res.data.checks.redis === "string");
  });
});
