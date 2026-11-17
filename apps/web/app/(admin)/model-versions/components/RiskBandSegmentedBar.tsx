import React from "react";

interface RiskBandSegmentedBarProps {
  thresholds: Record<string, number>;
  label?: string;
}

export function RiskBandSegmentedBar({ thresholds, label }: RiskBandSegmentedBarProps) {
  const low = Math.max(0, Math.min(1, thresholds.low ?? 0.25));
  const moderate = Math.max(low, Math.min(1, thresholds.moderate ?? 0.5));
  const high = Math.max(moderate, Math.min(1, thresholds.high ?? 0.75));
  const critical = Math.max(high, Math.min(1, thresholds.critical ?? 1.0));

  const lowPct = low * 100;
  const modPct = (moderate - low) * 100;
  const highPct = (high - moderate) * 100;
  const critPct = Math.max(0, 100 - high * 100);

  const bands = [
    { name: "Low", pct: lowPct, cutoff: low, color: "var(--steady)", textColor: "var(--surface)" },
    { name: "Moderate", pct: modPct, cutoff: moderate, color: "var(--watch)", textColor: "var(--text)" },
    { name: "High", pct: highPct, cutoff: high, color: "var(--primary)", textColor: "var(--surface)" },
    { name: "Critical", pct: critPct, cutoff: critical, color: "var(--danger)", textColor: "var(--surface)" },
  ];

  return (
    <div>
      {label && (
        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.45rem" }}>
          {label}
        </div>
      )}

      {/* Segmented Bar */}
      <div
        role="meter"
        aria-label="Risk band threshold scale"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={100}
        style={{
          display: "flex",
          width: "100%",
          height: "16px",
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
          border: "1px solid var(--border)",
        }}
      >
        {bands.map((b) => (
          <div
            key={b.name}
            aria-hidden="true"
            style={{
              width: `${Math.max(4, b.pct)}%`,
              background: b.color,
              transition: "width 0.2s ease",
            }}
          />
        ))}
      </div>

      {/* Threshold Labels Below */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.5rem",
          marginTop: "0.5rem",
          fontSize: "0.75rem",
        }}
      >
        {bands.map((b) => (
          <div key={b.name} style={{ textAlign: "center" }}>
            <span style={{ color: "var(--text-muted)", display: "block" }}>{b.name}</span>
            <span style={{ fontWeight: 600, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
              &le; {b.cutoff.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
