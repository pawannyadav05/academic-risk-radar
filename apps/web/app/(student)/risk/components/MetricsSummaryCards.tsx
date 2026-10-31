import React from "react";
import { RiskBand } from "@academic-risk-radar/shared-types";
import { DonutRing } from "./DonutRing";
import { BAND_CONFIG } from "./StudentProfileCard";

interface MetricsSummaryCardsProps {
  riskScore: number;
  rawRiskScore: number; // 0.0 to 1.0
  band: RiskBand;
  attendanceRate: number; // 0.0 to 1.0
  attendancePct: number;
  assessmentAvg: number; // 0.0 to 1.0
  cgpa: string;
}

export function MetricsSummaryCards({
  riskScore,
  rawRiskScore,
  band,
  attendanceRate,
  attendancePct,
  assessmentAvg,
  cgpa,
}: MetricsSummaryCardsProps) {
  const bandInfo = BAND_CONFIG[band] || BAND_CONFIG.low;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
      {/* 1. Risk Score Donut */}
      <div style={{
        background: "#0f172a", borderRadius: "16px", padding: "1.5rem",
        border: `1px solid ${bandInfo.border}`,
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", marginBottom: "1.25rem" }}>
          <span>⚡</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f1f5f9" }}>Risk Score</span>
          <span style={{ marginLeft: "auto", fontSize: "0.875rem", fontWeight: 700, color: bandInfo.color }}>
            {riskScore}
          </span>
        </div>
        <DonutRing
          value={rawRiskScore}
          color={bandInfo.color}
          size={158}
          label={`${riskScore}`}
          sublabel="/ 100"
        />
        <div style={{ marginTop: "0.875rem", fontSize: "0.73rem", color: "#64748b", textAlign: "center" }}>
          {bandInfo.label}
        </div>
      </div>

      {/* 2. Attendance Donut */}
      <div style={{
        background: "#0f172a", borderRadius: "16px", padding: "1.5rem",
        border: "1px solid #1e293b",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", marginBottom: "1.25rem" }}>
          <span>🏫</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f1f5f9" }}>Attendance</span>
          <span style={{ marginLeft: "auto", fontSize: "0.875rem", fontWeight: 700, color: "#f59e0b" }}>
            {attendancePct}%
          </span>
        </div>
        <DonutRing
          value={attendanceRate}
          color="#f59e0b"
          trackColor="#1e293b"
          size={158}
          label={`${attendancePct}%`}
        />
        <div style={{ marginTop: "0.875rem", fontSize: "0.73rem", color: "#64748b", textAlign: "center" }}>
          {attendancePct < 75 ? "Below 75% threshold" : "In good standing (≥75%)"}
        </div>
      </div>

      {/* 3. CGPA Donut */}
      <div style={{
        background: "#0f172a", borderRadius: "16px", padding: "1.5rem",
        border: "1px solid #1e293b",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", marginBottom: "1.25rem" }}>
          <span>📝</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f1f5f9" }}>CGPA</span>
          <span style={{ marginLeft: "auto", fontSize: "0.875rem", fontWeight: 700, color: "#22c55e" }}>
            {cgpa}
          </span>
        </div>
        <DonutRing
          value={assessmentAvg}
          color="#22c55e"
          trackColor="#1e293b"
          size={158}
          label={cgpa}
          sublabel="out of 10"
        />
        <div style={{ marginTop: "0.875rem", fontSize: "0.73rem", color: "#64748b", textAlign: "center" }}>
          Out of 10.0 scale
        </div>
      </div>
    </div>
  );
}
