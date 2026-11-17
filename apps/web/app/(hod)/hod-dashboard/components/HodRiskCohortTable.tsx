import React from "react";

export interface RiskCohortItem {
  cohort: string;
  count: number;
  color: string;
}

interface HodRiskCohortTableProps {
  data: RiskCohortItem[];
}

export function HodRiskCohortTable({ data }: HodRiskCohortTableProps) {
  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
        <thead>
          <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
            <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Risk cohort</th>
            <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600, textAlign: "right" }}>Students count</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.cohort} style={{ borderBottom: "1px solid var(--border)", color: "var(--text)" }}>
              <td style={{ padding: "0.6rem 0.75rem", fontWeight: 500 }}>{row.cohort}</td>
              <td style={{ padding: "0.6rem 0.75rem", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                {row.count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
