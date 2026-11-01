"use client";

import React from "react";

interface SubjectAttendanceCardProps {
  overallPct: number;
  subjectBreakdown?: Array<{ courseId: string; percentage: number }>;
}

export function SubjectAttendanceCard({
  overallPct,
  subjectBreakdown = [],
}: SubjectAttendanceCardProps) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #D9DFDD",
        borderRadius: "8px",
        padding: "1.25rem 1.5rem",
        marginBottom: "1.25rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, color: "#1B2A33" }}>
            Subject attendance breakdown
          </h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "#5B6B75" }}>
            Calculated as the percentage average across both course instructors.
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "0.75rem", color: "#5B6B75", display: "block" }}>Combined average</span>
          <span style={{ fontSize: "1.125rem", fontWeight: 700, color: overallPct < 75 ? "#D49A1F" : "#2E8B7A", fontVariantNumeric: "tabular-nums" }}>
            {overallPct}%
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.875rem" }}>
        {subjectBreakdown.length > 0 ? (
          subjectBreakdown.map((item) => {
            const isDeficit = item.percentage < 75;
            return (
              <div
                key={item.courseId}
                style={{
                  background: "#F2F4F3",
                  border: "1px solid #D9DFDD",
                  borderRadius: "4px",
                  padding: "0.75rem 1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1B2A33" }}>
                    {item.courseId}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#5B6B75" }}>
                    {item.courseId === "CS101" ? "Instructor 1" : item.courseId === "CS102" ? "Instructor 2" : "Course"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "1rem", fontWeight: 700, color: isDeficit ? "#D49A1F" : "#2E8B7A", fontVariantNumeric: "tabular-nums" }}>
                    {item.percentage}%
                  </span>
                  <div style={{ fontSize: "0.6875rem", color: isDeficit ? "#8A4A7B" : "#5B6B75" }}>
                    {isDeficit ? "Below target" : "On track"}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ fontSize: "0.8125rem", color: "#5B6B75", padding: "0.5rem 0" }}>
            Overall attendance is currently recorded at {overallPct}%.
          </div>
        )}
      </div>
    </div>
  );
}

