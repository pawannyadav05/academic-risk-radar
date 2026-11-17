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
    <div style={{ background: "var(--surface)", borderRadius: "var(--radius-md)", padding: "1.5rem", border: "1px solid var(--border)" }}>
      <div style={{
        fontSize: "0.9375rem", fontWeight: "700", color: "var(--text)",
        marginBottom: "1.25rem", paddingBottom: "0.75rem",
        borderBottom: "1px solid var(--border)",
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
          borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
        }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{row.label}</span>
          <span style={{ fontSize: "0.8125rem", color: "var(--text)", fontWeight: 500, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
            {row.value}
          </span>
        </div>
      ))}

      {/* About your score */}
      <div style={{ marginTop: "1.25rem", padding: "0.875rem 1rem", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.6rem" }}>
          About your standing
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Scoring model</span>
          <span style={{ fontSize: "0.8125rem", color: "var(--text)", fontWeight: 600 }}>{modelVersion}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Standing score</span>
          <span style={{ fontSize: "0.8125rem", color: bandInfo.color, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{riskScore} / 100</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Status</span>
          <span style={{ fontSize: "0.8125rem", color: bandInfo.color, fontWeight: 600 }}>{bandInfo.label}</span>
        </div>
      </div>
    </div>
  );
}
