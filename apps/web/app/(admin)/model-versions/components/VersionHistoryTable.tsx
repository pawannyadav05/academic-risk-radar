import React from "react";
import { RiskModelVersion } from "@academic-risk-radar/shared-types";

interface VersionHistoryTableProps {
  versions: RiskModelVersion[];
  activeVersion: string;
  onActivate: (versionTag: string) => void;
  isActivating: boolean;
}

export function VersionHistoryTable({
  versions,
  activeVersion,
  onActivate,
  isActivating,
}: VersionHistoryTableProps) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #D9DFDD",
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "1.5rem",
      }}
    >
      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #D9DFDD" }}>
        <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, color: "#1B2A33" }}>
          Published model versions
        </h3>
        <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "#5B6B75" }}>
          Immutable scoring configuration records stored in MongoDB.
        </p>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#F2F4F3", borderBottom: "1px solid #D9DFDD", color: "#5B6B75" }}>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600 }}>Version</th>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600 }}>Effective date</th>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600 }}>Author</th>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600 }}>Status</th>
              <th style={{ padding: "0.6rem 1rem", fontWeight: 600, textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {versions.map((v) => {
              const isActive = v.version === activeVersion;
              return (
                <tr key={v.version} style={{ borderBottom: "1px solid #D9DFDD" }}>
                  <td style={{ padding: "0.65rem 1rem", fontWeight: 600, color: "#1B2A33", fontVariantNumeric: "tabular-nums" }}>
                    {v.version}
                  </td>
                  <td style={{ padding: "0.65rem 1rem", color: "#5B6B75", fontVariantNumeric: "tabular-nums" }}>
                    {new Date(v.effectiveFrom).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "0.65rem 1rem", color: "#1B2A33" }}>
                    {v.createdBy}
                  </td>
                  <td style={{ padding: "0.65rem 1rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: isActive ? "#E8F5F1" : "#F2F4F3",
                        color: isActive ? "#2E8B7A" : "#5B6B75",
                      }}
                    >
                      {isActive ? "Active" : "Archived"}
                    </span>
                  </td>
                  <td style={{ padding: "0.65rem 1rem", textAlign: "right" }}>
                    {!isActive && (
                      <button
                        onClick={() => onActivate(v.version)}
                        disabled={isActivating}
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
                        Activate version
                      </button>
                    )}
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

