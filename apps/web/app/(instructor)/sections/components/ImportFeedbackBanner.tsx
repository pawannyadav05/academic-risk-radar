import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export interface ImportFeedback {
  status: "success" | "error";
  message: string;
  insertedCount?: number;
  quarantinedCount?: number;
  affectedStudents?: number;
  scoringRecalculation?: string;
}

interface Props {
  feedback: ImportFeedback | null;
}

export function ImportFeedbackBanner({ feedback }: Props) {
  if (!feedback) return null;

  const isSuccess = feedback.status === "success";
  const borderColor = isSuccess ? "var(--success)" : "var(--danger)";

  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid ${borderColor}`,
        color: borderColor,
        padding: "0.875rem 1.25rem",
        borderRadius: "var(--radius-sm)",
        marginBottom: "1.25rem",
        fontSize: "0.875rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, marginBottom: feedback.insertedCount !== undefined ? "0.4rem" : 0 }}>
        {isSuccess ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
        {feedback.message}
      </div>
      {feedback.insertedCount !== undefined && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.8125rem", marginTop: "0.25rem", color: "var(--text-muted)" }}>
          <span>Valid rows: <strong style={{ color: "var(--text)" }}>{feedback.insertedCount}</strong></span>
          <span>Quarantined rows: <strong style={{ color: feedback.quarantinedCount ? "var(--danger)" : "var(--text)" }}>{feedback.quarantinedCount}</strong></span>
          <span>Students affected: <strong style={{ color: "var(--text)" }}>{feedback.affectedStudents}</strong></span>
        </div>
      )}
    </div>
  );
}
