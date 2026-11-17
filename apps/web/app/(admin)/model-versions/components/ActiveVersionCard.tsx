import React from "react";
import { RiskModelVersion } from "@academic-risk-radar/shared-types";
import { CheckCircle2 } from "lucide-react";
import { RiskBandSegmentedBar } from "./RiskBandSegmentedBar";

interface ActiveVersionCardProps {
  version: RiskModelVersion;
}

export function ActiveVersionCard({ version }: ActiveVersionCardProps) {
  const weights = (version.weights as Record<string, number>) || {};
  const thresholds = (version.thresholds as Record<string, number>) || {};

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem",
        marginBottom: "1.5rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
              Active configuration: {version.version}
            </h2>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                background: "var(--surface-2)",
                color: "var(--success)",
                padding: "0.2rem 0.5rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.75rem",
                fontWeight: 600,
                border: "1px solid var(--success)",
              }}
            >
              <CheckCircle2 size={12} />
              Active
            </span>
          </div>
          <p style={{ margin: "0.25rem 0 0", color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            Effective since {new Date(version.effectiveFrom).toLocaleDateString()} · Published by {version.createdBy || "System"}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {/* Factor weights with horizontal bars */}
        <div>
          <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-muted)" }}>
            Factor weights (sum: 100%)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {Object.entries(weights).map(([k, w]) => {
              const pct = Math.round(w * 100);
              return (
                <div key={k}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "0.2rem" }}>
                    <span style={{ color: "var(--text)" }}>{k.replace(/_/g, " ")}</span>
                    <span style={{ fontWeight: 600, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
                      {pct}%
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "6px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: "var(--primary)",
                        borderRadius: "var(--radius-sm)",
                        transition: "width 0.2s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk band cutoffs as single segmented gradient bar */}
        <div>
          <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-muted)" }}>
            Risk band cutoffs
          </h3>
          <RiskBandSegmentedBar thresholds={thresholds} />
        </div>
      </div>
    </div>
  );
}
