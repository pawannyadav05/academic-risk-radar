import React from "react";
import { RiskModelVersion } from "@academic-risk-radar/shared-types";
import { CheckCircle2 } from "lucide-react";

interface VersionHistoryTableProps {
  versions: RiskModelVersion[];
  activeVersion: string;
  onActivate: (versionTag: string) => void;
  onView: (v: RiskModelVersion) => void;
  isActivating: boolean;
}

export function VersionHistoryTable({
  versions,
  activeVersion,
  onActivate,
  onView,
  isActivating,
}: VersionHistoryTableProps) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        marginBottom: "1.5rem",
      }}
    >
      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
        <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)" }}>
          Version history
        </h3>
        <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
          Immutable configuration records stored in MongoDB.
        </p>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600 }}>Version</th>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600 }}>Status</th>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600 }}>Effective date</th>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600 }}>Published by</th>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {versions.map((v) => {
              const isActive = v.version === activeVersion;
              const statusLabel = isActive ? "Active" : "Retired";
              const statusColor = isActive ? "var(--success)" : "var(--text-muted)";

              return (
                <tr key={v.version} style={{ borderBottom: "1px solid var(--border)", color: "var(--text)" }}>
                  <td style={{ padding: "0.65rem 1rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {v.version}
                  </td>
                  <td style={{ padding: "0.65rem 1rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: "var(--surface-2)",
                        color: statusColor,
                        border: `1px solid ${statusColor}`,
                      }}
                    >
                      {isActive && <CheckCircle2 size={11} />}
                      {statusLabel}
                    </span>
                  </td>
                  <td style={{ padding: "0.65rem 1rem", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                    {new Date(v.effectiveFrom).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "0.65rem 1rem", color: "var(--text)" }}>
                    {v.createdBy || "System"}
                  </td>
                  <td style={{ padding: "0.65rem 1rem", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => onView(v)}
                        style={{
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-sm)",
                          padding: "0.25rem 0.6rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "var(--text)",
                          cursor: "pointer",
                        }}
                      >
                        View
                      </button>
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => onActivate(v.version)}
                          disabled={isActivating}
                          style={{
                            background: "var(--surface)",
                            border: "1px solid var(--accent)",
                            borderRadius: "var(--radius-sm)",
                            padding: "0.25rem 0.6rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "var(--accent)",
                            cursor: isActivating ? "not-allowed" : "pointer",
                            opacity: isActivating ? 0.6 : 1,
                          }}
                        >
                          Activate
                        </button>
                      )}
                    </div>
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
