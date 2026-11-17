import React from "react";
import { Alert } from "@academic-risk-radar/shared-types";
import { Eye, AlertTriangle } from "lucide-react";

interface HodAlertRowProps {
  alert: Alert;
  studentName: string;
  mentorName: string;
  onView: (alert: Alert) => void;
}

export function HodAlertRow({ alert, studentName, mentorName, onView }: HodAlertRowProps) {
  const isAck = alert.status === "acknowledged" || alert.status === "closed";
  const diffMs = new Date(alert.slaDeadline).getTime() - Date.now();
  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  const isBreached = diffMs <= 0 && !isAck;

  let slaText = `${Math.max(0, hoursLeft)}h left`;
  let slaColor = "var(--text-muted)";
  if (isAck) {
    slaText = "Resolved";
    slaColor = "var(--success)";
  } else if (isBreached) {
    const breachedByHours = Math.abs(hoursLeft);
    slaText = `Breached by ${breachedByHours}h`;
    slaColor = "var(--danger)";
  } else if (hoursLeft < 12) {
    slaColor = "var(--warning)";
  }

  const escalatedDate = alert.escalatedAt
    ? new Date(alert.escalatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : alert.isOverdue || isBreached
    ? "Auto-escalated"
    : "—";

  return (
    <tr
      onClick={() => onView(alert)}
      style={{
        borderBottom: "1px solid var(--border)",
        background: isBreached ? "var(--surface-2)" : "transparent",
        cursor: "pointer",
        transition: "background 0.15s ease",
      }}
    >
      <td style={{ padding: "0.75rem 1rem" }}>
        <div style={{ fontWeight: 600, color: "var(--text)" }}>{studentName}</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>ID: {alert.studentId}</div>
      </td>
      <td style={{ padding: "0.75rem 1rem", fontFamily: "ui-monospace, monospace", fontSize: "0.75rem", color: "var(--text-muted)" }}>
        {alert._id}
      </td>
      <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--text)" }}>
        {mentorName}
      </td>
      <td style={{ padding: "0.75rem 1rem" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.2rem 0.55rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.75rem",
            fontWeight: 600,
            background: isAck ? "var(--surface-2)" : isBreached ? "var(--surface-2)" : "var(--surface-2)",
            color: isAck ? "var(--success)" : isBreached ? "var(--danger)" : "var(--warning)",
            border: `1px solid ${isAck ? "var(--success)" : isBreached ? "var(--danger)" : "var(--warning)"}`,
          }}
        >
          {isAck ? "Resolved" : isBreached ? "SLA Breached" : "Open"}
        </span>
      </td>
      <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: slaColor, fontVariantNumeric: "tabular-nums", fontSize: "0.8125rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          {isBreached && <AlertTriangle size={13} />}
          <span>{slaText}</span>
        </div>
      </td>
      <td style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
        {escalatedDate}
      </td>
      <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onView(alert);
          }}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "0.35rem 0.65rem",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--text)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          <Eye size={13} />
          <span>View</span>
        </button>
      </td>
    </tr>
  );
}
