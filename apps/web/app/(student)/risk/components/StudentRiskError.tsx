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
          border: "1px solid #8A4A7B",
          borderRadius: "8px",
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
            borderRadius: "4px",
            background: "#F2F4F3",
            color: "#8A4A7B",
            marginBottom: "1.25rem",
          }}
        >
          <AlertCircle size={24} />
        </div>

        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1B2A33", margin: "0 0 0.5rem" }}>
          Unable to load academic standing
        </h2>

        <p style={{ fontSize: "0.875rem", color: "#5B6B75", lineHeight: 1.5, margin: "0 0 1.75rem" }}>
          {message}
        </p>

        <button
          onClick={onRetry}
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
          Try again
        </button>
      </div>
    </div>
  );
}
