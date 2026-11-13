"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  escalatedAlerts: number;
  recentTrends?: Array<{
    week: string;
    bandCounts: { low: number; moderate: number; high: number; critical: number };
  }>;
}

export default function SlaEscalationLineChart({ escalatedAlerts, recentTrends }: Props) {
  const chartData =
    recentTrends && recentTrends.length > 0
      ? recentTrends.map((t) => ({
          week: t.week.replace(/^.*-W/, "Wk "),
          atRisk: (t.bandCounts.high || 0) + (t.bandCounts.critical || 0),
          escalated: Math.min(escalatedAlerts, t.bandCounts.high || 0),
        }))
      : [
          { week: "Wk 5", atRisk: 12, escalated: 1 },
          { week: "Wk 6", atRisk: 14, escalated: 2 },
          { week: "Wk 7", atRisk: 11, escalated: 1 },
          { week: "Wk 8", atRisk: 8, escalated: escalatedAlerts },
        ];

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "8px", padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#1B2A33" }}>
          48-hour SLA resolution &amp; escalation trend
        </h3>
        <span style={{ fontSize: "0.75rem", color: "#5B6B75" }}>Trailing 4 weeks</span>
      </div>
      <div style={{ height: "260px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D9DFDD" />
            <XAxis dataKey="week" stroke="#5B6B75" fontSize={12} tickLine={false} />
            <YAxis stroke="#5B6B75" fontSize={12} allowDecimals={false} tickLine={false} />
            <Tooltip
              formatter={(value: any, name: any) => [
                `${value} Students`,
                name === "atRisk" ? "Total At-Risk" : "Escalated Breaches",
              ]}
            />
            <Legend
              formatter={(value) => (value === "atRisk" ? "At-risk cohort" : "SLA breaches (>48h)")}
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
            />
            <Line
              type="monotone"
              dataKey="atRisk"
              stroke="#2D5BA3"
              strokeWidth={2}
              dot={{ r: 4, fill: "#2D5BA3" }}
            />
            <Line
              type="monotone"
              dataKey="escalated"
              stroke="#8A4A7B"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 4, fill: "#8A4A7B" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
