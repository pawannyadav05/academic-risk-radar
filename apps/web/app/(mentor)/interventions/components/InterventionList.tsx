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

const OUTCOME_BADGES: Record<string, { label: string; color: string }> = {
  improved: { label: "Improved", color: "var(--success)" },
  no_change: { label: "No Change", color: "var(--warning)" },
  deteriorated: { label: "Deteriorated", color: "var(--danger)" },
  inconclusive: { label: "Inconclusive", color: "var(--text-muted)" },
};

export default function InterventionList({ interventions, onOpenOutcomeModal, onOpenWithdrawModal, filterStatus, setFilterStatus }: Props) {
  const filtered = interventions.filter((item) => {
    if (filterStatus === "pending") return !item.outcome;
    if (filterStatus === "recorded") return !!item.outcome;
    return true;
  });

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(["all", "pending", "recorded"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              style={{
                background: filterStatus === tab ? "var(--primary)" : "transparent",
                color: filterStatus === tab ? "var(--primary-contrast)" : "var(--text-muted)",
                border: "1px solid",
                borderColor: filterStatus === tab ? "var(--primary)" : "transparent",
                padding: "0.4rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
            >
              {tab} ({tab === "all" ? interventions.length : tab === "pending" ? interventions.filter((i) => !i.outcome).length : interventions.filter((i) => !!i.outcome).length})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          <FileText size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.5, display: "block" }} />
          No interventions found in this view.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.7rem" }}>
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
                  <tr key={item._id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.875rem 1rem", verticalAlign: "top" }}>
                      <div style={{ color: "var(--text)", fontWeight: 600 }}>{item.action}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                        Alert: <span style={{ fontFamily: "monospace", color: "var(--primary)" }}>{item.alertId}</span>
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "var(--text-muted)", verticalAlign: "top", maxWidth: "260px" }}>
                      {item.notes}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "var(--text-muted)", verticalAlign: "top", whiteSpace: "nowrap" }}>
                      {item.followUpDate ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem" }}>
                          <Calendar size={13} style={{ color: "var(--primary)" }} />
                          {new Date(item.followUpDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", verticalAlign: "top" }}>
                      {outcomeBadge ? (
                        <div style={{ display: "inline-flex", flexDirection: "column", gap: "0.25rem" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0.6rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontWeight: 600, color: outcomeBadge.color, background: "var(--surface-2)", border: `1px solid ${outcomeBadge.color}` }}>
                            <CheckCircle size={12} /> {outcomeBadge.label}
                          </span>
                          <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                            Closed-loop: High risk → {outcomeBadge.label}
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: "inline-flex", flexDirection: "column", gap: "0.25rem" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0.6rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontWeight: 600, color: "var(--warning)", background: "var(--surface-2)", border: "1px solid var(--warning)" }}>
                            <Clock size={12} /> Pending
                          </span>
                          <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                            Closed-loop: Awaiting review
                          </span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", verticalAlign: "top", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <button
                          onClick={() => onOpenOutcomeModal(item)}
                          style={{ background: "var(--surface-2)", border: "1px solid var(--primary)", color: "var(--primary)", padding: "0.35rem 0.65rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", cursor: "pointer", fontWeight: 500 }}
                        >
                          Outcome
                        </button>
                        <button
                          onClick={() => onOpenWithdrawModal(item)}
                          title="Withdraw intervention"
                          style={{ background: "var(--surface-2)", border: "1px solid var(--danger)", color: "var(--danger)", padding: "0.35rem 0.5rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", cursor: "pointer" }}
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
