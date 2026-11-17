import React from "react";
import { Users, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";

export interface PreviewData {
  totalStudentsScored?: number;
  totalStudents?: number;
  changedBandCount?: number;
  bandTransitions?: Record<string, number>;
  currentDistribution?: Record<string, number>;
  proposedDistribution?: Record<string, number>;
  netChanges?: Record<string, number>;
}

interface ImpactPreviewPanelProps {
  preview: PreviewData | null;
}

const BAND_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  low: { bg: "var(--steady-subtle)", color: "var(--steady)" },
  moderate: { bg: "var(--watch-subtle)", color: "var(--watch)" },
  high: { bg: "var(--accent-subtle)", color: "var(--accent)" },
  critical: { bg: "var(--danger-subtle)", color: "var(--danger)" },
};

export function ImpactPreviewPanel({ preview }: ImpactPreviewPanelProps) {
  if (!preview) return null;

  const total = preview.totalStudentsScored ?? preview.totalStudents ?? 0;
  const changed = preview.changedBandCount ?? 0;
  const unchanged = Math.max(0, total - changed);
  const transitions = Object.entries(preview.bandTransitions || {});

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem",
        marginBottom: "1.5rem",
      }}
    >
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Users size={16} style={{ color: "var(--accent)" }} />
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
            Simulation impact preview
          </h3>
        </div>
        <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
          Evaluated against {total} historical student records.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            padding: "0.75rem",
            background: "var(--surface-2)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
            Total evaluated
          </span>
          <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
            {total} students
          </span>
        </div>

        <div
          style={{
            padding: "0.75rem",
            background: "var(--surface-2)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
            Band migrations
          </span>
          <span
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              color: changed > 0 ? "var(--accent)" : "var(--steady)",
            }}
          >
            {changed} {changed === 1 ? "student" : "students"}
          </span>
        </div>

        <div
          style={{
            padding: "0.75rem",
            background: "var(--surface-2)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
            Unchanged standing
          </span>
          <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
            {unchanged} students
          </span>
        </div>
      </div>

      <div>
        <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)" }}>
          Risk band transitions:
        </h4>

        {transitions.length === 0 ? (
          <div
            style={{
              padding: "0.65rem 0.85rem",
              background: "var(--surface-2)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <CheckCircle2 size={14} style={{ color: "var(--steady)" }} />
            <span>No student moves across risk bands under this proposed calibration.</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {transitions.map(([key, count]) => {
              const [from, to] = key.split("->");
              const fromStyle = BAND_BADGE_COLORS[from] || { bg: "var(--surface-2)", color: "var(--text)" };
              const toStyle = BAND_BADGE_COLORS[to] || { bg: "var(--surface-2)", color: "var(--text)" };

              return (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    fontSize: "0.8125rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                      style={{
                        padding: "0.15rem 0.5rem",
                        borderRadius: "var(--radius-sm)",
                        background: fromStyle.bg,
                        color: fromStyle.color,
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {from}
                    </span>
                    <ArrowRight size={13} style={{ color: "var(--text-muted)" }} />
                    <span
                      style={{
                        padding: "0.15rem 0.5rem",
                        borderRadius: "var(--radius-sm)",
                        background: toStyle.bg,
                        color: toStyle.color,
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {to}
                    </span>
                  </div>

                  <span style={{ fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
                    {count} {count === 1 ? "student" : "students"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
