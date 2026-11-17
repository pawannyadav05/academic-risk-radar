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
  { value: "improved", label: "Improved", color: "var(--success)", desc: "Demonstrated academic recovery" },
  { value: "no_change", label: "No Change", color: "var(--warning)", desc: "No measurable shift observed" },
  { value: "deteriorated", label: "Deteriorated", color: "var(--danger)", desc: "Risk indicators worsened" },
  { value: "inconclusive", label: "Inconclusive", color: "var(--text-muted)", desc: "Insufficient data gathered" },
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
    <div style={{ position: "fixed", inset: 0, background: "var(--overlay)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", width: "100%", maxWidth: "480px", padding: "1.5rem" }}>
        <h3 style={{ margin: "0 0 0.5rem", color: "var(--text)", fontSize: "1.125rem", fontWeight: 600 }}>Update intervention outcome</h3>
        <p style={{ margin: "0 0 1.25rem", color: "var(--text-muted)", fontSize: "0.8125rem" }}>
          Record observed impact for <strong style={{ color: "var(--primary)" }}>{intervention.action}</strong>
        </p>

        {error && (
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--danger)", color: "var(--danger)", padding: "0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", marginBottom: "1rem" }}>
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
                    borderRadius: "var(--radius-sm)",
                    border: active ? `2px solid ${o.color}` : "1px solid var(--border)",
                    background: "var(--surface-2)",
                    color: active ? o.color : "var(--text-muted)",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    transition: "border-color 0.15s ease",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{o.label}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{o.desc}</span>
                </button>
              );
            })}
          </div>

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
              type="submit"
              disabled={loading}
              style={{ background: "var(--primary)", border: "none", color: "var(--primary-contrast)", padding: "0.5rem 1.25rem", borderRadius: "var(--radius-sm)", cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "0.8125rem", transition: "background 0.15s ease" }}
            >
              {loading ? "Saving..." : "Save outcome"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
