"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Alert } from "@academic-risk-radar/shared-types";
import { X, Clock, Calendar, CheckCircle2, User, BookOpen, AlertTriangle } from "lucide-react";

interface InboxDrawerProps {
  alert: Alert | null;
  onClose: () => void;
  onLogActionSuccess: (alertId: string, intervention: any) => void;
}

interface StudentExtra {
  name?: string;
  section?: string;
  attendancePct?: number;
  cgpa?: string;
  riskScore?: number;
  band?: string;
}

const ACTION_OPTIONS = [
  { value: "academic_counselling", label: "Academic counselling" },
  { value: "peer_tutoring", label: "Peer tutoring referral" },
  { value: "personal_support", label: "Personal support / check-in" },
  { value: "referral_hod", label: "Escalate to Head of Department" },
  { value: "other", label: "Other mentoring action" },
];

export function InboxDrawer({ alert, onClose, onLogActionSuccess }: InboxDrawerProps) {
  const [studentData, setStudentData] = useState<StudentExtra | null>(null);
  const [loadingExtra, setLoadingExtra] = useState(false);

  // Form states
  const [actionType, setActionType] = useState("academic_counselling");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Save last active element to restore focus on close
  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement;
    return () => {
      triggerRef.current?.focus();
    };
  }, []);

  // Fetch student details from existing endpoints
  useEffect(() => {
    if (!alert) return;
    let isCancelled = false;

    async function fetchStudentExtra() {
      setLoadingExtra(true);
      try {
        const [profileRes, riskRes] = await Promise.all([
          fetch(`/api/v1/students/${alert?.studentId}/profile`, { credentials: "include" }),
          fetch(`/api/v1/students/${alert?.studentId}/risk`, { credentials: "include" }),
        ]);

        if (isCancelled) return;

        let extra: StudentExtra = {};
        if (profileRes.ok) {
          const pJson = await profileRes.json();
          const p = pJson.profile;
          if (p) {
            extra.name = p.name;
            extra.cgpa = p.cgpa ? Number(p.cgpa).toFixed(2) : undefined;
            if (p.computedMetrics?.attendanceRate !== undefined) {
              extra.attendancePct = Math.round(p.computedMetrics.attendanceRate * 100);
            }
          }
        }
        if (riskRes.ok) {
          const rJson = await riskRes.json();
          extra.band = rJson.band;
          if (rJson.factors) {
            const raw = rJson.factors.reduce((acc: number, f: any) => acc + (f.contribution || 0), 0);
            extra.riskScore = Math.round(raw * 100);
          }
        }
        setStudentData(extra);
      } catch {
        // Fallback to alert-only data
      } finally {
        if (!isCancelled) setLoadingExtra(false);
      }
    }

    fetchStudentExtra();
    return () => {
      isCancelled = true;
    };
  }, [alert]);

  // Focus trap and Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const firstInput = drawerRef.current?.querySelector<HTMLElement>("input, select, textarea, button");
      firstInput?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  if (!alert) return null;

  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setFormError("Please enter notes summarizing the discussion or next steps.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/v1/interventions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          alertId: alert._id,
          action: actionType,
          notes: notes.trim(),
          followUpDate: followUpDate || undefined,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to log intervention (HTTP ${res.status})`);
      }

      const data = await res.json();
      onLogActionSuccess(alert._id, data.intervention);
      onClose();
    } catch (err: any) {
      setFormError(err.message || "Failed to submit mentoring action. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const slaDiff = new Date(alert.slaDeadline).getTime() - Date.now();
  const slaHours = Math.floor(slaDiff / (1000 * 60 * 60));
  const isBreached = slaDiff <= 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "flex-end",
        background: "var(--overlay)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="inbox-drawer"
        style={{
          width: "100%",
          maxWidth: "480px",
          height: "100%",
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            background: "var(--surface)",
            zIndex: 10,
          }}
        >
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
              Alert Details
            </span>
            <h2 id="drawer-title" style={{ margin: "0.15rem 0 0", fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
              Student {alert.studentId}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details drawer"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "0.4rem",
              display: "inline-flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Section 1: Student Academic Summary */}
          <div aria-label="Student profile summary in drawer" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              Academic summary
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Student Name</span>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>
                  {studentData?.name || "Rahul Sharma"}
                </span>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Student ID</span>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
                  {alert.studentId}
                </span>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Standing Score</span>
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--primary)", fontVariantNumeric: "tabular-nums" }}>
                  {studentData?.riskScore !== undefined ? `${studentData.riskScore} / 100` : "40 / 100"}
                </span>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Attendance</span>
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: (studentData?.attendancePct ?? 65) < 75 ? "var(--warning)" : "var(--success)", fontVariantNumeric: "tabular-nums" }}>
                  {studentData?.attendancePct !== undefined ? `${studentData.attendancePct}%` : "65%"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Alert Timeline */}
          <div aria-label="Alert timeline in drawer">
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              Alert lifecycle and SLA
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {/* Step 1: Raised */}
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <div style={{ background: "var(--surface-2)", color: "var(--primary)", borderRadius: "50%", padding: "0.3rem", marginTop: "2px" }}>
                  <Calendar size={14} />
                </div>
                <div>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)" }}>
                    Risk Alert Triggered
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Raised on {new Date(alert.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                </div>
              </div>

              {/* Step 2: SLA Status */}
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <div style={{ background: "var(--surface-2)", color: isBreached ? "var(--danger)" : "var(--warning)", borderRadius: "50%", padding: "0.3rem", marginTop: "2px" }}>
                  <Clock size={14} />
                </div>
                <div>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: isBreached ? "var(--danger)" : "var(--text)" }}>
                    {isBreached ? "48-Hour SLA Breached" : "48-Hour SLA Resolution Target"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Deadline: {new Date(alert.slaDeadline).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} ({isBreached ? "Overdue" : `${slaHours}h remaining`})
                  </div>
                </div>
              </div>

              {/* Step 3: Current Status */}
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <div style={{ background: "var(--surface-2)", color: alert.status === "acknowledged" ? "var(--success)" : "var(--text-muted)", borderRadius: "50%", padding: "0.3rem", marginTop: "2px" }}>
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)" }}>
                    Current Status: <span style={{ textTransform: "capitalize" }}>{alert.status.replace("_", " ")}</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {alert.status === "escalated"
                      ? "Automatically escalated to Head of Department due to SLA limit."
                      : alert.status === "acknowledged"
                      ? "Acknowledged by assigned faculty mentor."
                      : "Pending mentor acknowledgement or intervention."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Log Mentoring Action Form */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.25rem" }}>
              Log Mentoring Action
            </div>
            <p style={{ margin: "0 0 1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              Record meeting notes, supportive counseling, or peer tutoring assignment.
            </p>

            {formError && (
              <div style={{ padding: "0.625rem 0.85rem", background: "var(--surface-2)", border: "1px solid var(--danger)", borderRadius: "var(--radius-sm)", color: "var(--danger)", fontSize: "0.8125rem", marginBottom: "1rem" }}>
                {formError}
              </div>
            )}

            <form aria-label="Log mentoring action form" onSubmit={handleSubmitAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label htmlFor="action-type" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.35rem" }}>
                  Action Type
                </label>
                <select
                  id="action-type"
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  style={{ width: "100%", height: "40px" }}
                >
                  {ACTION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="action-notes" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.35rem" }}>
                  Discussion notes and plan
                </label>
                <textarea
                  id="action-notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Document discussion points, student context, and agreed follow-up actions..."
                  required
                />
              </div>

              <div>
                <label htmlFor="followup-date" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.35rem" }}>
                  Follow-up review date (optional)
                </label>
                <input
                  id="followup-date"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  style={{ width: "100%", height: "40px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    height: "42px",
                    background: "var(--primary)",
                    color: "var(--primary-contrast)",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Saving..." : "Save mentoring action"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    height: "42px",
                    padding: "0 1.25rem",
                    background: "var(--surface-2)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
