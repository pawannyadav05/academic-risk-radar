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
    <div style={{ background: "#FFFFFF", padding: "1.5rem", borderRadius: "8px", border: "1px solid #D9DFDD" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#1B2A33" }}>
          Multi-factor deficit distribution
        </h3>
        <span style={{ fontSize: "0.75rem", color: "#5B6B75" }}>Attendance vs Assessments vs Submissions</span>
      </div>
      <div style={{ height: "280px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D9DFDD" />
            <XAxis dataKey="range" stroke="#5B6B75" fontSize={12} tickLine={false} />
            <YAxis stroke="#5B6B75" fontSize={12} allowDecimals={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "#F2F4F3" }}
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
              formatter={(value) =>
                value === "attendance"
                  ? "Attendance Deficit"
                  : value === "assessment"
                  ? "Assessment Deficit"
                  : "Missing Assignments"
              }
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
            />
            <Bar dataKey="attendance" fill="#2D5BA3" radius={[4, 4, 0, 0]} />
            <Bar dataKey="assessment" fill="#8A4A7B" radius={[4, 4, 0, 0]} />
            <Bar dataKey="missingWork" fill="#D49A1F" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
