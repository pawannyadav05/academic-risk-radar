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
  { value: "improved", label: "Improved", color: "#2E8B7A", desc: "Demonstrated academic recovery" },
  { value: "no_change", label: "No Change", color: "#D49A1F", desc: "No measurable shift observed" },
  { value: "deteriorated", label: "Deteriorated", color: "#8A4A7B", desc: "Risk indicators worsened" },
  { value: "inconclusive", label: "Inconclusive", color: "#5B6B75", desc: "Insufficient data gathered" },
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
      <div style={{ background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "8px", width: "100%", maxWidth: "480px", padding: "1.5rem" }}>
        <h3 style={{ margin: "0 0 0.5rem", color: "#1B2A33", fontSize: "1.125rem", fontWeight: 600 }}>Update intervention outcome</h3>
        <p style={{ margin: "0 0 1.25rem", color: "#5B6B75", fontSize: "0.8125rem" }}>
          Record observed impact for <strong style={{ color: "#2D5BA3" }}>{intervention.action}</strong>
        </p>

        {error && (
          <div style={{ background: "#FFFFFF", border: "1px solid #8A4A7B", color: "#8A4A7B", padding: "0.75rem", borderRadius: "4px", fontSize: "0.8125rem", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

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
                    borderRadius: "4px",
                    border: active ? `2px solid ${o.color}` : "1px solid #D9DFDD",
                    background: "#F2F4F3",
                    color: active ? o.color : "#5B6B75",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{o.label}</span>
                  <span style={{ fontSize: "0.7rem", color: "#5B6B75" }}>{o.desc}</span>
                </button>
              );
            })}
          </div>

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
              type="submit"
              disabled={loading}
              style={{ background: "#2D5BA3", border: "none", color: "#FFFFFF", padding: "0.5rem 1.25rem", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "0.8125rem" }}
            >
              {loading ? "Saving..." : "Save outcome"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
