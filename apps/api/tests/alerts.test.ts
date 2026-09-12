process.env.NODE_ENV = "test";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import http from "node:http";
import app from "../src/server.js";

function makeRequest(path: string, method: string = "GET", body?: object): Promise<{ statusCode: number; data: any }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        return reject(new Error("Failed to get server address"));
      }

      const postData = body ? JSON.stringify(body) : "";
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port: address.port,
          path,
          method,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
          },
        },
        (res) => {
          let rawData = "";
          res.on("data", (chunk) => {
            rawData += chunk;
          });
          res.on("end", () => {
            server.close();
            try {
              const data = JSON.parse(rawData);
              resolve({ statusCode: res.statusCode || 500, data });
            } catch (err) {
              resolve({ statusCode: res.statusCode || 500, data: rawData });
            }
          });
        }
      );

      req.on("error", (err) => {
        server.close();
        reject(err);
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  });
}

describe("M5: Alert Routing & Mentor Inbox — API Route Scaffolds", () => {
  it("GET /api/v1/alerts should return HTTP 501 Stage 2 pending payload", async () => {
    const res = await makeRequest("/api/v1/alerts?mentorId=MNT100&status=open", "GET");
    assert.equal(res.statusCode, 501);
    assert.equal(res.data.status, "not_implemented");
    assert.equal(res.data.module, "M5");
    assert.equal(res.data.owner, "Team Member 2 (Vani Bhardwaj)");
  });

  it("POST /api/v1/alerts/:id/acknowledge should return HTTP 501 Stage 2 pending payload", async () => {
    const res = await makeRequest("/api/v1/alerts/60d5ecb8b3b3a123456789ab/acknowledge", "POST");
    assert.equal(res.statusCode, 501);
    assert.equal(res.data.status, "not_implemented");
    assert.equal(res.data.module, "M5");
    assert.equal(res.data.owner, "Team Member 2 (Vani Bhardwaj)");
  });
});
