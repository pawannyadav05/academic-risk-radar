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
        fontFamily: "var(--font-atkinson, system-ui, sans-serif)",
        color: "#1B2A33",
        padding: "3rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #D9DFDD",
          borderRadius: "8px",
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
            borderRadius: "4px",
            background: "#F2F4F3",
            color: "#2D5BA3",
            marginBottom: "1.25rem",
          }}
        >
          <Info size={24} />
        </div>

        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1B2A33", margin: "0 0 0.5rem" }}>
          Academic standing not yet available
        </h2>
        {studentName && (
          <p style={{ fontSize: "0.875rem", color: "#5B6B75", margin: "0 0 0.25rem" }}>
            Student: {studentName} {enrolmentId ? `(${enrolmentId})` : ""}
          </p>
        )}

        <p style={{ fontSize: "0.875rem", color: "#5B6B75", lineHeight: 1.6, margin: "0.5rem 0 1.75rem" }}>
          Your academic profile will appear once instructors submit attendance and assessment records for your registered courses.
        </p>

        <button
          onClick={onRefresh}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.25rem",
            background: "#2D5BA3",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "4px",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <RefreshCw size={14} />
          Check for updates
        </button>
      </div>
    </div>
  );
}
