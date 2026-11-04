import React from "react";
import { AuditEntry } from "@academic-risk-radar/shared-types";
import { X } from "lucide-react";

interface AuditDetailModalProps {
  entry: AuditEntry | null;
  onClose: () => void;
}

export function AuditDetailModal({ entry, onClose }: AuditDetailModalProps) {
  if (!entry) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(27, 42, 51, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #D9DFDD",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "1px solid #D9DFDD" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#1B2A33" }}>
              Audit entry details
            </h3>
            <p style={{ margin: "0.15rem 0 0", fontSize: "0.75rem", color: "#5B6B75", fontVariantNumeric: "tabular-nums" }}>
              {new Date(entry.timestamp).toLocaleString()} · Actor: {entry.actorId}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#5B6B75" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "1.25rem", overflowY: "auto", flex: 1 }}>
          <div style={{ marginBottom: "1rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#5B6B75", textTransform: "uppercase" }}>Action:</span>
            <span style={{ marginLeft: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#1B2A33" }}>{entry.action}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <h4 style={{ margin: "0 0 0.35rem", fontSize: "0.8125rem", fontWeight: 600, color: "#5B6B75" }}>State before</h4>
              <pre style={{ background: "#F2F4F3", padding: "0.75rem", borderRadius: "4px", fontSize: "0.75rem", overflowX: "auto", margin: 0, border: "1px solid #D9DFDD" }}>
                {entry.before ? JSON.stringify(entry.before, null, 2) : "null (no previous state)"}
              </pre>
            </div>
            <div>
              <h4 style={{ margin: "0 0 0.35rem", fontSize: "0.8125rem", fontWeight: 600, color: "#5B6B75" }}>State after</h4>
              <pre style={{ background: "#F2F4F3", padding: "0.75rem", borderRadius: "4px", fontSize: "0.75rem", overflowX: "auto", margin: 0, border: "1px solid #D9DFDD" }}>
                {entry.after ? JSON.stringify(entry.after, null, 2) : "null"}
              </pre>
            </div>
          </div>
        </div>

        <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid #D9DFDD", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              background: "#FFFFFF",
              border: "1px solid #D9DFDD",
              borderRadius: "4px",
              padding: "0.4rem 0.9rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#1B2A33",
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

