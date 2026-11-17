"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { Table, BarChart2 } from "lucide-react";
import { HodRiskCohortTable, RiskCohortItem } from "./HodRiskCohortTable";

interface Props {
  bandDistribution?: {
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
}

export default function HodRiskCohortChart({ bandDistribution }: Props) {
  const [showTable, setShowTable] = useState(false);

  const low = bandDistribution?.low ?? 0;
  const mod = bandDistribution?.moderate ?? 0;
  const high = bandDistribution?.high ?? 0;
  const crit = bandDistribution?.critical ?? 0;
  const total = low + mod + high + crit;

  const chartData: RiskCohortItem[] = [
    { cohort: "Steady (Low)", count: low, color: "var(--success)" },
    { cohort: "Watch (Moderate)", count: mod, color: "var(--warning)" },
    { cohort: "High Risk", count: high, color: "var(--primary)" },
    { cohort: "Critical", count: crit, color: "var(--danger)" },
  ];

  const summarySr = `${total} students: ${low} Steady (Low), ${mod} Watch (Moderate), ${high} High Risk, ${crit} Critical.`;

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--text)" }}>
            Risk cohort distribution
          </h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Breakdown across the 4 early-warning risk tiers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTable((prev) => !prev)}
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "0.35rem 0.65rem",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--text)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          {showTable ? <BarChart2 size={13} /> : <Table size={13} />}
          <span>{showTable ? "View as chart" : "View as table"}</span>
        </button>
      </div>

      <div className="sr-only" aria-live="polite" style={{ position: "absolute", width: 1, height: 1, padding: 0, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
        {summarySr}
      </div>

      {total === 0 ? (
        <div style={{ padding: "3rem 1.5rem", textAlign: "center", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px dashed var(--border)", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          No students in this department yet.
        </div>
      ) : showTable ? (
        <HodRiskCohortTable data={chartData} />
      ) : (
        <div style={{ height: "260px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="cohort" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} tickLine={false} />
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
                formatter={(val: number | string | readonly (string | number)[] | undefined) => [`${val ?? 0} students`, "Count"]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="count" position="top" style={{ fill: "var(--text)", fontSize: 11, fontWeight: 600 }} />
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
