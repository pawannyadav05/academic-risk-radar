import React from "react";
import { RiskBand } from "@academic-risk-radar/shared-types";
import { CheckCircle, Clock, HelpCircle, AlertCircle } from "lucide-react";

export const BAND_CONFIG: Record<
  RiskBand,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  low: { label: "On track", color: "var(--success)", bg: "var(--surface-2)", border: "var(--success)", icon: <CheckCircle size={14} /> },
  moderate: { label: "Check in suggested", color: "var(--warning)", bg: "var(--surface-2)", border: "var(--warning)", icon: <Clock size={14} /> },
  high: { label: "Support recommended", color: "var(--danger)", bg: "var(--surface-2)", border: "var(--danger)", icon: <HelpCircle size={14} /> },
  critical: { label: "Immediate support", color: "var(--danger)", bg: "var(--surface-2)", border: "var(--danger)", icon: <AlertCircle size={14} /> },
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
}: StudentProfileCardProps) {
  const bandInfo = BAND_CONFIG[band] || BAND_CONFIG.low;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "ST";

  return (
    <div style={{ background: "var(--surface)", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "1.25rem", border: "1px solid var(--border)" }}>
      {/* Top Banner */}
      <div style={{
        height: "90px",
        background: "var(--surface-2)",
        borderBottom: "1px solid var(--border)",
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}>
        <div style={{
          position: "absolute", bottom: "-36px",
          width: "72px", height: "72px",
          borderRadius: "50%",
          border: `2px solid ${bandInfo.color}`,
          background: "var(--surface)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.1rem", fontWeight: "700", color: "var(--text)",
          letterSpacing: "0.05em",
          zIndex: 2,
        }}>
          {initials}
        </div>
      </div>

      {/* Main Stats Row */}
      <div style={{ paddingTop: "2.75rem", paddingBottom: "1.25rem", paddingInline: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", alignItems: "center", gap: "1rem", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "var(--success)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{cgpa}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>CGPA</div>
          </div>

          <div>
            <div style={{ fontSize: "1.125rem", fontWeight: "700", color: "var(--text)" }}>{name}</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{programme} {section ? `(${section})` : ""}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.1rem", fontVariantNumeric: "tabular-nums" }}>{enrolmentId}</div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.35rem",
              marginTop: "0.5rem", padding: "0.2rem 0.6rem",
              borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontWeight: "600",
              color: bandInfo.color, background: bandInfo.bg, border: `1px solid ${bandInfo.border}`,
            }}>
              {bandInfo.icon}
              {bandInfo.label}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: attendancePct < 75 ? "var(--warning)" : "var(--success)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{attendancePct}%</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>Attendance</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", alignItems: "center", borderTop: "1px solid var(--border)", paddingInline: "1.5rem" }}>
        {(["overview", "factors"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              padding: "0.85rem 1.1rem", border: "none", background: "transparent",
              color: activeTab === tab ? "var(--primary)" : "var(--text-muted)", fontWeight: activeTab === tab ? 600 : 400,
              fontSize: "0.8125rem", cursor: "pointer",
              borderBottom: activeTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
              display: "flex", alignItems: "center", gap: "0.4rem",
              transition: "color 0.15s ease",
            }}
          >
            {tab === "overview" ? "Standing overview" : "Factor breakdown"}
          </button>
        ))}
        {computedAt && (
          <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
            Last updated {new Date(computedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        )}
      </div>
    </div>
  );
}
