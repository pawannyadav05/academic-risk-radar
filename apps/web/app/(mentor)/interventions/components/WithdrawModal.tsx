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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
      <div style={{ background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "8px", width: "100%", maxWidth: "460px", padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div style={{ background: "#F2F4F3", color: "#8A4A7B", padding: "0.5rem", borderRadius: "4px" }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: "#1B2A33", fontSize: "1.125rem", fontWeight: 600 }}>Withdraw intervention</h3>
            <span style={{ fontSize: "0.75rem", color: "#5B6B75" }}>Archived from active view</span>
          </div>
        </div>

        <p style={{ margin: "0 0 1rem", color: "#5B6B75", fontSize: "0.875rem", lineHeight: 1.5 }}>
          Are you sure you want to withdraw this mentoring entry?
        </p>

        <div style={{ background: "#F2F4F3", padding: "0.875rem", borderRadius: "4px", border: "1px solid #D9DFDD", marginBottom: "1rem", fontSize: "0.8125rem" }}>
          <div style={{ color: "#5B6B75", marginBottom: "0.25rem" }}>Action: <strong style={{ color: "#1B2A33" }}>{intervention.action}</strong></div>
          <div style={{ color: "#5B6B75" }}>Alert ID: <span style={{ fontFamily: "monospace", color: "#2D5BA3" }}>{intervention.alertId}</span></div>
        </div>

        <div style={{ background: "#F2F4F3", border: "1px solid #D49A1F", color: "#D49A1F", padding: "0.625rem 0.75rem", borderRadius: "4px", fontSize: "0.75rem", marginBottom: "1.25rem" }}>
          This record will be hidden from the active list view but retained in institutional audit history.
        </div>

        {error && (
          <div style={{ background: "#FFFFFF", border: "1px solid #8A4A7B", color: "#8A4A7B", padding: "0.75rem", borderRadius: "4px", fontSize: "0.8125rem", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{ background: "#FFFFFF", border: "1px solid #D9DFDD", color: "#5B6B75", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.8125rem" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleWithdraw}
            disabled={loading}
            style={{ background: "#8A4A7B", border: "none", color: "#FFFFFF", padding: "0.5rem 1.25rem", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "0.8125rem" }}
          >
            {loading ? "Withdrawing..." : "Confirm withdrawal"}
          </button>
        </div>
      </div>
    </div>
  );
}
