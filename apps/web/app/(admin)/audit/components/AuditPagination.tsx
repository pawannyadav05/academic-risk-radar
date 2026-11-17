import React from "react";

interface AuditPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (newPage: number) => void;
}

export function AuditPagination({
  page,
  totalPages,
  total,
  onPageChange,
}: AuditPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.5rem 0",
        fontSize: "0.8125rem",
        color: "var(--text-muted)",
      }}
    >
      <div>
        Showing page <span style={{ fontWeight: 600, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{page}</span> of{" "}
        <span style={{ fontWeight: 600, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{totalPages}</span> ({total} total entries)
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "0.35rem 0.75rem",
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: page <= 1 ? "var(--text-muted)" : "var(--text)",
            cursor: page <= 1 ? "not-allowed" : "pointer",
          }}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "0.35rem 0.75rem",
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: page >= totalPages ? "var(--text-muted)" : "var(--text)",
            cursor: page >= totalPages ? "not-allowed" : "pointer",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

