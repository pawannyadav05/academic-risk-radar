import React from "react";

interface WeightSliderListProps {
  weights: Record<string, number>;
  onWeightChange: (k: string, pct: number) => void;
  sumPct: number;
  isWeightValid: boolean;
  weightDiff: number;
}

export function WeightSliderList({
  weights,
  onWeightChange,
  sumPct,
  isWeightValid,
  weightDiff,
}: WeightSliderListProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-muted)" }}>Factor weights</span>
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: isWeightValid ? "var(--success)" : "var(--danger)", fontVariantNumeric: "tabular-nums" }}>
          Total: {sumPct}% {isWeightValid ? "(valid)" : `(${weightDiff > 0 ? `Adjust by +${weightDiff}%` : `Adjust by ${weightDiff}%`})`}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {Object.entries(weights).map(([k, val]) => {
          const pct = Math.round(val * 100);
          return (
            <div key={k}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "0.2rem" }}>
                <span style={{ color: "var(--text)" }}>{k.replace(/_/g, " ")}</span>
                <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--text)" }}>{pct}%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={pct}
                  aria-label={`${k.replace(/_/g, " ")} percentage slider`}
                  onChange={(e) => onWeightChange(k, Number(e.target.value))}
                  style={{ flex: 1, accentColor: "var(--primary)", cursor: "pointer" }}
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  value={pct}
                  aria-label={`${k.replace(/_/g, " ")} percentage`}
                  onChange={(e) => onWeightChange(k, Number(e.target.value))}
                  style={{
                    width: "60px",
                    padding: "0.25rem 0.4rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    fontSize: "0.8125rem",
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    background: "var(--surface)",
                    color: "var(--text)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
