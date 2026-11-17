import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface AdminToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export function AdminToast({
  message,
  type = "success",
  onClose,
  duration = 4000,
}: AdminToastProps) {
  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const color =
    type === "success"
      ? "var(--success)"
      : type === "error"
      ? "var(--danger)"
      : "var(--info)";

  const Icon =
    type === "success" ? CheckCircle2 : type === "error" ? AlertCircle : Info;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 160,
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
        maxWidth: "380px",
      }}
    >
      <div style={{ color, display: "inline-flex", flexShrink: 0 }}>
        <Icon size={18} />
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
        <X size={15} />
      </button>
    </div>
  );
}
