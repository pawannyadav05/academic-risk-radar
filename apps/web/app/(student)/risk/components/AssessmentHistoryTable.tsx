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
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #D9DFDD",
        borderRadius: "8px",
        padding: "1.25rem 1.5rem",
        marginBottom: "1.5rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, color: "#1B2A33" }}>
            Recorded assessments
          </h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "#5B6B75" }}>
            All past assessment marks are preserved and factored directly into your academic risk score.
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "0.75rem", color: "#5B6B75", display: "block" }}>Assessment average</span>
          <span style={{ fontSize: "1.125rem", fontWeight: 700, color: assessmentAvgPct < 60 ? "#D49A1F" : "#2E8B7A", fontVariantNumeric: "tabular-nums" }}>
            {assessmentAvgPct}%
          </span>
        </div>
      </div>

      {records.length === 0 ? (
        <div style={{ fontSize: "0.8125rem", color: "#5B6B75", padding: "1rem 0", textAlign: "center" }}>
          No assessment marks uploaded yet.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #D9DFDD", textAlign: "left", color: "#5B6B75" }}>
                <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>Course</th>
                <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>Assessment</th>
                <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>Date</th>
                <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600, textAlign: "right" }}>Score</th>
                <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600, textAlign: "right" }}>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, idx) => (
                <tr
                  key={`${rec.courseId}-${rec.type}-${rec.date}-${idx}`}
                  style={{
                    borderBottom: "1px solid #F2F4F3",
                    color: "#1B2A33",
                  }}
                >
                  <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>{rec.courseId}</td>
                  <td style={{ padding: "0.6rem 0.75rem" }}>{rec.type}</td>
                  <td style={{ padding: "0.6rem 0.75rem", color: "#5B6B75", fontVariantNumeric: "tabular-nums" }}>
                    {rec.date ? new Date(rec.date).toLocaleDateString() : "Recorded"}
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {rec.score} / {rec.maxScore}
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem", textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: rec.percentage < 50 ? "#D49A1F" : "#2E8B7A" }}>
                    {rec.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

