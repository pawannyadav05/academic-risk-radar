import React from "react";
import { Users, AlertTriangle, TrendingUp } from "lucide-react";

interface DeanKpiRowProps {
  totalStudents?: number;
  atRiskCount?: number;
  interventionSuccessRate?: number;
  loading: boolean;
  hasError: boolean;
}

export function DeanKpiRow({
  totalStudents,
  atRiskCount,
  interventionSuccessRate,
  loading,
  hasError,
}: DeanKpiRowProps) {
  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: "var(--surface)",
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              height: "90px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ width: "45%", height: "12px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", marginBottom: "0.75rem" }} />
            <div style={{ width: "30%", height: "28px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)" }} />
          </div>
        ))}
      </div>
    );
  }

  const showFallback = hasError || totalStudents === undefined || totalStudents === null;
  const totalDisplay = showFallback ? "—" : totalStudents;
  const atRiskDisplay = hasError || atRiskCount === undefined || atRiskCount === null ? "—" : atRiskCount;

  let successRateDisplay = "—";
  if (!hasError && typeof interventionSuccessRate === "number") {
    successRateDisplay = `${Math.round(interventionSuccessRate * 100)}%`;
  }

  const cardStyle: React.CSSProperties = {
    background: "var(--surface)",
    padding: "1.25rem",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    minHeight: "108px",
    boxSizing: "border-box",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
      {/* Tile 1: Total Enrolled */}
      <div style={cardStyle}>
        <div style={{ background: "var(--surface-2)", padding: "0.85rem", borderRadius: "var(--radius-sm)", color: "var(--primary)", flexShrink: 0 }}>
          <Users size={22} />
        </div>
        <div>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8125rem", fontWeight: 500 }}>Total enrolled students</p>
          <h2 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
            {totalDisplay}
          </h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "0.1rem" }}>
            {showFallback ? "Data unavailable" : "Across all departments"}
          </span>
        </div>
      </div>

      {/* Tile 2: Institution-Wide At-Risk */}
      <div style={cardStyle}>
        <div style={{ background: "var(--surface-2)", padding: "0.85rem", borderRadius: "var(--radius-sm)", color: "var(--danger)", flexShrink: 0 }}>
          <AlertTriangle size={22} />
        </div>
        <div>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8125rem", fontWeight: 500 }}>Institution-wide at risk</p>
          <h2 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "var(--danger)", fontVariantNumeric: "tabular-nums" }}>
            {atRiskDisplay}
          </h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "0.1rem" }}>
            {hasError ? "Data unavailable" : "High and Critical bands"}
          </span>
        </div>
      </div>

      {/* Tile 3: Intervention Success Rate */}
      <div style={cardStyle}>
        <div style={{ background: "var(--surface-2)", padding: "0.85rem", borderRadius: "var(--radius-sm)", color: "var(--success)", flexShrink: 0 }}>
          <TrendingUp size={22} />
        </div>
        <div>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8125rem", fontWeight: 500 }}>Intervention success rate</p>
          <h2 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "var(--success)", fontVariantNumeric: "tabular-nums" }}>
            {successRateDisplay}
          </h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "0.1rem" }}>
            {hasError || typeof interventionSuccessRate !== "number" ? "Data unavailable" : "Validated mentor outcomes"}
          </span>
        </div>
      </div>
    </div>
  );
}
