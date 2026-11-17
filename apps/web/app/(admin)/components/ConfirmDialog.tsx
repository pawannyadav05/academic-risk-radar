import React, { useEffect, useRef } from "react";
import { AlertTriangle, AlertCircle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    confirmBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
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
        zIndex: 150,
        padding: "1rem",
        animation: "fadeIn 0.12s ease",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          maxWidth: "480px",
          width: "100%",
          padding: "1.5rem",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.85rem" }}>
          <div style={{ color: isDanger ? "var(--danger)" : "var(--primary)", marginTop: "2px", flexShrink: 0 }}>
            {isDanger ? <AlertTriangle size={22} /> : <AlertCircle size={22} />}
          </div>
          <div>
            <h2 id="confirm-dialog-title" style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
              {title}
            </h2>
            <div style={{ margin: "0.4rem 0 0", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              {description}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "0.45rem 1rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            {cancelText}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              background: isDanger ? "var(--danger)" : "var(--primary)",
              border: `1px solid ${isDanger ? "var(--danger)" : "var(--primary)"}`,
              borderRadius: "var(--radius-sm)",
              padding: "0.45rem 1.1rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--surface)",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
