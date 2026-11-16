import React from "react";
import { Users, AlertTriangle } from "lucide-react";

interface Props {
  totalStudents: number;
  totalAtRisk: number;
}

export function SectionKpiCards({ totalStudents, totalAtRisk }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
      <div style={{ background: "#FFFFFF", padding: "1.25rem", borderRadius: "8px", border: "1px solid #D9DFDD", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ background: "#F2F4F3", padding: "0.75rem", borderRadius: "4px", color: "#2D5BA3" }}>
          <Users size={20} />
        </div>
        <div>
          <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.8125rem", fontWeight: 500 }}>Total section students</p>
          <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.5rem", fontWeight: 700, color: "#1B2A33", fontVariantNumeric: "tabular-nums" }}>
            {totalStudents}
          </h3>
        </div>
      </div>

      <div style={{ background: "#FFFFFF", padding: "1.25rem", borderRadius: "8px", border: "1px solid #D9DFDD", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ background: "#F2F4F3", padding: "0.75rem", borderRadius: "4px", color: "#8A4A7B" }}>
          <AlertTriangle size={20} />
        </div>
        <div>
          <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.8125rem", fontWeight: 500 }}>Students needing support</p>
          <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.5rem", fontWeight: 700, color: "#8A4A7B", fontVariantNumeric: "tabular-nums" }}>
            {totalAtRisk}
          </h3>
        </div>
      </div>
    </div>
  );
}

