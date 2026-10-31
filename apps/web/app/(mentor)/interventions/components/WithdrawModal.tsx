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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
      <div style={{ background: "#0f172a", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "14px", width: "100%", maxWidth: "460px", padding: "1.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", padding: "0.5rem", borderRadius: "8px" }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "1.125rem" }}>Withdraw Intervention</h3>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Soft-Delete Action</span>
          </div>
        </div>

        <p style={{ margin: "0 0 1rem", color: "#cbd5e1", fontSize: "0.85rem", lineHeight: 1.5 }}>
          Are you sure you want to withdraw this mentoring entry?
        </p>

        <div style={{ background: "#1e293b", padding: "0.875rem", borderRadius: "8px", border: "1px solid #334155", marginBottom: "1rem", fontSize: "0.8125rem" }}>
          <div style={{ color: "#94a3b8", marginBottom: "0.25rem" }}>Action: <strong style={{ color: "#f1f5f9" }}>{intervention.action}</strong></div>
          <div style={{ color: "#94a3b8" }}>Alert ID: <span style={{ fontFamily: "monospace", color: "#38bdf8" }}>{intervention.alertId}</span></div>
        </div>

        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24", padding: "0.625rem 0.75rem", borderRadius: "6px", fontSize: "0.75rem", marginBottom: "1.25rem" }}>
          ℹ This record will be hidden from the active list view but retained in institutional audit history.
        </div>

        {error && <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", padding: "0.75rem", borderRadius: "8px", fontSize: "0.8125rem", marginBottom: "1rem" }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button type="button" onClick={onClose} disabled={loading} style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.8125rem" }}>
            Cancel
          </button>
          <button type="button" onClick={handleWithdraw} disabled={loading} style={{ background: "#dc2626", border: "none", color: "#fff", padding: "0.5rem 1.25rem", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.8125rem" }}>
            {loading ? "Withdrawing..." : "Confirm Withdrawal"}
          </button>
        </div>
      </div>
    </div>
  );
}

