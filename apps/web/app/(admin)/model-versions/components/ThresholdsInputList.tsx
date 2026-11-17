import React from "react";
import { RiskBandSegmentedBar } from "./RiskBandSegmentedBar";
import { ModelWeightComparisonTable } from "./ModelWeightComparisonTable";

interface ThresholdsInputListProps {
  thresholds: Record<string, number>;
  onThresholdChange: (k: string, val: number) => void;
  isThresholdsValid: boolean;
  activeWeights: Record<string, number>;
  weights: Record<string, number>;
}

export function ThresholdsInputList({
  thresholds,
  onThresholdChange,
  isThresholdsValid,
  activeWeights,
  weights,
}: ThresholdsInputListProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-muted)" }}>Risk band limits</span>
        {!isThresholdsValid && (
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--danger)" }}>Must be increasing</span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginBottom: "1rem" }}>
        {(["low", "moderate", "high", "critical"] as const).map((b) => (
          <div key={b}>
            <label htmlFor={`threshold-${b}`} style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "capitalize", marginBottom: "0.25rem" }}>
              {b}
            </label>
            <input
              id={`threshold-${b}`}
              type="number"
              min={0}
              max={1.0}
              step={0.05}
              value={thresholds[b] ?? 0.5}
              onChange={(e) => onThresholdChange(b, parseFloat(e.target.value) || 0)}
              style={{
                width: "100%",
                padding: "0.3rem 0.4rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                fontSize: "0.8125rem",
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
                background: "var(--surface)",
                color: "var(--text)",
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <RiskBandSegmentedBar thresholds={thresholds} label="Live cutoff preview" />
      </div>

      <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
        Compare with active configuration
      </span>
      <ModelWeightComparisonTable activeWeights={activeWeights} proposedWeights={weights} />
    </div>
  );
}
