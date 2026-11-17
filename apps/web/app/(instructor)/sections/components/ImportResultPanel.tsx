import React from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { ImportFeedback } from "./ImportFeedbackBanner";

interface ImportResultPanelProps {
  feedback: ImportFeedback | null;
  onDismiss: () => void;
}

export function ImportResultPanel({ feedback, onDismiss }: ImportResultPanelProps) {
  if (!feedback) return null;

  const isSuccess = feedback.status === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: "var(--surface)",
        border: `1px solid ${isSuccess ? "var(--success)" : "var(--danger)"}`,
        borderRadius: "var(--radius-sm)",
        padding: "1rem 1.25rem",
        marginBottom: "1.5rem",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
          <div style={{ color: isSuccess ? "var(--success)" : "var(--danger)", marginTop: "2px", flexShrink: 0 }}>
            {isSuccess ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)" }}>
              {isSuccess ? "Academic data successfully processed" : "Data submission failed"}
            </div>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
              {feedback.message}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss import results"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: "0.25rem",
            display: "inline-flex",
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Batch Stats breakdown if returned by server */}
      {feedback.insertedCount !== undefined && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.75rem",
            marginTop: "0.85rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--border)",
            fontSize: "0.75rem",
          }}
        >
          <div>
            <span style={{ color: "var(--text-muted)", display: "block" }}>Accepted records</span>
            <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--success)", fontVariantNumeric: "tabular-nums" }}>
              {feedback.insertedCount}
            </span>
          </div>

          <div>
            <span style={{ color: "var(--text-muted)", display: "block" }}>Quarantined / Rejected</span>
            <span
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                color: (feedback.quarantinedCount ?? 0) > 0 ? "var(--danger)" : "var(--text)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {feedback.quarantinedCount ?? 0}
            </span>
          </div>

          <div>
            <span style={{ color: "var(--text-muted)", display: "block" }}>Students affected</span>
            <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
              {feedback.affectedStudents ?? 0}
            </span>
          </div>

          <div>
            <span style={{ color: "var(--text-muted)", display: "block" }}>Risk recalculation</span>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--primary)" }}>
              {feedback.scoringRecalculation || "Completed"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
