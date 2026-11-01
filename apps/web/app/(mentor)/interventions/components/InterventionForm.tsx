"use client";

import React, { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  apiBase: string;
}

const PRESET_ACTIONS = [
  "Phone call with student",
  "In-person counseling session",
  "Email follow-up & study plan",
  "Referred to academic counselor",
  "Arranged peer tutoring support",
  "Parent / guardian contacted",
];

export default function InterventionForm({ isOpen, onClose, onSubmitSuccess, apiBase }: Props) {
  const [alertId, setAlertId] = useState("");
  const [action, setAction] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertId.trim() || !action.trim() || !notes.trim()) {
      setError("Alert ID, action, and notes are required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/interventions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          alertId: alertId.trim(),
          action: action.trim(),
          notes: notes.trim(),
          followUpDate: followUpDate || null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      onSubmitSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Could not record intervention");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
      <div style={{ background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "8px", width: "100%", maxWidth: "520px", padding: "1.5rem" }}>
        <h3 style={{ margin: "0 0 0.25rem", color: "#1B2A33", fontSize: "1.125rem", fontWeight: 600 }}>Log mentor intervention</h3>
        <p style={{ margin: "0 0 1.25rem", color: "#5B6B75", fontSize: "0.8125rem" }}>Record a mentoring action taken in response to an acknowledged alert.</p>

        {error && (
          <div style={{ background: "#FFFFFF", border: "1px solid #8A4A7B", color: "#8A4A7B", padding: "0.625rem", borderRadius: "4px", fontSize: "0.8125rem", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", color: "#1B2A33", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Alert ID
            </label>
            <input
              type="text"
              placeholder="e.g. alert-001"
              value={alertId}
              onChange={(e) => setAlertId(e.target.value)}
              required
              style={{ width: "100%", background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "4px", padding: "0.6rem 0.75rem", color: "#1B2A33", fontSize: "0.875rem", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", color: "#1B2A33", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Action type
            </label>
            <input
              type="text"
              placeholder="Type action or select preset below"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              required
              style={{ width: "100%", background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "4px", padding: "0.6rem 0.75rem", color: "#1B2A33", fontSize: "0.875rem", boxSizing: "border-box", marginBottom: "0.5rem" }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {PRESET_ACTIONS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAction(preset)}
                  style={{ background: "#F2F4F3", border: "1px solid #D9DFDD", color: "#5B6B75", padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer" }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", color: "#1B2A33", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Notes and discussion summary
            </label>
            <textarea
              rows={3}
              placeholder="Key discussion points, agreed student actions, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
              style={{ width: "100%", background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "4px", padding: "0.6rem 0.75rem", color: "#1B2A33", fontSize: "0.875rem", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", color: "#1B2A33", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              Follow-up date (optional)
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              style={{ width: "100%", background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "4px", padding: "0.6rem 0.75rem", color: "#1B2A33", fontSize: "0.875rem", boxSizing: "border-box" }}
            />
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
              {loading ? "Recording..." : "Save intervention"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
