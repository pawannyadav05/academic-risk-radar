"use client";

import React from "react";
import { Alert } from "@academic-risk-radar/shared-types";
import { FileText } from "lucide-react";

interface AlertCardsMobileProps {
  alerts: Alert[];
  onCardClick: (alert: Alert) => void;
  onAcknowledge: (alertId: string, e: React.MouseEvent) => void;
  onLogActionClick: (alert: Alert, e: React.MouseEvent) => void;
  acknowledgingId: string | null;
}

const STUDENT_NAMES: Record<string, string> = {
  "12409922": "Rahul Sharma",
  "12409921": "Aarav Patel",
  "12409923": "Priya Nair",
  "12409924": "Rohan Gupta",
  "12409925": "Ananya Sen",
};

export function AlertCardsMobile({
  alerts,
  onCardClick,
  onAcknowledge,
  onLogActionClick,
  acknowledgingId,
}: AlertCardsMobileProps) {
  return (
    <div className="alerts-mobile-cards" style={{ display: "none", flexDirection: "column", gap: "0.875rem" }}>
      {alerts.map((alert) => {
        const isAck = alert.status === "acknowledged" || alert.status === "closed";
        const isEscalated = alert.status === "escalated";
        const isSaving = acknowledgingId === alert._id;
        const studentName = STUDENT_NAMES[alert.studentId] || "Enrolled Student";

        // SLA
        const diffMs = new Date(alert.slaDeadline).getTime() - Date.now();
        const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
        const isBreached = diffMs <= 0;

        let slaColor = "var(--text-muted)";
        let slaText = `${Math.max(0, hoursLeft)}h left`;
        let slaPct = Math.min(100, Math.max(0, ((48 - hoursLeft) / 48) * 100));

        if (isAck) {
          slaColor = "var(--success)";
          slaText = "Met";
          slaPct = 100;
        } else if (isBreached || isEscalated) {
          slaColor = "var(--danger)";
          slaText = isBreached ? "Breached" : "Sent to HoD";
          slaPct = 100;
        } else if (hoursLeft < 4) {
          slaColor = "var(--danger)";
        } else if (hoursLeft < 12) {
          slaColor = "var(--warning)";
        }

        let statusDotColor = "var(--warning)";
        let statusLabel = "Open";
        if (alert.status === "acknowledged") {
          statusDotColor = "var(--success)";
          statusLabel = "Acknowledged";
        } else if (alert.status === "escalated") {
          statusDotColor = "var(--danger)";
          statusLabel = "Sent to HoD";
        }

        return (
          <div
            key={alert._id}
            onClick={() => onCardClick(alert)}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text)" }}>
                  {alert.studentId}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                  {studentName} · <span style={{ fontFamily: "monospace" }}>{alert._id}</span>
                </div>
              </div>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "10px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text)",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: statusDotColor,
                    display: "inline-block",
                  }}
                />
                <span>{statusLabel}</span>
              </span>
            </div>

            {/* SLA Bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.3rem", fontWeight: 600, color: slaColor }}>
                <span>SLA: {slaText}</span>
                <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                  Raised {new Date(alert.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </span>
              </div>
              <div style={{ height: "4px", background: "var(--surface-2)", borderRadius: "2px", border: "1px solid var(--border)", overflow: "hidden" }}>
                <div style={{ width: `${slaPct}%`, height: "100%", background: slaColor, borderRadius: "2px" }} />
              </div>
            </div>

            {/* Actions */}
            <div
              style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                disabled={isAck || isSaving}
                onClick={(e) => onAcknowledge(alert._id, e)}
                style={{
                  flex: 1,
                  height: "36px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  border: isAck ? "1px solid var(--border)" : "1px solid var(--border)",
                  background: isAck ? "transparent" : "var(--surface)",
                  color: isAck ? "var(--text-muted)" : "var(--text)",
                  cursor: isAck ? "not-allowed" : "pointer",
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                {isSaving ? "Saving..." : isAck ? "Acknowledged" : "Acknowledge"}
              </button>

              <button
                type="button"
                onClick={(e) => onLogActionClick(alert, e)}
                style={{
                  height: "36px",
                  padding: "0 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  color: "var(--text)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <FileText size={13} />
                <span>Log action</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
