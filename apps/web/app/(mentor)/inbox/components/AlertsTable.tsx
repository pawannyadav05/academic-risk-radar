"use client";

import React from "react";
import { Alert, AlertStatus } from "@academic-risk-radar/shared-types";
import { ArrowUpDown, CheckCircle, FileText, Clock, AlertTriangle } from "lucide-react";

interface AlertsTableProps {
  alerts: Alert[];
  onRowClick: (alert: Alert) => void;
  onAcknowledge: (alertId: string, e: React.MouseEvent) => void;
  onLogActionClick: (alert: Alert, e: React.MouseEvent) => void;
  acknowledgingId: string | null;
  sortField: "studentId" | "status" | "slaDeadline" | "createdAt";
  sortDirection: "asc" | "desc";
  onSort: (field: "studentId" | "status" | "slaDeadline" | "createdAt") => void;
}

const STUDENT_NAMES: Record<string, string> = {
  "12409922": "Rahul Sharma",
  "12409921": "Aarav Patel",
  "12409923": "Priya Nair",
  "12409924": "Rohan Gupta",
  "12409925": "Ananya Sen",
};

export function AlertsTable({
  alerts,
  onRowClick,
  onAcknowledge,
  onLogActionClick,
  acknowledgingId,
  sortField,
  sortDirection,
  onSort,
}: AlertsTableProps) {
  return (
    <div
      className="alerts-desktop-table"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        overflowX: "auto",
        width: "100%",
      }}
    >
      <table style={{ width: "100%", minWidth: "720px", borderCollapse: "collapse", fontSize: "0.875rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-muted)" }}>
            <th
              onClick={() => onSort("studentId")}
              style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", userSelect: "none" }}
            >
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <span>Student</span>
                <ArrowUpDown size={12} style={{ opacity: sortField === "studentId" ? 1 : 0.4 }} />
              </div>
            </th>

            <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, fontSize: "0.8125rem" }}>
              Alert ID
            </th>

            <th
              onClick={() => onSort("status")}
              style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", userSelect: "none" }}
            >
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <span>Status</span>
                <ArrowUpDown size={12} style={{ opacity: sortField === "status" ? 1 : 0.4 }} />
              </div>
            </th>

            <th
              onClick={() => onSort("slaDeadline")}
              style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", userSelect: "none", width: "180px" }}
            >
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <span>SLA Urgency</span>
                <ArrowUpDown size={12} style={{ opacity: sortField === "slaDeadline" ? 1 : 0.4 }} />
              </div>
            </th>

            <th
              onClick={() => onSort("createdAt")}
              style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", userSelect: "none" }}
            >
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <span>Raised</span>
                <ArrowUpDown size={12} style={{ opacity: sortField === "createdAt" ? 1 : 0.4 }} />
              </div>
            </th>

            <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, fontSize: "0.8125rem" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert, idx) => {
            const isAck = alert.status === "acknowledged" || alert.status === "closed";
            const isEscalated = alert.status === "escalated";
            const isSaving = acknowledgingId === alert._id;
            const studentName = STUDENT_NAMES[alert.studentId] || "Enrolled Student";

            // SLA calculation
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

            // Status chip with dot
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
              <tr
                key={alert._id}
                onClick={() => onRowClick(alert)}
                style={{
                  borderBottom: idx === alerts.length - 1 ? "none" : "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                className="inbox-row"
              >
                {/* Student */}
                <td style={{ padding: "0.875rem 1rem" }}>
                  <div style={{ fontWeight: 600, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
                    {alert.studentId}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                    {studentName}
                  </div>
                </td>

                {/* Alert ID */}
                <td style={{ padding: "0.875rem 1rem", fontVariantNumeric: "tabular-nums" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    {alert._id}
                  </span>
                </td>

                {/* Status chip with dot */}
                <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.2rem 0.55rem",
                      borderRadius: "12px",
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
                </td>

                {/* SLA countdown + thin progress bar */}
                <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.3rem", fontWeight: 600, color: slaColor }}>
                    <span>{slaText}</span>
                    <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>48h SLA</span>
                  </div>
                  <div style={{ height: "4px", background: "var(--surface-2)", borderRadius: "2px", border: "1px solid var(--border)", overflow: "hidden" }}>
                    <div style={{ width: `${slaPct}%`, height: "100%", background: slaColor, borderRadius: "2px" }} />
                  </div>
                </td>

                {/* Raised Date */}
                <td style={{ padding: "0.875rem 1rem", color: "var(--text-muted)", fontSize: "0.8125rem", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {new Date(alert.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                {/* Actions */}
                <td style={{ padding: "0.875rem 1rem", textAlign: "right", whiteSpace: "nowrap" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={isAck || isSaving}
                      onClick={(e) => onAcknowledge(alert._id, e)}
                      title={isAck ? "Alert is already acknowledged" : "Mark alert as acknowledged"}
                      style={{
                        padding: "0.35rem 0.75rem",
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
                      title="Open details and log mentoring intervention"
                      style={{
                        padding: "0.35rem 0.65rem",
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
