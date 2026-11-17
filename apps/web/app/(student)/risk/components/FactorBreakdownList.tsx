import React from "react";
import { RiskFactor, RiskBand } from "@academic-risk-radar/shared-types";

const FACTOR_META: Record<string, { label: string; explanation: string }> = {
  attendance_deficit: {
    label: "Attendance deficit",
    explanation: "Impact from missed class hours relative to the 75% institutional threshold.",
  },
  assessment_deficit: {
    label: "Assessment grade deficit",
    explanation: "Impact from scores falling below course passing baselines.",
  },
  missing_assignments: {
    label: "Missing assignments",
    explanation: "Penalty for unsubmitted lab tasks and assignments.",
  },
  lms_engagement_deficit: {
    label: "LMS engagement deficit",
    explanation: "Activity on course portal and online learning modules.",
  },
  trend_deterioration: {
    label: "Trend change",
    explanation: "Comparison of recent weekly pace versus term trajectory.",
  },
};

interface FactorBreakdownListProps {
  factors: RiskFactor[];
  totalScore: number;
  riskScore: number;
  band: RiskBand;
  loading?: boolean;
}

export function FactorBreakdownList({
  factors = [],
  totalScore,
  riskScore,
  band,
  loading = false,
}: FactorBreakdownListProps) {
  if (loading) {
    return (
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius-md)", padding: "2rem", border: "1px solid var(--border)", textAlign: "center", color: "var(--text-muted)" }}>
        Loading factor breakdown...
      </div>
    );
  }

  if (factors.length === 0) {
    return (
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius-md)", padding: "2rem", border: "1px solid var(--border)", textAlign: "center", color: "var(--text-muted)" }}>
        <p style={{ margin: "0 0 0.5rem", fontWeight: 600, color: "var(--text)" }}>No factor data available</p>
        <p style={{ margin: 0, fontSize: "0.875rem" }}>Your courses currently have insufficient records to compute individual factor weights.</p>
      </div>
    );
  }

  const sortedFactors = [...factors].sort((a, b) => b.contribution - a.contribution);

  return (
    <div style={{ background: "var(--surface)", borderRadius: "var(--radius-md)", padding: "1.5rem", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
            Academic standing factor breakdown
          </h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Individual components contributing to your overall score ({riskScore} / 100). Sorted by impact.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {sortedFactors.map((factor, i) => {
          const meta = FACTOR_META[factor.name] ?? {
            label: factor.name.replace(/_/g, " "),
            explanation: "Calculated academic component.",
          };
          const sharePct = totalScore > 0 ? ((factor.contribution / totalScore) * 100).toFixed(0) : "0";
          const isTop = i === 0 && factor.contribution > 0;
          const barColor =
            factor.contribution >= 0.08
              ? "var(--danger)"
              : factor.contribution >= 0.04
              ? "var(--warning)"
              : "var(--success)";

          return (
            <div
              key={factor.name}
              style={{
                padding: "1rem 1.25rem",
                background: "var(--surface-2)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "0.75rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)" }}>
                      {meta.label}
                    </span>
                    {isTop && (
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                          color: "var(--primary)",
                          background: "var(--surface)",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        Primary area to improve
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem", lineHeight: 1.4 }}>
                    {meta.explanation}
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: barColor, fontVariantNumeric: "tabular-nums" }}>
                    +{(factor.contribution * 100).toFixed(1)} pts
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                    {sharePct}% of total · Weight {(factor.weight * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Thin progress bar */}
              <div style={{ height: 6, background: "var(--surface)", borderRadius: 3, border: "1px solid var(--border)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, Math.max(0, factor.value * 100))}%`,
                    background: barColor,
                    borderRadius: 2,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
