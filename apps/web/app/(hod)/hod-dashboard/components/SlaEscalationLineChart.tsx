"use client";

import React, { useState } from "react";
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
import { Table, LineChart as LineChartIcon, Clock } from "lucide-react";
import { HodSlaTrendTable, SlaTrendRow } from "./HodSlaTrendTable";

interface Props {
  escalatedAlerts?: number;
  recentTrends?: Array<{
    week: string;
    bandCounts: { low: number; moderate: number; high: number; critical: number };
  }>;
}

export default function SlaEscalationLineChart({ escalatedAlerts = 0, recentTrends }: Props) {
  const [showTable, setShowTable] = useState(false);
  const hasData = Boolean(recentTrends && recentTrends.length > 0);

  const chartData: SlaTrendRow[] = hasData
    ? (recentTrends || []).map((t) => ({
        week: t.week.replace(/^.*-W/, "Wk "),
        atRisk: (t.bandCounts.high || 0) + (t.bandCounts.critical || 0),
        escalated: Math.min(escalatedAlerts, (t.bandCounts.high || 0) + (t.bandCounts.critical || 0)),
      }))
    : [];

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--text)" }}>
            48-hour SLA resolution &amp; escalation trend
          </h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Trailing 4 weeks resolution against 48-hour policy.
          </p>
        </div>

        {hasData && (
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
            {showTable ? <LineChartIcon size={13} /> : <Table size={13} />}
            <span>{showTable ? "View as chart" : "View as table"}</span>
          </button>
        )}
      </div>

      {!hasData ? (
        <div style={{ height: "260px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px dashed var(--border)", padding: "1.5rem", textAlign: "center" }}>
          <Clock size={28} style={{ color: "var(--text-muted)", marginBottom: "0.5rem", opacity: 0.7 }} />
          <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500, color: "var(--text)" }}>
            Trend data will appear once alerts are tracked.
          </p>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Weekly 48-hour resolution SLA metrics will populate automatically.
          </span>
        </div>
      ) : showTable ? (
        <HodSlaTrendTable data={chartData} />
      ) : (
        <div style={{ height: "260px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, left: -5, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={11} tickLine={false} label={{ value: "Week", position: "insideBottom", offset: -10, fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} tickLine={false} label={{ value: "Students / Alerts", angle: -90, position: "insideLeft", offset: 12, fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--text)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem" }}
                itemStyle={{ color: "var(--text)" }}
                formatter={(val: number | string | readonly (string | number)[] | undefined, name: number | string | undefined) => [
                  `${val ?? 0}`,
                  name === "atRisk" ? "At-risk cohort" : "SLA breaches (>48h)",
                ]}
              />
              <Legend
                verticalAlign="top"
                align="left"
                wrapperStyle={{ paddingBottom: "10px", fontSize: "12px" }}
                formatter={(val) => (
                  <span style={{ color: "var(--text)", fontWeight: 500, marginRight: "1rem" }}>
                    {val === "atRisk" ? "At-risk cohort (Solid)" : "SLA breaches (>48h) (Dashed)"}
                  </span>
                )}
              />
              <Line type="monotone" dataKey="atRisk" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--primary)" }} />
              <Line type="monotone" dataKey="escalated" stroke="var(--danger)" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 5, fill: "var(--danger)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
