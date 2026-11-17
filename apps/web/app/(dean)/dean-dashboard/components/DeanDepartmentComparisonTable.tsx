import React from "react";

export interface DeptComparisonRow {
  dept: string;
  total: number;
  atRisk: number;
  atRiskPct: number;
}

interface DeanDepartmentComparisonTableProps {
  data: DeptComparisonRow[];
}

export function DeanDepartmentComparisonTable({ data }: DeanDepartmentComparisonTableProps) {
  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
        <thead>
          <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
            <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Department</th>
            <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600, textAlign: "right" }}>Total enrolled</th>
            <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600, textAlign: "right" }}>At-risk cohort</th>
            <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600, textAlign: "right" }}>At-risk %</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.dept} style={{ borderBottom: "1px solid var(--border)", color: "var(--text)" }}>
              <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>{row.dept}</td>
              <td style={{ padding: "0.6rem 0.75rem", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{row.total}</td>
              <td style={{ padding: "0.6rem 0.75rem", textAlign: "right", fontVariantNumeric: "tabular-nums", color: row.atRisk > 0 ? "var(--primary)" : "var(--text)" }}>
                {row.atRisk}
              </td>
              <td style={{ padding: "0.6rem 0.75rem", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                {row.atRiskPct}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
