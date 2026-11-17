import React, { useState } from "react";
import { AuditEntry } from "@academic-risk-radar/shared-types";
import { Copy, Check } from "lucide-react";

interface AuditTableProps {
  entries: AuditEntry[];
  onSelectEntry: (entry: AuditEntry) => void;
}

function formatAction(action: string): string {
  const clean = action.replace(/_/g, " ").toLowerCase();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function getActorRole(actorId: string): string {
  const id = actorId.toLowerCase();
  if (id.includes("admin") || id.startsWith("adm")) return "Admin";
  if (id.includes("hod")) return "HoD";
  if (id.includes("dean")) return "Dean";
  if (id.includes("mentor") || id.startsWith("mtr")) return "Mentor";
  if (id.includes("instructor") || id.startsWith("ins")) return "Instructor";
  return "Staff";
}

export function AuditTable({ entries, onSelectEntry }: AuditTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (entries.length === 0) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "3rem 1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
        No audit entries found matching the selected filter criteria.
      </div>
    );
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "1.25rem" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600 }}>Timestamp</th>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600 }}>Actor</th>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600 }}>Action</th>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600 }}>Entity</th>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600, textAlign: "right" }}>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => {
              const role = getActorRole(entry.actorId);
              const entityStr = entry.entityId ? `${entry.entityType}:${entry.entityId}` : entry.entityType;
              const isCopied = copiedId === entityStr;

              return (
                <tr key={`${entry.timestamp}-${idx}`} style={{ borderBottom: "1px solid var(--border)", color: "var(--text)" }}>
                  <td
                    title={entry.timestamp}
                    style={{ padding: "0.6rem 1rem", fontVariantNumeric: "tabular-nums", color: "var(--text-muted)", whiteSpace: "nowrap" }}
                  >
                    {new Date(entry.timestamp).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td style={{ padding: "0.6rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                      <span style={{ fontWeight: 600, color: "var(--text)" }}>{entry.actorId}</span>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                          background: "var(--surface-2)",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border)",
                          padding: "0.1rem 0.35rem",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        {role}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "0.6rem 1rem" }}>
                    <span style={{ fontWeight: 500 }}>{formatAction(entry.action)}</span>
                  </td>
                  <td style={{ padding: "0.6rem 1rem" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.75rem", color: "var(--text-muted)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {entityStr}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(entityStr)}
                        title={isCopied ? "Copied" : "Copy entity identifier"}
                        aria-label="Copy entity identifier"
                        style={{ background: "none", border: "none", padding: "0.2rem", cursor: "pointer", color: isCopied ? "var(--success)" : "var(--text-muted)", display: "inline-flex" }}
                      >
                        {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: "0.6rem 1rem", textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => onSelectEntry(entry)}
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        padding: "0.25rem 0.65rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--accent)",
                        cursor: "pointer",
                      }}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
