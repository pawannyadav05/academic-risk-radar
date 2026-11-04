import React from "react";
import { RiskBand } from "@academic-risk-radar/shared-types";

interface TransitionItem {
  studentId: string;
  fromBand: RiskBand;
  toBand: RiskBand;
  scoreDelta: number;
}

interface PreviewData {
  totalStudents: number;
  currentDistribution: Record<string, number>;
  proposedDistribution: Record<string, number>;
  netChanges: Record<string, number>;
  transitions: TransitionItem[];
}

interface ImpactPreviewPanelProps {
  preview: PreviewData | null;
}

const BAND_COLORS: Record<string, string> = {
  low: "#2E8B7A",
  moderate: "#D49A1F",
  high: "#8A4A7B",
  critical: "#8A4A7B",
};

export function ImpactPreviewPanel({ preview }: ImpactPreviewPanelProps) {
  if (!preview) return null;

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "8px", padding: "1.25rem", marginBottom: "1.5rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#1B2A33" }}>
          Simulation impact summary ({preview.totalStudents} students evaluated)
        </h3>
        <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "#5B6B75" }}>
          Comparison between active model and proposed configuration.
        </p>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem", textAlign: "left", marginBottom: "1.25rem" }}>
        <thead>
          <tr style={{ background: "#F2F4F3", borderBottom: "1px solid #D9DFDD", color: "#5B6B75" }}>
            <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>Risk band</th>
            <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>Current cohort</th>
            <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>Proposed cohort</th>
            <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>Net change</th>
          </tr>
        </thead>
        <tbody>
          {["low", "moderate", "high", "critical"].map((band) => {
            const current = preview.currentDistribution[band] || 0;
            const proposed = preview.proposedDistribution[band] || 0;
            const net = preview.netChanges[band] || 0;
            return (
              <tr key={band} style={{ borderBottom: "1px solid #D9DFDD" }}>
                <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600, color: BAND_COLORS[band] || "#1B2A33", textTransform: "capitalize" }}>
                  {band}
                </td>
                <td style={{ padding: "0.5rem 0.75rem", fontVariantNumeric: "tabular-nums" }}>{current}</td>
                <td style={{ padding: "0.5rem 0.75rem", fontVariantNumeric: "tabular-nums" }}>{proposed}</td>
                <td style={{ padding: "0.5rem 0.75rem", fontVariantNumeric: "tabular-nums", fontWeight: 600, color: net > 0 ? "#8A4A7B" : net < 0 ? "#2E8B7A" : "#5B6B75" }}>
                  {net > 0 ? `+${net}` : net}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {preview.transitions.length > 0 && (
        <div>
          <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#1B2A33" }}>
            Affected students ({preview.transitions.length})
          </h4>
          <div style={{ maxHeight: "160px", overflowY: "auto", border: "1px solid #D9DFDD", borderRadius: "4px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#F2F4F3", borderBottom: "1px solid #D9DFDD", color: "#5B6B75" }}>
                  <th style={{ padding: "0.4rem 0.6rem" }}>Student ID</th>
                  <th style={{ padding: "0.4rem 0.6rem" }}>Current band</th>
                  <th style={{ padding: "0.4rem 0.6rem" }}>Proposed band</th>
                  <th style={{ padding: "0.4rem 0.6rem" }}>Score delta</th>
                </tr>
              </thead>
              <tbody>
                {preview.transitions.map((t, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #F2F4F3" }}>
                    <td style={{ padding: "0.4rem 0.6rem", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{t.studentId}</td>
                    <td style={{ padding: "0.4rem 0.6rem", textTransform: "capitalize" }}>{t.fromBand}</td>
                    <td style={{ padding: "0.4rem 0.6rem", textTransform: "capitalize", fontWeight: 600 }}>{t.toBand}</td>
                    <td style={{ padding: "0.4rem 0.6rem", fontVariantNumeric: "tabular-nums" }}>{t.scoreDelta > 0 ? `+${t.scoreDelta.toFixed(3)}` : t.scoreDelta.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

