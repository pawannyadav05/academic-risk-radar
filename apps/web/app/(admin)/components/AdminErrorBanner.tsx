import React from "react";
import { AlertCircle, RefreshCw, ShieldAlert, WifiOff, Clock } from "lucide-react";

interface AdminErrorBannerProps {
  error: string;
  statusCode?: number | null;
  onRetry: () => void;
}

export function AdminErrorBanner({ error, statusCode, onRetry }: AdminErrorBannerProps) {
  let title = "Couldn't load administrative data";
  let message = "Something went wrong on our side.";
  let Icon = AlertCircle;

  if (statusCode === 429 || error.includes("429")) {
    message = "Too many requests. Please wait a moment and try again.";
    Icon = Clock;
  } else if (statusCode === 403 || error.includes("403")) {
    message = "You don't have access to this data.";
    Icon = ShieldAlert;
  } else if (statusCode === 500 || error.includes("500")) {
    message = "Something went wrong on our side.";
    Icon = AlertCircle;
  } else if (error.toLowerCase().includes("network") || error.toLowerCase().includes("connection")) {
    message = "Check your connection.";
    Icon = WifiOff;
  }

  return (
    <div
      role="alert"
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--danger)",
        borderRadius: "var(--radius-md)",
        padding: "1rem 1.25rem",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", flex: 1, minWidth: "260px" }}>
        <div style={{ color: "var(--danger)", marginTop: "2px", flexShrink: 0 }}>
          <Icon size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--text)", marginBottom: "0.2rem" }}>
            {title}
          </div>
          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
            {message}
          </div>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {statusCode ? `HTTP ${statusCode}` : error}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onRetry}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          padding: "0.45rem 0.85rem",
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "var(--text)",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          alignSelf: "center",
        }}
      >
        <RefreshCw size={13} />
        <span>Retry</span>
      </button>
    </div>
  );
}
