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
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        color: "#e2e8f0",
        minHeight: "calc(100vh - 60px)",
        background: "#090e1a",
        margin: "-2rem",
        padding: "3rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#0f172a",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "16px",
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
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.12)",
            color: "#ef4444",
            marginBottom: "1.25rem",
          }}
        >
          <AlertCircle size={28} />
        </div>

        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 0.5rem" }}>
          Unable to Load Academic Standing
        </h2>

        <p style={{ fontSize: "0.875rem", color: "#fca5a5", lineHeight: 1.5, margin: "0 0 1.75rem" }}>
          {message}
        </p>

        <button
          onClick={onRetry}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.25rem",
            background: "#ef4444",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={16} />
          Retry Connection
        </button>
      </div>
    </div>
  );
}
