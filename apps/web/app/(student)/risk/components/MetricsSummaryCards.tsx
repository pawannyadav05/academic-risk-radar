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
  const attendanceColor = attendancePct < 75 ? "#D49A1F" : "#2E8B7A";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
      {/* 1. Academic Standing Score */}
      <div style={{
        background: "#FFFFFF", borderRadius: "8px", padding: "1.5rem",
        border: "1px solid #D9DFDD",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: "1.25rem" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1B2A33" }}>Standing score</span>
          <span style={{ marginLeft: "auto", fontSize: "0.875rem", fontWeight: 700, color: bandInfo.color, fontVariantNumeric: "tabular-nums" }}>
            {riskScore}
          </span>
        </div>
        <DonutRing
          value={rawRiskScore}
          color={bandInfo.color}
          size={150}
          label={`${riskScore}`}
          sublabel="out of 100"
        />
        <div style={{ marginTop: "0.875rem", fontSize: "0.8125rem", color: "#5B6B75", textAlign: "center" }}>
          {bandInfo.label}
        </div>
      </div>

      {/* 2. Attendance */}
      <div style={{
        background: "#FFFFFF", borderRadius: "8px", padding: "1.5rem",
        border: "1px solid #D9DFDD",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: "1.25rem" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1B2A33" }}>Attendance</span>
          <span style={{ marginLeft: "auto", fontSize: "0.875rem", fontWeight: 700, color: attendanceColor, fontVariantNumeric: "tabular-nums" }}>
            {attendancePct}%
          </span>
        </div>
        <DonutRing
          value={attendanceRate}
          color={attendanceColor}
          size={150}
          label={`${attendancePct}%`}
        />
        <div style={{ marginTop: "0.875rem", fontSize: "0.8125rem", color: "#5B6B75", textAlign: "center" }}>
          {attendancePct < 75 ? "Below 75% target" : "Above 75% target"}
        </div>
      </div>

      {/* 3. CGPA */}
      <div style={{
        background: "#FFFFFF", borderRadius: "8px", padding: "1.5rem",
        border: "1px solid #D9DFDD",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: "1.25rem" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1B2A33" }}>CGPA</span>
          <span style={{ marginLeft: "auto", fontSize: "0.875rem", fontWeight: 700, color: "#2E8B7A", fontVariantNumeric: "tabular-nums" }}>
            {cgpa}
          </span>
        </div>
        <DonutRing
          value={assessmentAvg}
          color="#2E8B7A"
          size={150}
          label={cgpa}
          sublabel="10.0 scale"
        />
        <div style={{ marginTop: "0.875rem", fontSize: "0.8125rem", color: "#5B6B75", textAlign: "center" }}>
          Cumulative grade average
        </div>
      </div>
    </div>
  );
}
