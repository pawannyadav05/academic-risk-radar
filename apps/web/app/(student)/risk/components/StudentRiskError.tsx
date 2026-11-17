import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface StudentRiskErrorProps {
  message: string;
  onRetry: () => void;
}

export function StudentRiskError({ message, onRetry }: StudentRiskErrorProps) {
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
          border: "1px solid var(--danger)",
          borderRadius: "var(--radius-md)",
          padding: "2.5rem 2rem",
          maxWidth: "480px",
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
            color: "var(--danger)",
            marginBottom: "1.25rem",
          }}
        >
          <AlertCircle size={24} />
        </div>

        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)", margin: "0 0 0.5rem" }}>
          Unable to load academic standing
        </h2>

        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 1.75rem" }}>
          {message}
        </p>

        <button
          onClick={onRetry}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.25rem",
            background: "var(--text)",
            color: "var(--surface)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity 0.15s ease",
          }}
        >
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    </div>
  );
}
