import React from "react";
import { AlertTriangle } from "lucide-react";

interface RectifyConfirmModalProps {
  importSource: "attendance" | "assessment";
  selectedSubject: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RectifyConfirmModal({
  importSource,
  selectedSubject,
  onCancel,
  onConfirm,
}: RectifyConfirmModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "var(--overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          maxWidth: "460px",
          width: "100%",
          padding: "1.75rem",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
          <div style={{ color: "var(--warning)", display: "inline-flex" }}>
            <AlertTriangle size={22} />
          </div>
          <h2 id="confirm-modal-title" style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
            Confirm submission rectification
          </h2>
        </div>

        <p style={{ margin: "0 0 1.25rem", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Rectification will permanently replace previous {importSource} records for <strong>{selectedSubject}</strong> with this new batch and immediately re-evaluate student risk scores.
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "0.55rem 1rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              background: "var(--danger)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "0.55rem 1.25rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--primary-contrast)",
              cursor: "pointer",
            }}
          >
            Confirm and replace records
          </button>
        </div>
      </div>
    </div>
  );
}
