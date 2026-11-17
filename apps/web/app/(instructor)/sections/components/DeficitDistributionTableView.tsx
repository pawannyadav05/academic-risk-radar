import React from "react";

export interface ChartDataRow {
  deficitSize: string;
  attendance: number;
  assessment: number;
  missingWork: number;
}

interface DeficitDistributionTableViewProps {
  data: ChartDataRow[];
}

export function DeficitDistributionTableView({ data }: DeficitDistributionTableViewProps) {
  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
        <thead>
          <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
            <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Deficit size</th>
            <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600, textAlign: "right" }}>Attendance deficit</th>
            <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600, textAlign: "right" }}>Assessment deficit</th>
            <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600, textAlign: "right" }}>Missing work</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.deficitSize} style={{ borderBottom: "1px solid var(--border)", color: "var(--text)" }}>
              <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{row.deficitSize}</td>
              <td style={{ padding: "0.6rem 0.75rem", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{row.attendance}</td>
              <td style={{ padding: "0.6rem 0.75rem", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{row.assessment}</td>
              <td style={{ padding: "0.6rem 0.75rem", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{row.missingWork}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
