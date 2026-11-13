"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  interventionSuccessRate: number;
}

export default function OutcomeSuccessDonutChart({ interventionSuccessRate }: Props) {
  const successPct = Math.round((interventionSuccessRate || 0.68) * 100);
  const stablePct = Math.round((100 - successPct) * 0.65);
  const pendingPct = Math.max(0, 100 - successPct - stablePct);

  const data = [
    { name: "Improved (Success)", value: successPct, color: "#2E8B7A" },
    { name: "No Change (Stable)", value: stablePct, color: "#D49A1F" },
    { name: "Needs Further Action", value: pendingPct, color: "#8A4A7B" },
  ];

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "8px", padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#1B2A33" }}>
          Intervention outcome success rate
        </h3>
        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#2E8B7A", fontVariantNumeric: "tabular-nums" }}>
          {successPct}% Efficacy
        </span>
      </div>
      <div style={{ height: "260px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => [`${value}%`, "Proportion"]} />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "12px" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
