import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface PreviewRow {
  index: number;
  data: Record<string, string>;
  error?: string;
}

interface ConnectorPreviewTableProps {
  headers: string[];
  rows: PreviewRow[];
  totalRows: number;
  invalidCount: number;
}

export function ConnectorPreviewTable({
  headers,
  rows,
  totalRows,
  invalidCount,
}: ConnectorPreviewTableProps) {
  if (rows.length === 0) return null;

  return (
    <div style={{ marginTop: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
      <div style={{ padding: "0.6rem 0.85rem", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
        <span style={{ fontWeight: 600, color: "var(--text)" }}>
          Data validation preview (first {rows.length} of {totalRows} rows)
        </span>
        <span style={{ fontWeight: 600, color: invalidCount > 0 ? "var(--danger)" : "var(--success)" }}>
          {invalidCount > 0 ? `${invalidCount} row${invalidCount > 1 ? "s" : ""} with issues` : "All preview rows valid"}
        </span>
      </div>

      <div style={{ overflowX: "auto", maxHeight: "240px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
              <th style={{ padding: "0.4rem 0.6rem", width: "40px" }}>#</th>
              <th style={{ padding: "0.4rem 0.6rem", width: "90px" }}>Status</th>
              {headers.map((h) => (
                <th key={h} style={{ padding: "0.4rem 0.6rem", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const hasError = Boolean(r.error);
              return (
                <tr key={r.index} style={{ borderBottom: "1px solid var(--surface-2)", background: hasError ? "var(--surface-2)" : "var(--surface)" }}>
                  <td style={{ padding: "0.4rem 0.6rem", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{r.index + 1}</td>
                  <td style={{ padding: "0.4rem 0.6rem" }}>
                    {hasError ? (
                      <span title={r.error} style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", color: "var(--danger)", fontWeight: 600, fontSize: "0.6875rem" }}>
                        <AlertCircle size={11} />
                        <span>Issue</span>
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", color: "var(--success)", fontSize: "0.6875rem" }}>
                        <CheckCircle2 size={11} />
                        <span>Valid</span>
                      </span>
                    )}
                  </td>
                  {headers.map((h) => (
                    <td key={h} style={{ padding: "0.4rem 0.6rem", fontVariantNumeric: "tabular-nums", color: "var(--text)" }}>
                      {r.data[h] || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>empty</span>}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
