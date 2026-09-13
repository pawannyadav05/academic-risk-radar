"use client";

import React, { useState, useEffect, useCallback } from "react";

/**
 * Module M6: Mentor Intervention UI (Team Member 4 — Piyush Kumar Singh)
 *
 * Allows mentors to:
 * - View their existing interventions with status and outcomes
 * - Record a new intervention action linked to an alertId
 * - Update the outcome of an existing intervention
 *
 * Connects to:
 *   POST  /api/v1/interventions
 *   PATCH /api/v1/interventions/:id/outcome
 *   GET   /api/v1/interventions
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface Intervention {
  _id: string;
  alertId: string;
  mentorId: string;
  action: string;
  notes: string;
  createdAt: string;
  followUpDate: string | null;
  outcome: string | null;
  outcomeRecordedAt: string | null;
}

const OUTCOME_OPTIONS = ["improved", "no_change", "deteriorated", "inconclusive"] as const;

const OUTCOME_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  improved: { label: "Improved", color: "#059669", bg: "#d1fae5" },
  no_change: { label: "No Change", color: "#d97706", bg: "#fef3c7" },
  deteriorated: { label: "Deteriorated", color: "#dc2626", bg: "#fee2e2" },
  inconclusive: { label: "Inconclusive", color: "#6b7280", bg: "#f3f4f6" },
};

export default function MentorInterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New intervention form state
  const [showForm, setShowForm] = useState(false);
  const [formAlertId, setFormAlertId] = useState("");
  const [formAction, setFormAction] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formFollowUp, setFormFollowUp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Outcome update state
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<string>("");

  const fetchInterventions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/interventions`, {
        headers: {
          "x-user-id": "mentor-demo-001",
          "x-user-role": "mentor",
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      setInterventions(data.interventions || []);
    } catch (err: any) {
      setError(err.message || "Failed to load interventions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterventions();
  }, [fetchInterventions]);

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${API_BASE}/interventions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "mentor-demo-001",
          "x-user-role": "mentor",
        },
        body: JSON.stringify({
          alertId: formAlertId.trim(),
          action: formAction.trim(),
          notes: formNotes.trim(),
          followUpDate: formFollowUp || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setSuccessMsg("Intervention recorded successfully!");
      setShowForm(false);
      setFormAlertId("");
      setFormAction("");
      setFormNotes("");
      setFormFollowUp("");
      fetchInterventions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateOutcome = async (interventionId: string) => {
    if (!selectedOutcome) return;
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${API_BASE}/interventions/${interventionId}/outcome`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "mentor-demo-001",
          "x-user-role": "mentor",
        },
        body: JSON.stringify({ outcome: selectedOutcome }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setSuccessMsg("Outcome updated successfully!");
      setUpdatingId(null);
      setSelectedOutcome("");
      fetchInterventions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "1.75rem", color: "#1e293b" }}>
            Intervention Log
          </h1>
          <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.875rem" }}>
            Record and track mentoring actions taken in response to risk alerts.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: showForm ? "#94a3b8" : "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.625rem 1.25rem",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 600,
            transition: "background 0.2s",
          }}
        >
          {showForm ? "Cancel" : "+ New Intervention"}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#dc2626",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}
      {successMsg && (
        <div
          style={{
            background: "#d1fae5",
            color: "#059669",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}
        >
          {successMsg}
        </div>
      )}

      {/* New Intervention Form */}
      {showForm && (
        <form
          onSubmit={handleCreateIntervention}
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "2rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <h3 style={{ margin: "0 0 1rem", color: "#1e293b", fontSize: "1.125rem" }}>
            Record New Intervention
          </h3>

          <div style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label
                htmlFor="alertId"
                style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#475569", fontSize: "0.875rem" }}
              >
                Alert ID *
              </label>
              <input
                id="alertId"
                type="text"
                value={formAlertId}
                onChange={(e) => setFormAlertId(e.target.value)}
                required
                placeholder="e.g. alert-001"
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="action"
                style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#475569", fontSize: "0.875rem" }}
              >
                Action Taken *
              </label>
              <input
                id="action"
                type="text"
                value={formAction}
                onChange={(e) => setFormAction(e.target.value)}
                required
                placeholder="e.g. Called student to discuss attendance"
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#475569", fontSize: "0.875rem" }}
              >
                Notes *
              </label>
              <textarea
                id="notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                required
                rows={3}
                placeholder="Detailed notes about the intervention..."
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="followUpDate"
                style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#475569", fontSize: "0.875rem" }}
              >
                Follow-Up Date (optional)
              </label>
              <input
                id="followUpDate"
                type="date"
                value={formFollowUp}
                onChange={(e) => setFormFollowUp(e.target.value)}
                style={{
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: submitting ? "#94a3b8" : "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "0.5rem 1.25rem",
                cursor: submitting ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              {submitting ? "Saving..." : "Save Intervention"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                background: "transparent",
                color: "#64748b",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "0.5rem 1.25rem",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Interventions List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
          Loading interventions...
        </div>
      ) : interventions.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            background: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          <p style={{ color: "#94a3b8", fontSize: "1rem", margin: 0 }}>
            No interventions recorded yet.
          </p>
          <p style={{ color: "#cbd5e1", fontSize: "0.875rem", marginTop: "0.5rem" }}>
            Click &quot;+ New Intervention&quot; to record a mentoring action.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {interventions.map((iv) => (
            <div
              key={iv._id}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "1.25rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                transition: "box-shadow 0.2s",
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.75rem",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#94a3b8",
                      fontFamily: "monospace",
                    }}
                  >
                    Alert: {iv.alertId}
                  </span>
                  <h3 style={{ margin: "0.25rem 0 0", fontSize: "1rem", color: "#1e293b" }}>
                    {iv.action}
                  </h3>
                </div>

                {/* Outcome Badge */}
                {iv.outcome ? (
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: OUTCOME_LABELS[iv.outcome]?.color || "#6b7280",
                      background: OUTCOME_LABELS[iv.outcome]?.bg || "#f3f4f6",
                    }}
                  >
                    {OUTCOME_LABELS[iv.outcome]?.label || iv.outcome}
                  </span>
                ) : (
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#3b82f6",
                      background: "#dbeafe",
                    }}
                  >
                    Pending Outcome
                  </span>
                )}
              </div>

              {/* Notes */}
              <p
                style={{
                  color: "#475569",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                  margin: "0 0 0.75rem",
                }}
              >
                {iv.notes}
              </p>

              {/* Meta info row */}
              <div
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  fontSize: "0.75rem",
                  color: "#94a3b8",
                  flexWrap: "wrap",
                }}
              >
                <span>
                  Created: {new Date(iv.createdAt).toLocaleDateString()}
                </span>
                {iv.followUpDate && (
                  <span>
                    Follow-up: {new Date(iv.followUpDate).toLocaleDateString()}
                  </span>
                )}
                {iv.outcomeRecordedAt && (
                  <span>
                    Outcome recorded:{" "}
                    {new Date(iv.outcomeRecordedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Closed-Loop Outcome Tracking (Stage 3) */}
              {iv.outcome && (
                <div style={{ marginTop: "1.25rem", background: "#f8fafc", padding: "0.875rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.75rem", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Risk Band Shift:</span>
                  
                  {iv.outcome === "improved" ? (
                    <>
                      <span style={{ color: "#dc2626", fontWeight: 600, padding: "0.125rem 0.5rem", background: "#fee2e2", borderRadius: "4px", fontSize: "0.875rem" }}>High</span>
                      <span style={{ color: "#94a3b8" }}>→</span>
                      <span style={{ color: "#059669", fontWeight: 600, padding: "0.125rem 0.5rem", background: "#d1fae5", borderRadius: "4px", fontSize: "0.875rem" }}>Moderate</span>
                    </>
                  ) : iv.outcome === "deteriorated" ? (
                    <>
                      <span style={{ color: "#d97706", fontWeight: 600, padding: "0.125rem 0.5rem", background: "#fef3c7", borderRadius: "4px", fontSize: "0.875rem" }}>Moderate</span>
                      <span style={{ color: "#94a3b8" }}>→</span>
                      <span style={{ color: "#dc2626", fontWeight: 600, padding: "0.125rem 0.5rem", background: "#fee2e2", borderRadius: "4px", fontSize: "0.875rem" }}>High</span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: "#d97706", fontWeight: 600, padding: "0.125rem 0.5rem", background: "#fef3c7", borderRadius: "4px", fontSize: "0.875rem" }}>Moderate</span>
                      <span style={{ color: "#94a3b8" }}>→</span>
                      <span style={{ color: "#d97706", fontWeight: 600, padding: "0.125rem 0.5rem", background: "#fef3c7", borderRadius: "4px", fontSize: "0.875rem" }}>Moderate</span>
                    </>
                  )}
                </div>
              )}

              {/* Update Outcome Section (only if no outcome yet) */}
              {!iv.outcome && (
                <div
                  style={{
                    marginTop: "1rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  {updatingId === iv._id ? (
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                      <select
                        value={selectedOutcome}
                        onChange={(e) => setSelectedOutcome(e.target.value)}
                        style={{
                          padding: "0.375rem 0.75rem",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "0.875rem",
                          background: "#fff",
                        }}
                      >
                        <option value="">Select outcome...</option>
                        {OUTCOME_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {OUTCOME_LABELS[opt].label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleUpdateOutcome(iv._id)}
                        disabled={!selectedOutcome}
                        style={{
                          background: selectedOutcome ? "#059669" : "#94a3b8",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.375rem 1rem",
                          cursor: selectedOutcome ? "pointer" : "not-allowed",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setUpdatingId(null);
                          setSelectedOutcome("");
                        }}
                        style={{
                          background: "transparent",
                          color: "#94a3b8",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "0.8125rem",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setUpdatingId(iv._id)}
                      style={{
                        background: "transparent",
                        color: "#3b82f6",
                        border: "1px solid #bfdbfe",
                        borderRadius: "6px",
                        padding: "0.375rem 1rem",
                        cursor: "pointer",
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        transition: "background 0.2s",
                      }}
                    >
                      Record Outcome
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
