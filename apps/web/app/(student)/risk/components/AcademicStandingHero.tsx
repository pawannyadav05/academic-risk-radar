import React from "react";
import { RiskBand } from "@academic-risk-radar/shared-types";
import { CheckCircle, Clock, HelpCircle, AlertCircle } from "lucide-react";

interface AcademicStandingHeroProps {
  score: number; // 0 to 100
  band: RiskBand;
}

const BAND_STATUS: Record<
  RiskBand,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode; description: string }
> = {
  low: {
    label: "On track",
    color: "var(--success)",
    bg: "var(--surface-2)",
    border: "var(--success)",
    icon: <CheckCircle size={16} strokeWidth={2.2} />,
    description: "Your academic momentum meets all department guidelines.",
  },
  moderate: {
    label: "Check-in suggested",
    color: "var(--warning)",
    bg: "var(--surface-2)",
    border: "var(--warning)",
    icon: <Clock size={16} strokeWidth={2.2} />,
    description: "A friendly review with your mentor is recommended to keep you steady.",
  },
  high: {
    label: "Support recommended",
    color: "var(--primary)",
    bg: "var(--surface-2)",
    border: "var(--primary)",
    icon: <HelpCircle size={16} strokeWidth={2.2} />,
    description: "Course milestones indicate additional academic guidance is advisable.",
  },
  critical: {
    label: "Immediate support",
    color: "var(--danger)",
    bg: "var(--surface-2)",
    border: "var(--danger)",
    icon: <AlertCircle size={16} strokeWidth={2.2} />,
    description: "Priority mentor intervention required to avoid course deficiency.",
  },
};

export function AcademicStandingHero({ score, band }: AcademicStandingHeroProps) {
  const current = BAND_STATUS[band] || BAND_STATUS.low;
  const clampedScore = Math.min(100, Math.max(0, score));

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--text)" }}>
              Academic standing
            </h2>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              {current.description}
            </p>
          </div>

          <div
            aria-label="Academic standing status chip"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.3rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--text)",
              background: current.bg,
              border: `1px solid ${current.border}`,
            }}
          >
            <span style={{ color: current.color, display: "inline-flex" }}>{current.icon}</span>
            <span>{current.label}</span>
          </div>
        </div>

        {/* Large score display */}
        <div style={{ margin: "1rem 0 1.25rem", display: "flex", alignItems: "baseline", gap: "0.35rem" }}>
          <span
            aria-label="Academic standing score number"
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              lineHeight: 1,
              color: current.color,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {clampedScore}
          </span>
          <span style={{ fontSize: "1.125rem", fontWeight: 500, color: "var(--text-muted)" }}>
            / 100
          </span>
        </div>
      </div>

      {/* 4-Band Scale Bar */}
      <div>
        <div
          aria-label="Academic standing 4-band scale bar"
          style={{
            position: "relative",
            height: "12px",
            background: "var(--surface-2)",
            borderRadius: "6px",
            border: "1px solid var(--border)",
            display: "flex",
            overflow: "visible",
            marginBottom: "0.625rem",
          }}
        >
          {/* Segment 1: Low (0-25) */}
          <div style={{ width: "25%", background: "var(--success)", opacity: 0.25, borderRadius: "5px 0 0 5px" }} />
          {/* Segment 2: Moderate (25-50) */}
          <div style={{ width: "25%", background: "var(--warning)", opacity: 0.3, borderLeft: "1px solid var(--surface)" }} />
          {/* Segment 3: High (50-75) */}
          <div style={{ width: "25%", background: "var(--primary)", opacity: 0.3, borderLeft: "1px solid var(--surface)" }} />
          {/* Segment 4: Critical (75-100) */}
          <div style={{ width: "25%", background: "var(--danger)", opacity: 0.3, borderLeft: "1px solid var(--surface)", borderRadius: "0 5px 5px 0" }} />

          {/* Marker at current score */}
          <div
            role="img"
            aria-label={`Score marker at ${clampedScore} points`}
            style={{
              position: "absolute",
              top: "-4px",
              left: `${clampedScore}%`,
              transform: "translateX(-50%)",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: current.color,
              border: "3px solid var(--surface)",
              boxShadow: "var(--shadow-sm)",
              zIndex: 3,
            }}
            title={`Score: ${clampedScore} / 100 (${current.label})`}
          />
        </div>

        {/* Labels under the bar */}
        <div
          aria-label="Risk band labels"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            fontSize: "0.6875rem",
            color: "var(--text-muted)",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          <span>On track (0–25)</span>
          <span>Check-in (25–50)</span>
          <span>Support (50–75)</span>
          <span>Immediate (75–100)</span>
        </div>
      </div>
    </div>
  );
}
