import React, { useMemo } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { parseCsvRows } from "./parseCsvRows";

interface CsvPreviewTableProps {
  csvContent: string;
  selectedSubject: string;
  importSource: "attendance" | "assessment";
}

export function CsvPreviewTable({
  csvContent,
  selectedSubject,
  importSource,
}: CsvPreviewTableProps) {
  const { headers, previewRows, totalRows, validCount, issueCount } = useMemo(() => {
    return parseCsvRows(csvContent, selectedSubject, importSource);
  }, [csvContent, selectedSubject, importSource]);

  if (totalRows === 0) return null;

  return (
    <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
      {/* Validation Summary Line */}
      <div
        aria-live="polite"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.75rem",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.875rem", fontWeight: 600 }}>
          {issueCount === 0 ? (
            <span style={{ color: "var(--success)", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <CheckCircle size={15} />
              {validCount} {validCount === 1 ? "row" : "rows"} ready for import
            </span>
          ) : (
            <span style={{ color: "var(--warning)", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <AlertTriangle size={15} />
              {validCount} {validCount === 1 ? "row" : "rows"} ok, {issueCount} need attention
            </span>
          )}
        </div>

        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Showing preview of {previewRows.length} of {totalRows} {totalRows === 1 ? "row" : "rows"}
        </div>
      </div>

      {/* Warning if issues exist */}
      {issueCount > 0 && (
        <div
          role="alert"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--warning)",
            borderRadius: "var(--radius-sm)",
            padding: "0.6rem 0.85rem",
            fontSize: "0.8125rem",
            color: "var(--text)",
            marginBottom: "0.75rem",
          }}
        >
          Some rows contain format warnings. You may still submit; server-side validation will verify student enrollment and mapping.
        </div>
      )}

      {/* Preview Table */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          overflowX: "auto",
          width: "100%",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
              <th style={{ padding: "0.45rem 0.65rem", width: "40px", fontWeight: 600 }}>#</th>
              {headers.map((h) => (
                <th key={h} style={{ padding: "0.45rem 0.65rem", fontWeight: 600 }}>{h}</th>
              ))}
              <th style={{ padding: "0.45rem 0.65rem", fontWeight: 600, width: "180px" }}>Validation status</th>
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row) => {
              const hasError = !!row.error;
              return (
                <tr
                  key={row.index}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: hasError ? "var(--surface-2)" : "transparent",
                    color: "var(--text)",
                  }}
                >
                  <td style={{ padding: "0.5rem 0.65rem", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                    {row.index}
                  </td>
                  {headers.map((h) => (
                    <td key={h} style={{ padding: "0.5rem 0.65rem", fontVariantNumeric: "tabular-nums" }}>
                      {row.raw[h] || "—"}
                    </td>
                  ))}
                  <td style={{ padding: "0.5rem 0.65rem" }}>
                    {hasError ? (
                      <span style={{ color: "var(--danger)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                        <AlertTriangle size={12} />
                        {row.error}
                      </span>
                    ) : (
                      <span style={{ color: "var(--success)", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                        <CheckCircle size={12} />
                        Valid format
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
