import React from "react";
import { AuditEntry } from "@academic-risk-radar/shared-types";

interface AuditTableProps {
  entries: AuditEntry[];
  onSelectEntry: (entry: AuditEntry) => void;
}

export function AuditTable({ entries, onSelectEntry }: AuditTableProps) {
  if (entries.length === 0) {
    return (
      <div style={{ background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "8px", padding: "2.5rem", textAlign: "center", color: "#5B6B75", fontSize: "0.875rem" }}>
        No audit entries found matching the selected filter criteria.
      </div>
    );
  }

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "8px", overflow: "hidden", marginBottom: "1.25rem" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#F2F4F3", borderBottom: "1px solid #D9DFDD", color: "#5B6B75" }}>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600 }}>Timestamp</th>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600 }}>Actor</th>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600 }}>Action</th>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600 }}>Entity</th>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600, textAlign: "right" }}>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => (
              <tr key={`${entry.timestamp}-${idx}`} style={{ borderBottom: "1px solid #D9DFDD" }}>
                <td style={{ padding: "0.65rem 1rem", fontVariantNumeric: "tabular-nums", color: "#5B6B75", whiteSpace: "nowrap" }}>
                  {new Date(entry.timestamp).toLocaleString()}
                </td>
                <td style={{ padding: "0.65rem 1rem", fontWeight: 600, color: "#1B2A33" }}>
                  {entry.actorId}
                </td>
                <td style={{ padding: "0.65rem 1rem" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: entry.action.includes("ACTIVATE") ? "#E8F5F1" : "#F2F4F3",
                      color: entry.action.includes("ACTIVATE") ? "#2E8B7A" : "#1B2A33",
                    }}
                  >
                    {entry.action.replace(/_/g, " ").toLowerCase()}
                  </span>
                </td>
                <td style={{ padding: "0.65rem 1rem", color: "#5B6B75" }}>
                  <span style={{ fontWeight: 600, color: "#1B2A33" }}>{entry.entityType}</span>
                  {entry.entityId && <span style={{ marginLeft: "0.35rem", fontVariantNumeric: "tabular-nums" }}>({entry.entityId})</span>}
                </td>
                <td style={{ padding: "0.65rem 1rem", textAlign: "right" }}>
                  <button
                    onClick={() => onSelectEntry(entry)}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #D9DFDD",
                      borderRadius: "4px",
                      padding: "0.25rem 0.6rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#2D5BA3",
                      cursor: "pointer",
                    }}
                  >
                    View details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
