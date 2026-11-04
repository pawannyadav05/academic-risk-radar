import React from "react";
import { RiskModelVersion } from "@academic-risk-radar/shared-types";
import { CheckCircle2 } from "lucide-react";

interface ActiveVersionCardProps {
  version: RiskModelVersion;
}

export function ActiveVersionCard({ version }: ActiveVersionCardProps) {
  const weights = version.weights as Record<string, number>;
  const thresholds = version.thresholds as Record<string, number>;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #D9DFDD",
        borderRadius: "8px",
        padding: "1.25rem",
        marginBottom: "1.5rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600, color: "#1B2A33" }}>
              Active configuration: {version.version}
            </h2>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                background: "#E8F5F1",
                color: "#2E8B7A",
                padding: "0.2rem 0.5rem",
                borderRadius: "4px",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={12} />
              Active
            </span>
          </div>
          <p style={{ margin: "0.25rem 0 0", color: "#5B6B75", fontSize: "0.8125rem" }}>
            Effective since {new Date(version.effectiveFrom).toLocaleDateString()} · Published by {version.createdBy}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <div>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "#5B6B75" }}>
            Factor weights (sum: 100%)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {Object.entries(weights).map(([k, w]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8125rem",
                  borderBottom: "1px solid #F2F4F3",
                  paddingBottom: "0.25rem",
                }}
              >
                <span style={{ color: "#1B2A33" }}>{k.replace(/_/g, " ")}</span>
                <span style={{ fontWeight: 600, color: "#2D5BA3", fontVariantNumeric: "tabular-nums" }}>
                  {(w * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "#5B6B75" }}>
            Risk band cutoffs
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {Object.entries(thresholds).map(([b, t]) => (
              <div
                key={b}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8125rem",
                  borderBottom: "1px solid #F2F4F3",
                  paddingBottom: "0.25rem",
                }}
              >
                <span style={{ color: "#1B2A33", textTransform: "capitalize" }}>{b}</span>
                <span style={{ fontWeight: 600, color: "#1B2A33", fontVariantNumeric: "tabular-nums" }}>
                  &le; {t.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

