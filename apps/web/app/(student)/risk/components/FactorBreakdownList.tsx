import React from "react";
import { RiskBand, RiskFactor } from "@academic-risk-radar/shared-types";
import { BAND_CONFIG } from "./StudentProfileCard";

const FACTOR_META: Record<string, { label: string; icon: string }> = {
  attendance_deficit: { label: "Attendance Deficit", icon: "🏫" },
  assessment_deficit: { label: "Assessment Grade Deficit", icon: "📝" },
  missing_assignments: { label: "Missing Assignments", icon: "📋" },
  lms_engagement_deficit: { label: "LMS Engagement Deficit", icon: "💻" },
  trend_deterioration: { label: "Trend Deterioration", icon: "📉" },
};

interface FactorBreakdownListProps {
  factors: RiskFactor[];
  totalScore: number;
  riskScore: number;
  band: RiskBand;
}

export function FactorBreakdownList({
  factors,
  totalScore,
  riskScore,
  band,
}: FactorBreakdownListProps) {
  const bandInfo = BAND_CONFIG[band] || BAND_CONFIG.low;
  const sortedFactors = [...factors].sort((a, b) => b.contribution - a.contribution);

  return (
    <div style={{ background: "#0f172a", borderRadius: "16px", padding: "1.5rem", border: "1px solid #1e293b" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#f1f5f9" }}>
          Risk Factor Breakdown
        </h3>
        <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
          Sorted by impact — highest contributor first
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {sortedFactors.map((factor, i) => {
          const meta = FACTOR_META[factor.name] ?? { label: factor.name, icon: "⚙️" };
          const sharePct = totalScore > 0 ? ((factor.contribution / totalScore) * 100).toFixed(0) : "0";
          const isTop = i === 0 && factor.contribution > 0;
          const barColor =
            factor.contribution >= 0.07 ? "#ef4444" : factor.contribution >= 0.04 ? "#f59e0b" : "#22c55e";

          return (
            <div
              key={factor.name}
              style={{
                padding: "1.1rem 1.25rem",
                background: isTop ? "rgba(249,115,22,0.05)" : "#090e1a",
                borderRadius: "12px",
                border: `1px solid ${isTop ? "rgba(249,115,22,0.18)" : "#1e293b"}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{meta.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#f1f5f9" }}>{meta.label}</span>
                    {isTop && (
                      <span style={{
                        fontSize: "0.62rem", fontWeight: 700, color: "#f97316",
                        background: "rgba(249,115,22,0.12)", padding: "0.1rem 0.45rem",
                        borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>
                        Top Driver
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.15rem" }}>
                    Weight: {(factor.weight * 100).toFixed(0)}% · Raw deficit: {(factor.value * 100).toFixed(1)}%
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, color: barColor }}>
                    +{(factor.contribution * 100).toFixed(1)}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#64748b" }}>{sharePct}% of total</div>
                </div>
              </div>

              <div style={{ height: 5, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${Math.min(100, Math.max(0, factor.value * 100))}%`,
                  background: barColor, borderRadius: 3,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: "1.25rem", padding: "0.9rem 1.25rem", background: "#090e1a",
        borderRadius: "12px", border: "1px solid #1e293b",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Σ Composite Risk Score
          </div>
          <div style={{ fontSize: "0.73rem", color: "#475569", marginTop: "0.2rem" }}>
            SUM(weight × factor value) across all academic signals
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "1.35rem", fontWeight: 800, color: bandInfo.color }}>{riskScore}</span>
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}> / 100</span>
          <div style={{ fontSize: "0.75rem", color: bandInfo.color, fontWeight: 600, marginTop: "0.1rem" }}>
            {bandInfo.label}
          </div>
        </div>
      </div>
    </div>
  );
}
