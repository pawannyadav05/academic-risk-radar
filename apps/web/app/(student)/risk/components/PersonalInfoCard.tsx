import React from "react";
import { RiskBand } from "@academic-risk-radar/shared-types";
import { BAND_CONFIG } from "./StudentProfileCard";

interface PersonalInfoCardProps {
  name: string;
  email: string;
  section: string;
  department: string;
  enrolmentId: string;
  modelVersion: string;
  riskScore: number;
  band: RiskBand;
}

export function PersonalInfoCard({
  name,
  email,
  section,
  department,
  enrolmentId,
  modelVersion,
  riskScore,
  band,
}: PersonalInfoCardProps) {
  const bandInfo = BAND_CONFIG[band] || BAND_CONFIG.low;

  return (
    <div style={{ background: "#FFFFFF", borderRadius: "8px", padding: "1.5rem", border: "1px solid #D9DFDD" }}>
      <div style={{
        fontSize: "0.9375rem", fontWeight: "700", color: "#1B2A33",
        marginBottom: "1.25rem", paddingBottom: "0.75rem",
        borderBottom: "1px solid #D9DFDD",
      }}>
        Academic standing details
      </div>

      {[
        { label: "Student name", value: name },
        { label: "Institutional email", value: email },
        { label: "Student ID", value: enrolmentId },
        { label: "Assigned section", value: section || "Assigned Section" },
        { label: "Department", value: department || "Computer Science" },
      ].map((row, i, arr) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.75rem",
          padding: "0.6rem 0",
          borderBottom: i < arr.length - 1 ? "1px solid #F2F4F3" : "none",
        }}>
          <span style={{ fontSize: "0.8125rem", color: "#5B6B75" }}>{row.label}</span>
          <span style={{ fontSize: "0.8125rem", color: "#1B2A33", fontWeight: 500, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
            {row.value}
          </span>
        </div>
      ))}

      {/* About your score */}
      <div style={{ marginTop: "1.25rem", padding: "0.875rem 1rem", background: "#F2F4F3", borderRadius: "4px", border: "1px solid #D9DFDD" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#1B2A33", marginBottom: "0.6rem" }}>
          About your standing
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
          <span style={{ fontSize: "0.8125rem", color: "#5B6B75" }}>Scoring model</span>
          <span style={{ fontSize: "0.8125rem", color: "#1B2A33", fontWeight: 600 }}>{modelVersion}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
          <span style={{ fontSize: "0.8125rem", color: "#5B6B75" }}>Standing score</span>
          <span style={{ fontSize: "0.8125rem", color: bandInfo.color, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{riskScore} / 100</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.8125rem", color: "#5B6B75" }}>Status</span>
          <span style={{ fontSize: "0.8125rem", color: bandInfo.color, fontWeight: 600 }}>{bandInfo.label}</span>
        </div>
      </div>
    </div>
  );
}
