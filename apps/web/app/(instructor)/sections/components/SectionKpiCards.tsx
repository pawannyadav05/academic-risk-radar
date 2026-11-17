import React from "react";
import { Users, AlertTriangle } from "lucide-react";

interface Props {
  totalStudents: number;
  totalAtRisk: number;
}

export function SectionKpiCards({ totalStudents, totalAtRisk }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
      <div style={{ background: "var(--surface)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ background: "var(--surface-2)", padding: "0.75rem", borderRadius: "var(--radius-sm)", color: "var(--primary)" }}>
          <Users size={20} />
        </div>
        <div>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8125rem", fontWeight: 500 }}>Total section students</p>
          <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
            {totalStudents}
          </h3>
        </div>
      </div>

      <div style={{ background: "var(--surface)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ background: "var(--surface-2)", padding: "0.75rem", borderRadius: "var(--radius-sm)", color: "var(--danger)" }}>
          <AlertTriangle size={20} />
        </div>
        <div>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8125rem", fontWeight: 500 }}>Students needing support</p>
          <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.5rem", fontWeight: 700, color: "var(--danger)", fontVariantNumeric: "tabular-nums" }}>
            {totalAtRisk}
          </h3>
        </div>
      </div>
    </div>
  );
}
