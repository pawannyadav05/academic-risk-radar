import React from "react";
import { AlertTriangle, Info } from "lucide-react";

interface RawDeptEntry {
  departmentId?: string;
  name?: string;
  bandCounts?: { low?: number; moderate?: number; high?: number; critical?: number };
  department?: string;
  totalStudents?: number;
  atRisk?: number;
}

interface DeanDepartmentsAttentionTableProps {
  departmentComparison?: RawDeptEntry[];
}

export function DeanDepartmentsAttentionTable({ departmentComparison }: DeanDepartmentsAttentionTableProps) {
  if (!departmentComparison || departmentComparison.length === 0) return null;

  const rows = departmentComparison
    .map((d) => {
      let deptName = d.name || d.department || d.departmentId || "Unknown";
      if (deptName.startsWith("Department ")) deptName = deptName.replace("Department ", "");

      let total = 0;
      let atRisk = 0;

      if (d.bandCounts) {
        const l = d.bandCounts.low ?? 0;
        const m = d.bandCounts.moderate ?? 0;
        const h = d.bandCounts.high ?? 0;
        const c = d.bandCounts.critical ?? 0;
        total = l + m + h + c;
        atRisk = h + c;
      } else {
        total = d.totalStudents ?? 0;
        atRisk = d.atRisk ?? 0;
      }

      const atRiskPct = total > 0 ? Math.round((atRisk / total) * 100) : 0;
      return { deptName, total, atRisk, atRiskPct };
    })
    .sort((a, b) => b.atRiskPct - a.atRiskPct);

  return (
    <div style={{ marginTop: "1.75rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--text)" }}>
            Departments needing attention
          </h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Ranked by percentage of cohort currently in High or Critical risk bands.
          </p>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.6875rem", color: "var(--text-muted)" }}>
          <Info size={12} />
          <span>*SLA breaches per department pending backend metric aggregation</span>
        </div>
      </div>

      <div style={{ overflowX: "auto", width: "100%" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
              <th style={{ padding: "0.65rem 0.85rem", fontWeight: 600 }}>Department</th>
              <th style={{ padding: "0.65rem 0.85rem", fontWeight: 600, textAlign: "right" }}>Enrolled students</th>
              <th style={{ padding: "0.65rem 0.85rem", fontWeight: 600, textAlign: "right" }}>At-risk cohort</th>
              <th style={{ padding: "0.65rem 0.85rem", fontWeight: 600, textAlign: "right" }}>At-risk %</th>
              <th style={{ padding: "0.65rem 0.85rem", fontWeight: 600, textAlign: "right" }}>SLA breaches*</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.deptName} style={{ borderBottom: "1px solid var(--border)", color: "var(--text)" }}>
                <td style={{ padding: "0.65rem 0.85rem", fontWeight: 600 }}>{row.deptName}</td>
                <td style={{ padding: "0.65rem 0.85rem", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{row.total}</td>
                <td style={{ padding: "0.65rem 0.85rem", textAlign: "right", fontVariantNumeric: "tabular-nums", color: row.atRisk > 0 ? "var(--primary)" : "var(--text)" }}>
                  {row.atRisk}
                </td>
                <td style={{ padding: "0.65rem 0.85rem", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontWeight: 600,
                      color: row.atRiskPct > 20 ? "var(--danger)" : row.atRiskPct > 0 ? "var(--warning)" : "var(--success)",
                    }}
                  >
                    {row.atRiskPct > 20 && <AlertTriangle size={12} />}
                    {row.atRiskPct}%
                  </span>
                </td>
                <td style={{ padding: "0.65rem 0.85rem", textAlign: "right", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                  —
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
