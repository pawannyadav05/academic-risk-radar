"use client";

import React from "react";

interface SubjectAttendanceCardProps {
  overallPct: number;
  subjectBreakdown?: Array<{ courseId: string; percentage: number }>;
}

const INSTRUCTOR_MAP: Record<string, string> = {
  CS101: "Prof. Rajesh Iyer",
  CS102: "Dr. Meera Nambiar",
  CS103: "Dr. K. S. Verma",
};

export function SubjectAttendanceCard({
  overallPct,
  subjectBreakdown = [],
}: SubjectAttendanceCardProps) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem 1.5rem",
        marginBottom: "1.25rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, color: "var(--text)" }}>
            Subject attendance breakdown
          </h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Combined average of all instructors.
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "inline-block", marginRight: "0.5rem" }}>
            Section aggregate:
          </span>
          <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
            {overallPct}%
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {subjectBreakdown.length > 0 ? (
          subjectBreakdown.map((item) => {
            const isDeficit = item.percentage < 75;
            const barColor = isDeficit ? "var(--warning)" : "var(--success)";
            const instructor = INSTRUCTOR_MAP[item.courseId] || "Course Faculty";

            return (
              <div
                key={item.courseId}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.875rem 1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)", marginRight: "0.5rem" }}>
                      {item.courseId}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {instructor}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--surface)",
                        border: `1px solid ${isDeficit ? "var(--warning)" : "var(--success)"}`,
                        color: "var(--text)",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: isDeficit ? "var(--warning)" : "var(--success)",
                          flexShrink: 0,
                        }}
                      />
                      {isDeficit ? "Below target" : "On track"}
                    </span>
                    <span
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: 700,
                        color: "var(--text)",
                        fontVariantNumeric: "tabular-nums",
                        minWidth: "40px",
                        textAlign: "right",
                      }}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Horizontal Progress Bar with 75% target marker */}
                <div
                  style={{
                    position: "relative",
                    height: "6px",
                    background: "var(--surface)",
                    borderRadius: "3px",
                    border: "1px solid var(--border)",
                    overflow: "visible",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                      height: "100%",
                      background: barColor,
                      borderRadius: "2px",
                    }}
                  />
                  {/* Vertical tick at 75% target */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-3px",
                      left: "75%",
                      width: "2px",
                      height: "12px",
                      background: "var(--text-muted)",
                      zIndex: 2,
                    }}
                    title="75% target threshold"
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", padding: "0.5rem 0" }}>
            Overall attendance is currently recorded at {overallPct}%.
          </div>
        )}
      </div>
    </div>
  );
}
