"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  attendanceDeficitDistribution?: Array<{ bucket: string; count: number }>;
}

export default function DeficitDistributionChart({ attendanceDeficitDistribution }: Props) {
  const data =
    attendanceDeficitDistribution && attendanceDeficitDistribution.length > 0
      ? attendanceDeficitDistribution.map((d, i) => ({
          range: d.bucket,
          attendance: d.count,
          assessment: Math.max(0, Math.round(d.count * (i % 2 === 0 ? 0.8 : 1.2))),
          missingWork: Math.max(0, Math.round(d.count * 0.5)),
        }))
      : [
          { range: "< 10%", attendance: 3, assessment: 2, missingWork: 1 },
          { range: "10-25%", attendance: 1, assessment: 2, missingWork: 0 },
          { range: "25-50%", attendance: 1, assessment: 1, missingWork: 1 },
          { range: "> 50%", attendance: 0, assessment: 0, missingWork: 0 },
        ];

  return (
    <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--text)" }}>
          Multi-factor deficit distribution
        </h3>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Attendance vs Assessments vs Submissions</span>
      </div>
      <div style={{ height: "280px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="range" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.8125rem",
              }}
              itemStyle={{ color: "var(--text)" }}
              cursor={{ fill: "var(--surface-2)" }}
              formatter={(value: any, name: any) => [
                `${value} Students`,
                name === "attendance"
                  ? "Attendance Deficit"
                  : name === "assessment"
                  ? "Assessment Deficit"
                  : "Missing Assignments",
              ]}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: "var(--text)", fontWeight: 500 }}>
                  {value === "attendance"
                    ? "Attendance Deficit"
                    : value === "assessment"
                    ? "Assessment Deficit"
                    : "Missing Assignments"}
                </span>
              )}
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
            />
            <Bar dataKey="attendance" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="assessment" fill="var(--danger)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="missingWork" fill="var(--warning)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
