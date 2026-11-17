import React, { useEffect, useState } from "react";
import { AuditEntry } from "@academic-risk-radar/shared-types";
import { X, Copy, Check, Clock, User, Tag } from "lucide-react";

interface AuditDetailDrawerProps {
  entry: AuditEntry | null;
  onClose: () => void;
}

export function AuditDetailDrawer({ entry, onClose }: AuditDetailDrawerProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!entry) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [entry, onClose]);

  if (!entry) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Audit entry details"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 140,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "var(--overlay)",
          animation: "fadeIn 0.12s ease",
        }}
      />

      {/* Drawer Panel */}
      <div
        className="audit-drawer"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "580px",
          height: "100%",
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          zIndex: 141,
          animation: "fadeIn 0.15s ease",
        }}
      >
        {/* Header */}
        <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <Tag size={16} style={{ color: "var(--primary)" }} />
              <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
                {entry.action.replace(/_/g, " ")}
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
              Entity: {entry.entityType} {entry.entityId ? `(${entry.entityId})` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "0.25rem" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "1.25rem", overflowY: "auto", flex: 1 }}>
          {/* Metadata Badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem", padding: "0.75rem", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <Clock size={13} />
              <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--text)" }}>{new Date(entry.timestamp).toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <User size={13} />
              <span style={{ fontWeight: 600, color: "var(--text)" }}>{entry.actorId}</span>
            </div>
          </div>

          {/* Before & After State Diff */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  State before
                </span>
                {!entry.before && <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>No prior state</span>}
              </div>
              <pre
                style={{
                  background: "var(--surface-2)",
                  color: "var(--text)",
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "0.75rem",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  overflowX: "auto",
                  margin: 0,
                  maxHeight: "220px",
                }}
              >
                {entry.before ? JSON.stringify(entry.before, null, 2) : "null"}
              </pre>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  State after
                </span>
              </div>
              <pre
                style={{
                  background: "var(--surface-2)",
                  color: "var(--text)",
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "0.75rem",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  overflowX: "auto",
                  margin: 0,
                  maxHeight: "220px",
                }}
              >
                {entry.after ? JSON.stringify(entry.after, null, 2) : "null"}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "0.85rem 1.25rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            type="button"
            onClick={handleCopyJson}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "0.4rem 0.85rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--text)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            {copied ? <Check size={13} style={{ color: "var(--success)" }} /> : <Copy size={13} />}
            <span>{copied ? "Copied" : "Copy as JSON"}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "0.4rem 0.95rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
