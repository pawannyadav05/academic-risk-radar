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
    <div style={{ background: "#0f172a", borderRadius: "16px", padding: "1.5rem", border: "1px solid #1e293b" }}>
      <div style={{
        fontSize: "0.95rem", fontWeight: "700", color: "#f1f5f9",
        marginBottom: "1.25rem", paddingBottom: "0.75rem",
        borderBottom: "1px solid #1e293b",
      }}>
        Academic standing details
      </div>

      {[
        { icon: "👤", label: "Student Name", value: name },
        { icon: "✉️", label: "Email", value: email },
        { icon: "🆔", label: "Student ID", value: enrolmentId },
        { icon: "🏫", label: "Section", value: section || "Assigned Section" },
        { icon: "🏛️", label: "Department", value: department || "Computer Science" },
      ].map((row, i, arr) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.6rem 0",
          borderBottom: i < arr.length - 1 ? "1px solid #0d1526" : "none",
        }}>
          <span style={{ fontSize: "1rem", flexShrink: 0 }}>{row.icon}</span>
          <span style={{ fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.4, wordBreak: "break-all" }}>
            {row.value}
          </span>
        </div>
      ))}

      {/* Scoring Engine Meta Box */}
      <div style={{ marginTop: "1.25rem", padding: "0.875rem 1rem", background: "#090e1a", borderRadius: "10px", border: "1px solid #1e293b" }}>
        <div style={{ fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
          Scoring Engine
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Model Version</span>
          <span style={{ fontSize: "0.78rem", color: "#f97316", fontWeight: 600 }}>{modelVersion}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Composite Risk</span>
          <span style={{ fontSize: "0.78rem", color: bandInfo.color, fontWeight: 600 }}>{riskScore} / 100</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Assigned Band</span>
          <span style={{ fontSize: "0.78rem", color: bandInfo.color, fontWeight: 600 }}>{bandInfo.label}</span>
        </div>
      </div>
    </div>
  );
}
