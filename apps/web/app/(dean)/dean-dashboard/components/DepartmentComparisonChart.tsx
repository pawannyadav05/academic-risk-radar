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
  departmentComparison?: Array<{
    department: string;
    totalStudents: number;
    atRisk: number;
  }>;
}

export default function DepartmentComparisonChart({ departmentComparison }: Props) {
  const chartData =
    departmentComparison && departmentComparison.length > 0
      ? departmentComparison.map((d) => ({
          dept: d.department,
          total: d.totalStudents,
          atRisk: d.atRisk,
        }))
      : [
          { dept: "CSE", total: 45, atRisk: 12 },
          { dept: "ECE", total: 38, atRisk: 7 },
          { dept: "ME", total: 32, atRisk: 5 },
        ];

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "8px", padding: "1.25rem" }}>
      <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600, color: "#1B2A33" }}>
        Cross-department risk comparison
      </h3>
      <div style={{ height: "260px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D9DFDD" />
            <XAxis dataKey="dept" stroke="#5B6B75" fontSize={12} tickLine={false} />
            <YAxis stroke="#5B6B75" fontSize={12} allowDecimals={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "#F2F4F3" }}
              formatter={(value: any, name: any) => [
                `${value} Students`,
                name === "total" ? "Total Enrolled" : "At-Risk Cohort",
              ]}
            />
            <Legend
              formatter={(value) => (value === "total" ? "Total Enrolled" : "At-Risk Cohort")}
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
            />
            <Bar dataKey="total" fill="#2D5BA3" radius={[4, 4, 0, 0]} />
            <Bar dataKey="atRisk" fill="#8A4A7B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
