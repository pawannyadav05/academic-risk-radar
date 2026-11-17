import React from "react";

export interface SlaTrendRow {
  week: string;
  atRisk: number;
  escalated: number;
}

interface HodSlaTrendTableProps {
  data: SlaTrendRow[];
}

export function HodSlaTrendTable({ data }: HodSlaTrendTableProps) {
  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
        <thead>
          <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
            <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Week</th>
            <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600, textAlign: "right" }}>At-risk cohort</th>
            <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600, textAlign: "right" }}>SLA breaches (&gt;48h)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.week} style={{ borderBottom: "1px solid var(--border)", color: "var(--text)" }}>
              <td style={{ padding: "0.6rem 0.75rem", fontWeight: 500 }}>{row.week}</td>
              <td style={{ padding: "0.6rem 0.75rem", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{row.atRisk}</td>
              <td style={{ padding: "0.6rem 0.75rem", textAlign: "right", fontVariantNumeric: "tabular-nums", color: row.escalated > 0 ? "var(--danger)" : "var(--text)" }}>
                {row.escalated}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
