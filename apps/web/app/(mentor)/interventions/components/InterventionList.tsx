"use client";

import React from "react";
import { Intervention } from "@academic-risk-radar/shared-types";
import { Clock, CheckCircle, Trash2, Calendar, FileText } from "lucide-react";

interface Props {
  interventions: Intervention[];
  onOpenOutcomeModal: (item: Intervention) => void;
  onOpenWithdrawModal: (item: Intervention) => void;
  filterStatus: "all" | "pending" | "recorded";
  setFilterStatus: (status: "all" | "pending" | "recorded") => void;
}

const OUTCOME_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  improved: { label: "Improved", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  no_change: { label: "No Change", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  deteriorated: { label: "Deteriorated", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  inconclusive: { label: "Inconclusive", color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
};

export default function InterventionList({ interventions, onOpenOutcomeModal, onOpenWithdrawModal, filterStatus, setFilterStatus }: Props) {
  const filtered = interventions.filter((item) => {
    if (filterStatus === "pending") return !item.outcome;
    if (filterStatus === "recorded") return !!item.outcome;
    return true;
  });

  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "14px", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "1px solid #1e293b", background: "#0b1120" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(["all", "pending", "recorded"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              style={{
                background: filterStatus === tab ? "#1e293b" : "transparent",
                color: filterStatus === tab ? "#f1f5f9" : "#64748b",
                border: "1px solid",
                borderColor: filterStatus === tab ? "#334155" : "transparent",
                padding: "0.4rem 0.85rem",
                borderRadius: "8px",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {tab} ({tab === "all" ? interventions.length : tab === "pending" ? interventions.filter((i) => !i.outcome).length : interventions.filter((i) => !!i.outcome).length})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>
          <FileText size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.5, display: "block" }} />
          No interventions found in this view.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#0b1120", borderBottom: "1px solid #1e293b", color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase" }}>
                <th style={{ padding: "0.75rem 1rem" }}>Action / Alert</th>
                <th style={{ padding: "0.75rem 1rem" }}>Notes</th>
                <th style={{ padding: "0.75rem 1rem" }}>Follow-up</th>
                <th style={{ padding: "0.75rem 1rem" }}>Outcome</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const outcomeBadge = item.outcome ? OUTCOME_BADGES[item.outcome] : null;
                return (
                  <tr key={item._id} style={{ borderBottom: "1px solid #1e293b" }}>
                    <td style={{ padding: "0.875rem 1rem", verticalAlign: "top" }}>
                      <div style={{ color: "#f1f5f9", fontWeight: 600 }}>{item.action}</div>
                      <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.2rem" }}>
                        Alert: <span style={{ fontFamily: "monospace", color: "#38bdf8" }}>{item.alertId}</span>
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#94a3b8", verticalAlign: "top", maxWidth: "260px" }}>
                      {item.notes}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#94a3b8", verticalAlign: "top", whiteSpace: "nowrap" }}>
                      {item.followUpDate ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem" }}>
                          <Calendar size={13} style={{ color: "#38bdf8" }} />
                          {new Date(item.followUpDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span style={{ color: "#475569" }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", verticalAlign: "top" }}>
                      {outcomeBadge ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, color: outcomeBadge.color, background: outcomeBadge.bg }}>
                          <CheckCircle size={12} /> {outcomeBadge.label}
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, color: "#f59e0b", background: "rgba(245,158,11,0.12)" }}>
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", verticalAlign: "top", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <button
                          onClick={() => onOpenOutcomeModal(item)}
                          style={{ background: "#1e293b", border: "1px solid #334155", color: "#38bdf8", padding: "0.35rem 0.65rem", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer", fontWeight: 500 }}
                        >
                          Outcome
                        </button>
                        <button
                          onClick={() => onOpenWithdrawModal(item)}
                          title="Withdraw intervention"
                          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", padding: "0.35rem 0.5rem", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

