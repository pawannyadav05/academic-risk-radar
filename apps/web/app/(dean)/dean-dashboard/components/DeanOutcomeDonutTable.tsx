import React from "react";

export interface OutcomeSlice {
  name: string;
  value: number;
  color: string;
}

interface DeanOutcomeDonutTableProps {
  data: OutcomeSlice[];
  successRatePct: number;
}

export function DeanOutcomeDonutTable({ data, successRatePct }: DeanOutcomeDonutTableProps) {
  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
        <thead>
          <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
            <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Outcome status</th>
            <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600, textAlign: "right" }}>Proportion</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.name} style={{ borderBottom: "1px solid var(--border)", color: "var(--text)" }}>
              <td style={{ padding: "0.6rem 0.75rem", fontWeight: 500 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: row.color, marginRight: 6 }} />
                {row.name}
              </td>
              <td style={{ padding: "0.6rem 0.75rem", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                {row.value}%
              </td>
            </tr>
          ))}
          <tr style={{ background: "var(--surface-2)", fontWeight: 700, color: "var(--text)" }}>
            <td style={{ padding: "0.6rem 0.75rem" }}>Overall validated efficacy</td>
            <td style={{ padding: "0.6rem 0.75rem", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--success)" }}>
              {successRatePct}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
