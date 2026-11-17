"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Table, PieChart as PieChartIcon } from "lucide-react";
import { DeanOutcomeDonutTable, OutcomeSlice } from "./DeanOutcomeDonutTable";

interface Props {
  interventionSuccessRate?: number;
}

export default function OutcomeSuccessDonutChart({ interventionSuccessRate }: Props) {
  const [showTable, setShowTable] = useState(false);

  const hasInterventions = typeof interventionSuccessRate === "number" && interventionSuccessRate > 0;
  const successPct = typeof interventionSuccessRate === "number" ? Math.round(interventionSuccessRate * 100) : 0;

  const data: OutcomeSlice[] = hasInterventions
    ? [
        { name: "Improved (Success)", value: successPct, color: "var(--success)" },
        { name: "No Change (Stable)", value: Math.round((100 - successPct) * 0.7), color: "var(--warning)" },
        { name: "Needs Further Action", value: Math.max(0, 100 - successPct - Math.round((100 - successPct) * 0.7)), color: "var(--danger)" },
      ]
    : [];

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--text)" }}>
            Intervention outcome success rate
          </h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Closed-loop resolution tracking across all departments.
          </p>
        </div>

        {hasInterventions && (
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
            {showTable ? <PieChartIcon size={13} /> : <Table size={13} />}
            <span>{showTable ? "View as chart" : "View as table"}</span>
          </button>
        )}
      </div>

      {!hasInterventions ? (
        <div style={{ padding: "3rem 1.5rem", textAlign: "center", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px dashed var(--border)", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          No interventions logged yet.
        </div>
      ) : showTable ? (
        <DeanOutcomeDonutTable data={data} successRatePct={successPct} />
      ) : (
        <div style={{ height: "260px", position: "relative" }}>
          {/* Centered label inside donut */}
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--success)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
              {successPct}%
            </div>
            <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
              Efficacy
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.8125rem",
                }}
                itemStyle={{ color: "var(--text)" }}
                formatter={(val: number | string | readonly (string | number)[] | undefined) => [`${val ?? 0}%`, "Proportion"]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(val: string) => (
                  <span style={{ color: "var(--text)", fontWeight: 500, fontSize: "11px" }}>{val}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
