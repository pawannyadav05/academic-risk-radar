"use client";

import React, { useState } from "react";
import { Intervention } from "@academic-risk-radar/shared-types";
import { AlertTriangle } from "lucide-react";

interface Props {
  intervention: Intervention | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
  apiBase: string;
}

export default function WithdrawModal({ intervention, onClose, onSubmitSuccess, apiBase }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!intervention) return null;

  const handleWithdraw = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/interventions/${intervention._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      onSubmitSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to withdraw intervention");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--overlay)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", width: "100%", maxWidth: "460px", padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div style={{ background: "var(--surface-2)", color: "var(--danger)", padding: "0.5rem", borderRadius: "var(--radius-sm)" }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: "var(--text)", fontSize: "1.125rem", fontWeight: 600 }}>Withdraw intervention</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Archived from active view</span>
          </div>
        </div>

        <p style={{ margin: "0 0 1rem", color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.5 }}>
          Are you sure you want to withdraw this mentoring entry?
        </p>

        <div style={{ background: "var(--surface-2)", padding: "0.875rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", marginBottom: "1rem", fontSize: "0.8125rem" }}>
          <div style={{ color: "var(--text-muted)", marginBottom: "0.25rem" }}>Action: <strong style={{ color: "var(--text)" }}>{intervention.action}</strong></div>
          <div style={{ color: "var(--text-muted)" }}>Alert ID: <span style={{ fontFamily: "monospace", color: "var(--primary)" }}>{intervention.alertId}</span></div>
        </div>

        <div style={{ background: "var(--surface-2)", border: "1px solid var(--warning)", color: "var(--warning)", padding: "0.625rem 0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", marginBottom: "1.25rem" }}>
          This record will be hidden from the active list view but retained in institutional audit history.
        </div>

        {error && (
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--danger)", color: "var(--danger)", padding: "0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "0.5rem 1rem", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "0.8125rem" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleWithdraw}
            disabled={loading}
            style={{ background: "var(--danger)", border: "none", color: "var(--primary-contrast)", padding: "0.5rem 1.25rem", borderRadius: "var(--radius-sm)", cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "0.8125rem", transition: "background 0.15s ease" }}
          >
            {loading ? "Withdrawing..." : "Confirm withdrawal"}
          </button>
        </div>
      </div>
    </div>
  );
}
