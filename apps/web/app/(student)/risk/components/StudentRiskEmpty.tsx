import React from "react";
import { Info, RefreshCw } from "lucide-react";

interface StudentRiskEmptyProps {
  onRefresh: () => void;
  studentName?: string;
  enrolmentId?: string;
}

export function StudentRiskEmpty({ onRefresh, studentName, enrolmentId }: StudentRiskEmptyProps) {
  return (
    <div
      style={{
        fontFamily: "var(--font-family)",
        color: "var(--text)",
        padding: "3rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "2.5rem 2rem",
          maxWidth: "540px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface-2)",
            color: "var(--primary)",
            marginBottom: "1.25rem",
          }}
        >
          <Info size={24} />
        </div>

        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)", margin: "0 0 0.5rem" }}>
          Academic standing not yet available
        </h2>
        {studentName && (
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: "0 0 0.25rem" }}>
            Student: {studentName} {enrolmentId ? `(${enrolmentId})` : ""}
          </p>
        )}

        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "0.5rem 0 1.75rem" }}>
          Your academic profile will appear once instructors submit attendance and assessment records for your registered courses.
        </p>

        <button
          onClick={onRefresh}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.25rem",
            background: "var(--primary)",
            color: "var(--primary-contrast)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s ease",
          }}
        >
          <RefreshCw size={14} />
          Check for updates
        </button>
      </div>
    </div>
  );
}
