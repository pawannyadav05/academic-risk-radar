import React from "react";
import { RiskBand } from "@academic-risk-radar/shared-types";

export const BAND_CONFIG: Record<
  RiskBand,
  { label: string; color: string; bg: string; border: string }
> = {
  low: { label: "Low Risk", color: "#22c55e", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.25)" },
  moderate: { label: "Moderate Risk", color: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)" },
  high: { label: "High Risk", color: "#ef4444", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.25)" },
  critical: { label: "Critical Risk", color: "#dc2626", bg: "rgba(220,38,38,0.12)", border: "rgba(220,38,38,0.30)" },
};

interface StudentProfileCardProps {
  name: string;
  enrolmentId: string;
  programme: string;
  section: string;
  cgpa: string;
  attendancePct: number;
  band: RiskBand;
  activeTab: "overview" | "factors";
  onTabChange: (tab: "overview" | "factors") => void;
  computedAt?: string;
  modelVersion?: string;
}

export function StudentProfileCard({
  name,
  enrolmentId,
  programme,
  section,
  cgpa,
  attendancePct,
  band,
  activeTab,
  onTabChange,
  computedAt,
  modelVersion,
}: StudentProfileCardProps) {
  const bandInfo = BAND_CONFIG[band] || BAND_CONFIG.low;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "ST";

  return (
    <div style={{ background: "#0f172a", borderRadius: "16px", overflow: "hidden", marginBottom: "1.25rem", border: "1px solid #1e293b" }}>
      {/* Top Banner */}
      <div style={{
        height: "110px",
        background: "linear-gradient(120deg, #0d1f3c 0%, #162544 50%, #0f2238 100%)",
        borderBottom: "1px solid #1e293b",
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}>
        <div style={{
          position: "absolute", bottom: "-40px",
          width: "80px", height: "80px",
          borderRadius: "50%",
          border: `2.5px solid ${bandInfo.color}`,
          background: "#1e293b",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc",
          letterSpacing: "0.05em",
          boxShadow: `0 0 0 3px #0f172a, 0 0 18px ${bandInfo.color}55`,
          zIndex: 2,
        }}>
          {initials}
        </div>
      </div>

      {/* Main Stats Row */}
      <div style={{ paddingTop: "3rem", paddingBottom: "1.25rem", paddingInline: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", alignItems: "center", gap: "1rem", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#22c55e", lineHeight: 1 }}>{cgpa}</div>
            <div style={{ fontSize: "0.7rem", color: "#475569", marginTop: "0.3rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>CGPA</div>
          </div>

          <div>
            <div style={{ fontSize: "1.15rem", fontWeight: "700", color: "#f1f5f9" }}>{name}</div>
            <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.2rem" }}>{programme} {section ? `(${section})` : ""}</div>
            <div style={{ fontSize: "0.72rem", color: "#475569", marginTop: "0.1rem" }}>{enrolmentId}</div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.35rem",
              marginTop: "0.5rem", padding: "0.2rem 0.7rem",
              borderRadius: "9999px", fontSize: "0.72rem", fontWeight: "600",
              color: bandInfo.color, background: bandInfo.bg, border: `1px solid ${bandInfo.border}`,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: bandInfo.color, display: "inline-block" }} />
              {bandInfo.label}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#f59e0b", lineHeight: 1 }}>{attendancePct}%</div>
            <div style={{ fontSize: "0.7rem", color: "#475569", marginTop: "0.3rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Attendance</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", alignItems: "center", borderTop: "1px solid #1e293b", paddingInline: "1.5rem" }}>
        {(["overview", "factors"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              padding: "0.85rem 1.1rem", border: "none", background: "transparent",
              color: activeTab === tab ? "#f97316" : "#475569", fontWeight: activeTab === tab ? 600 : 400,
              fontSize: "0.83rem", cursor: "pointer",
              borderBottom: activeTab === tab ? "2px solid #f97316" : "2px solid transparent",
              display: "flex", alignItems: "center", gap: "0.4rem",
            }}
          >
            <span>{tab === "overview" ? "🧮" : "📊"}</span>
            {tab === "overview" ? "Risk Overview" : "Factor Breakdown"}
          </button>
        ))}
        {computedAt && (
          <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#64748b" }}>
            Last computed: {new Date(computedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            {modelVersion ? ` · Model ${modelVersion}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}
