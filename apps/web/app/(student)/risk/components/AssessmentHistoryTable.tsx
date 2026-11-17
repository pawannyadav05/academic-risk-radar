"use client";

import React from "react";

export interface AssessmentRecordItem {
  courseId: string;
  type: string;
  score: number;
  maxScore: number;
  percentage: number;
  date: string;
}

interface AssessmentHistoryTableProps {
  records?: AssessmentRecordItem[];
  assessmentAvgPct: number;
}

export function AssessmentHistoryTable({
  records = [],
  assessmentAvgPct,
}: AssessmentHistoryTableProps) {
  // Sort by date descending
  const sortedRecords = [...records].sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem 1.5rem",
        marginBottom: "1.5rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, color: "var(--text)" }}>
            Recorded assessments
          </h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Evaluations factored directly into your standing score. Sorted by newest first.
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "inline-block", marginRight: "0.5rem" }}>
            Assessment average:
          </span>
          <span
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {assessmentAvgPct}%
          </span>
        </div>
      </div>

      {sortedRecords.length === 0 ? (
        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", padding: "1.5rem 0", textAlign: "center" }}>
          No assessment marks uploaded yet for this term.
        </div>
      ) : (
        <div
          aria-label="Recorded assessments scroll container"
          style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", width: "100%", paddingBottom: "4px" }}
        >
          <table
            aria-label="Recorded assessments table"
            style={{
              width: "100%",
              minWidth: "560px",
              borderCollapse: "collapse",
              fontSize: "0.8125rem",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border)",
                  textAlign: "left",
                  color: "var(--text-muted)",
                  position: "sticky",
                  top: 0,
                  background: "var(--surface)",
                  zIndex: 2,
                }}
              >
                <th style={{ padding: "0.625rem 0.75rem", fontWeight: 600 }}>Course</th>
                <th style={{ padding: "0.625rem 0.75rem", fontWeight: 600 }}>Assessment</th>
                <th style={{ padding: "0.625rem 0.75rem", fontWeight: 600 }}>Date</th>
                <th style={{ padding: "0.625rem 0.75rem", fontWeight: 600, textAlign: "right" }}>Score</th>
                <th style={{ padding: "0.625rem 1rem 0.625rem 0.75rem", fontWeight: 600, textAlign: "right", width: "120px" }}>Standing</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map((rec, idx) => {
                const pct = rec.percentage;
                // Semantic chip colors based on thresholds
                let chipColor = "var(--success)";
                let chipLabel = "Strong";
                if (pct < 50) {
                  chipColor = "var(--danger)";
                  chipLabel = "Needs review";
                } else if (pct < 75) {
                  chipColor = "var(--warning)";
                  chipLabel = "Steady";
                }

                return (
                  <tr
                    key={`${rec.courseId}-${rec.type}-${rec.date}-${idx}`}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    <td style={{ padding: "0.75rem", fontWeight: 700 }}>{rec.courseId}</td>
                    <td style={{ padding: "0.75rem" }}>{rec.type}</td>
                    <td style={{ padding: "0.75rem", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                      {rec.date
                        ? new Date(rec.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Recorded"}
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
                      {rec.score} / {rec.maxScore}
                    </td>
                    <td style={{ padding: "0.75rem 1rem 0.75rem 0.75rem", textAlign: "right" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          padding: "0.2rem 0.55rem",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--surface-2)",
                          border: `1px solid ${chipColor}`,
                          color: "var(--text)",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: chipColor,
                            flexShrink: 0,
                          }}
                        />
                        {pct}%
                      </span>
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
