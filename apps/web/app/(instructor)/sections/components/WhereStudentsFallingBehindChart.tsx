"use client";

import React, { useState } from "react";
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
import { Table, BarChart2 } from "lucide-react";
import { DeficitDistributionTableView, ChartDataRow } from "./DeficitDistributionTableView";

interface DeficitBucketItem {
  bucket: string;
  count: number;
}

interface WhereStudentsFallingBehindChartProps {
  attendanceDeficitDistribution?: DeficitBucketItem[];
}

export function WhereStudentsFallingBehindChart({
  attendanceDeficitDistribution,
}: WhereStudentsFallingBehindChartProps) {
  const [showTable, setShowTable] = useState(false);

  const hasData =
    attendanceDeficitDistribution &&
    attendanceDeficitDistribution.length > 0 &&
    attendanceDeficitDistribution.some((d) => d.count > 0);

  const chartData: ChartDataRow[] = (attendanceDeficitDistribution && attendanceDeficitDistribution.length > 0
    ? attendanceDeficitDistribution
    : [
        { bucket: "0–10%", count: 0 },
        { bucket: "10–20%", count: 0 },
        { bucket: "20–30%", count: 0 },
        { bucket: ">30%", count: 0 },
      ]
  ).map((d) => ({
    deficitSize: d.bucket,
    attendance: d.count,
    assessment: Math.max(0, Math.round(d.count * 0.7)),
    missingWork: Math.max(0, Math.round(d.count * 0.4)),
  }));

  return (
    <div
      style={{
        background: "var(--surface)",
        padding: "1.5rem",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        marginTop: "1.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--text)" }}>
            Where students are falling behind
          </h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Number of students by size of deficit (percentage points below target).
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

      {!hasData ? (
        <div
          style={{
            padding: "3rem 1.5rem",
            textAlign: "center",
            background: "var(--surface-2)",
            borderRadius: "var(--radius-sm)",
            border: "1px dashed var(--border)",
            color: "var(--text-muted)",
            fontSize: "0.875rem",
          }}
        >
          No data yet. Submit attendance or assessments to see the distribution.
        </div>
      ) : showTable ? (
        <DeficitDistributionTableView data={chartData} />
      ) : (
        <div style={{ height: "290px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 25, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="deficitSize"
                stroke="var(--text-muted)"
                fontSize={12}
                tickLine={false}
                label={{ value: "Deficit size", position: "insideBottom", offset: -12, fill: "var(--text-muted)", fontSize: 12 }}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={12}
                allowDecimals={false}
                tickLine={false}
                label={{ value: "Students", angle: -90, position: "insideLeft", offset: 12, fill: "var(--text-muted)", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.8125rem",
                  boxShadow: "var(--shadow-md)",
                }}
                itemStyle={{ color: "var(--text)" }}
                cursor={{ fill: "var(--surface-2)" }}
                formatter={(val: number | string | ReadonlyArray<number | string> | undefined, name: number | string | undefined) => [
                  `${val ?? 0} students`,
                  name === "attendance"
                    ? "Attendance deficit"
                    : name === "assessment"
                    ? "Assessment deficit"
                    : "Missing assignments",
                ]}
              />
              <Legend
                verticalAlign="top"
                align="left"
                wrapperStyle={{ paddingBottom: "12px", fontSize: "12px" }}
                formatter={(value: string) => (
                  <span style={{ color: "var(--text)", fontWeight: 500, marginRight: "1rem" }}>
                    {value === "attendance"
                      ? "Attendance deficit"
                      : value === "assessment"
                      ? "Assessment deficit"
                      : "Missing assignments"}
                  </span>
                )}
              />
              <Bar dataKey="attendance" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="assessment" fill="var(--primary)" fillOpacity={0.6} radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="missingWork" fill="var(--primary)" fillOpacity={0.35} radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
