import React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export function Toast({ message, type = "success", onClose }: ToastProps) {
  const isSuccess = type === "success";
  const color = isSuccess ? "var(--success)" : "var(--danger)";

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 120,
        background: "var(--surface)",
        border: `1px solid ${color}`,
        borderRadius: "var(--radius-sm)",
        padding: "0.75rem 1rem",
        boxShadow: "var(--shadow-md)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        animation: "fadeIn 0.15s ease",
        color: "var(--text)",
        fontSize: "0.875rem",
        maxWidth: "360px",
      }}
    >
      <div style={{ color, display: "inline-flex", flexShrink: 0 }}>
        {isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      </div>
      <span style={{ fontWeight: 500, flex: 1, lineHeight: 1.4 }}>{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        style={{
          background: "transparent",
          border: "none",
          color: "var(--text-muted)",
          cursor: "pointer",
          padding: "0.2rem",
          display: "inline-flex",
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
