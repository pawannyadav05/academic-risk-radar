import React from "react";

interface ModelWeightComparisonTableProps {
  activeWeights: Record<string, number>;
  proposedWeights: Record<string, number>;
}

export function ModelWeightComparisonTable({
  activeWeights,
  proposedWeights,
}: ModelWeightComparisonTableProps) {
  const allKeys = Array.from(
    new Set([...Object.keys(activeWeights), ...Object.keys(proposedWeights)])
  );

  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "left" }}>
        <thead>
          <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
            <th style={{ padding: "0.4rem 0.6rem", fontWeight: 600 }}>Factor</th>
            <th style={{ padding: "0.4rem 0.6rem", fontWeight: 600, textAlign: "right" }}>Active</th>
            <th style={{ padding: "0.4rem 0.6rem", fontWeight: 600, textAlign: "right" }}>Proposed</th>
            <th style={{ padding: "0.4rem 0.6rem", fontWeight: 600, textAlign: "right" }}>Delta</th>
          </tr>
        </thead>
        <tbody>
          {allKeys.map((key) => {
            const oldVal = Math.round((activeWeights[key] ?? 0) * 100);
            const newVal = Math.round((proposedWeights[key] ?? 0) * 100);
            const delta = newVal - oldVal;

            return (
              <tr key={key} style={{ borderBottom: "1px solid var(--border)", color: "var(--text)" }}>
                <td style={{ padding: "0.4rem 0.6rem", fontWeight: 500 }}>{key.replace(/_/g, " ")}</td>
                <td style={{ padding: "0.4rem 0.6rem", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{oldVal}%</td>
                <td style={{ padding: "0.4rem 0.6rem", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{newVal}%</td>
                <td
                  style={{
                    padding: "0.4rem 0.6rem",
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: 600,
                    color: delta > 0 ? "var(--success)" : delta < 0 ? "var(--danger)" : "var(--text-muted)",
                  }}
                >
                  {delta > 0 ? `+${delta}%` : delta < 0 ? `${delta}%` : "0%"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
