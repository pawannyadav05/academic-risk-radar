import React from "react";
import { X, Calendar, User, Hash, Clock } from "lucide-react";

export interface TermItem {
  _id: string;
  termId: number;
  label: string;
  status: "active" | "archived";
  createdAt: string;
  createdBy?: string;
  startDate?: string;
  endDate?: string;
  facultyCount?: number;
  studentsCount?: number;
  sectionsCount?: number;
}

interface TermDetailModalProps {
  term: TermItem | null;
  onClose: () => void;
}

export function TermDetailModal({ term, onClose }: TermDetailModalProps) {
  if (!term) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "var(--overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          width: "100%",
          maxWidth: "480px",
          overflow: "hidden",
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "1.25rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: 700, color: "var(--text)" }}>
              {term.label || `Term ${term.termId}`}
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
              ID: {term.termId}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "0.25rem",
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ background: "var(--surface-2)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Status</span>
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: term.status === "active" ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                {term.status === "active" ? "Current / Active" : "Archived"}
              </span>
            </div>

            <div style={{ background: "var(--surface-2)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Created</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>
                {new Date(term.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            <p style={{ margin: "0 0 0.5rem" }}>
              <strong style={{ color: "var(--text)" }}>Aggregated rosters:</strong> Faculty, student accounts, and section mappings for this academic term were provisioned and bound at creation time.
            </p>
            {term.createdBy && (
              <p style={{ margin: 0, fontFamily: "monospace", fontSize: "0.75rem" }}>
                Created by: {term.createdBy}
              </p>
            )}
          </div>
        </div>

        <div
          style={{
            padding: "0.875rem 1.25rem",
            background: "var(--surface-2)",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.45rem 0.9rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
