"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  bandDistribution: {
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
}

const COHORT_COLORS = {
  low: "#2E8B7A",       // steady
  moderate: "#D49A1F",  // watch
  high: "#8A4A7B",      // needs-support
  critical: "#5B6B75",  // muted text
};

export default function DepartmentRiskBarChart({ bandDistribution }: Props) {
  const chartData = [
    { cohort: "Steady (Low)", count: bandDistribution.low || 0, color: COHORT_COLORS.low },
    { cohort: "Watch (Mod)", count: bandDistribution.moderate || 0, color: COHORT_COLORS.moderate },
    { cohort: "High Risk", count: bandDistribution.high || 0, color: COHORT_COLORS.high },
    { cohort: "Critical", count: bandDistribution.critical || 0, color: COHORT_COLORS.critical },
  ];

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "8px", padding: "1.25rem" }}>
      <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600, color: "#1B2A33" }}>
        Department risk cohort distribution
      </h3>
      <div style={{ height: "260px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D9DFDD" />
            <XAxis dataKey="cohort" stroke="#5B6B75" fontSize={12} tickLine={false} />
            <YAxis stroke="#5B6B75" fontSize={12} allowDecimals={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "#F2F4F3" }}
              formatter={(value: any) => [`${value} Students`, "Count"]}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
