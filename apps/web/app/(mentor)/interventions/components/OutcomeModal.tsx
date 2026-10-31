"use client";

import React, { useState } from "react";
import { Intervention } from "@academic-risk-radar/shared-types";

interface Props {
  intervention: Intervention | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
  apiBase: string;
}

const OUTCOMES = [
  { value: "improved", label: "Improved", color: "#22c55e", desc: "Demonstrated academic recovery" },
  { value: "no_change", label: "No Change", color: "#f59e0b", desc: "No measurable shift observed" },
  { value: "deteriorated", label: "Deteriorated", color: "#ef4444", desc: "Risk indicators worsened" },
  { value: "inconclusive", label: "Inconclusive", color: "#64748b", desc: "Insufficient data gathered" },
] as const;

export default function OutcomeModal({ intervention, onClose, onSubmitSuccess, apiBase }: Props) {
  const [selectedOutcome, setSelectedOutcome] = useState<string>(intervention?.outcome || "improved");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!intervention) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/interventions/${intervention._id}/outcome`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ outcome: selectedOutcome }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      onSubmitSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update outcome");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "14px", width: "100%", maxWidth: "480px", padding: "1.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
        <h3 style={{ margin: "0 0 0.5rem", color: "#f8fafc", fontSize: "1.125rem" }}>Update Intervention Outcome</h3>
        <p style={{ margin: "0 0 1.25rem", color: "#94a3b8", fontSize: "0.8125rem" }}>
          Record observed impact for <strong style={{ color: "#38bdf8" }}>{intervention.action}</strong>
        </p>

        {error && <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", padding: "0.75rem", borderRadius: "8px", fontSize: "0.8125rem", marginBottom: "1rem" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
            {OUTCOMES.map((o) => {
              const active = selectedOutcome === o.value;
              return (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => setSelectedOutcome(o.value)}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "10px",
                    border: active ? `2px solid ${o.color}` : "1px solid #334155",
                    background: active ? `${o.color}15` : "#1e293b",
                    color: active ? o.color : "#94a3b8",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem"
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{o.label}</span>
                  <span style={{ fontSize: "0.7rem", color: "#64748b" }}>{o.desc}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <button type="button" onClick={onClose} disabled={loading} style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.8125rem" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none", color: "#fff", padding: "0.5rem 1.25rem", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.8125rem" }}>
              {loading ? "Saving..." : "Save Outcome"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

