"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Table, BarChart2 } from "lucide-react";
import { DeanDepartmentComparisonTable, DeptComparisonRow } from "./DeanDepartmentComparisonTable";
import { renderBarLabel } from "./renderBarLabel";

interface RawDeptEntry {
  departmentId?: string;
  name?: string;
  bandCounts?: { low?: number; moderate?: number; high?: number; critical?: number };
  department?: string;
  totalStudents?: number;
  atRisk?: number;
}

interface Props {
  departmentComparison?: RawDeptEntry[];
}

export default function DepartmentComparisonChart({ departmentComparison }: Props) {
  const [showTable, setShowTable] = useState(false);

  const chartData: DeptComparisonRow[] = useMemo(() => {
    if (!departmentComparison || departmentComparison.length === 0) return [];

    return departmentComparison
      .map((d) => {
        let dept = d.name || d.department || d.departmentId || "Unknown";
        if (dept.startsWith("Department ")) dept = dept.replace("Department ", "");

        let total = 0;
        let atRisk = 0;

        if (d.bandCounts) {
          total = (d.bandCounts.low ?? 0) + (d.bandCounts.moderate ?? 0) + (d.bandCounts.high ?? 0) + (d.bandCounts.critical ?? 0);
          atRisk = (d.bandCounts.high ?? 0) + (d.bandCounts.critical ?? 0);
        } else {
          total = d.totalStudents ?? 0;
          atRisk = d.atRisk ?? 0;
        }

        const atRiskPct = total > 0 ? Math.round((atRisk / total) * 100) : 0;
        return { dept, total, atRisk, atRiskPct };
      })
      .sort((a, b) => b.atRiskPct - a.atRiskPct); // Sorted by at-risk share descending
  }, [departmentComparison]);

  const hasData = chartData.length > 0 && chartData.some((d) => d.total > 0);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--text)" }}>
            Cross-department risk comparison
          </h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Total enrolled vs at-risk cohort by academic department.
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
        <div style={{ padding: "3rem 1.5rem", textAlign: "center", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px dashed var(--border)", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          No department data yet.
        </div>
      ) : showTable ? (
        <DeanDepartmentComparisonTable data={chartData} />
      ) : (
        <div style={{ height: "260px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -5, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="dept" stroke="var(--text-muted)" fontSize={11} tickLine={false} label={{ value: "Department", position: "insideBottom", offset: -10, fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} tickLine={false} label={{ value: "Students", angle: -90, position: "insideLeft", offset: 12, fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--text)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem" }}
                itemStyle={{ color: "var(--text)" }}
                formatter={(val: number | string | readonly (string | number)[] | undefined, name: number | string | undefined) => [
                  `${val ?? 0} students`,
                  name === "total" ? "Total Enrolled" : "At-Risk Cohort",
                ]}
              />
              <Legend
                verticalAlign="top"
                align="left"
                wrapperStyle={{ paddingBottom: "10px", fontSize: "12px" }}
                formatter={(val) => (
                  <span style={{ color: "var(--text)", fontWeight: 500, marginRight: "1rem" }}>
                    {val === "total" ? "Total enrolled" : "At-risk cohort"}
                  </span>
                )}
              />
              <Bar dataKey="total" fill="var(--text-muted)" fillOpacity={0.35} radius={[4, 4, 0, 0]} maxBarSize={32} minPointSize={1}>
                <LabelList dataKey="total" position="top" content={renderBarLabel("var(--text-muted)", 500)} />
              </Bar>
              <Bar dataKey="atRisk" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={32} minPointSize={1}>
                <LabelList dataKey="atRisk" position="top" content={renderBarLabel("var(--primary)", 600)} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
