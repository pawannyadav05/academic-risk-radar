import React from "react";
import { RiskBand, RiskFactor } from "@academic-risk-radar/shared-types";
import { BAND_CONFIG } from "./StudentProfileCard";

const FACTOR_META: Record<string, { label: string }> = {
  attendance_deficit: { label: "Attendance deficit" },
  assessment_deficit: { label: "Assessment grade deficit" },
  missing_assignments: { label: "Missing assignments" },
  lms_engagement_deficit: { label: "LMS engagement deficit" },
  trend_deterioration: { label: "Trend change" },
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
    <div style={{ background: "#FFFFFF", borderRadius: "8px", padding: "1.5rem", border: "1px solid #D9DFDD" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1B2A33" }}>
          Standing factor breakdown
        </h3>
        <span style={{ fontSize: "0.8125rem", color: "#5B6B75" }}>
          Sorted by impact
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {sortedFactors.map((factor, i) => {
          const meta = FACTOR_META[factor.name] ?? { label: factor.name };
          const sharePct = totalScore > 0 ? ((factor.contribution / totalScore) * 100).toFixed(0) : "0";
          const isTop = i === 0 && factor.contribution > 0;
          const barColor =
            factor.contribution >= 0.07 ? "#8A4A7B" : factor.contribution >= 0.04 ? "#D49A1F" : "#2E8B7A";

          return (
            <div
              key={factor.name}
              style={{
                padding: "1rem 1.25rem",
                background: "#F2F4F3",
                borderRadius: "4px",
                border: "1px solid #D9DFDD",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.75rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1B2A33" }}>{meta.label}</span>
                    {isTop && (
                      <span style={{
                        fontSize: "0.6875rem", fontWeight: 600, color: "#2E8B7A",
                        background: "#FFFFFF", padding: "0.15rem 0.5rem",
                        borderRadius: "4px", border: "1px solid #2E8B7A",
                      }}>
                        Key contributor
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#5B6B75", marginTop: "0.2rem", fontVariantNumeric: "tabular-nums" }}>
                    Weight {(factor.weight * 100).toFixed(0)}% · Deficit {(factor.value * 100).toFixed(1)}%
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: barColor, fontVariantNumeric: "tabular-nums" }}>
                    +{(factor.contribution * 100).toFixed(1)}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#5B6B75", fontVariantNumeric: "tabular-nums" }}>{sharePct}% of score</div>
                </div>
              </div>

              <div style={{ height: 4, background: "#D9DFDD", borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${Math.min(100, Math.max(0, factor.value * 100))}%`,
                  background: barColor, borderRadius: 2,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: "1.25rem", padding: "1rem 1.25rem", background: "#F2F4F3",
        borderRadius: "4px", border: "1px solid #D9DFDD",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1B2A33" }}>
            Total standing score
          </div>
          <div style={{ fontSize: "0.75rem", color: "#5B6B75", marginTop: "0.2rem" }}>
            Calculated across attendance, assessments, and course engagement signals
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "1.25rem", fontWeight: 700, color: bandInfo.color, fontVariantNumeric: "tabular-nums" }}>{riskScore}</span>
          <span style={{ fontSize: "0.8125rem", color: "#5B6B75" }}> / 100</span>
          <div style={{ fontSize: "0.75rem", color: bandInfo.color, fontWeight: 600, marginTop: "0.1rem" }}>
            {bandInfo.label}
          </div>
        </div>
      </div>
    </div>
  );
}
