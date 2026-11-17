import React from "react";
import { Users, AlertTriangle, ShieldAlert } from "lucide-react";

interface HodKpiRowProps {
  totalStudents?: number;
  atRiskCount?: number;
  escalatedAlerts?: number;
  loading: boolean;
  hasError: boolean;
}

export function HodKpiRow({
  totalStudents,
  atRiskCount,
  escalatedAlerts,
  loading,
  hasError,
}: HodKpiRowProps) {
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
  const escalatedDisplay = hasError || escalatedAlerts === undefined || escalatedAlerts === null ? "—" : escalatedAlerts;

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
      {/* Tile 1: Total Students */}
      <div style={cardStyle}>
        <div style={{ background: "var(--surface-2)", padding: "0.85rem", borderRadius: "var(--radius-sm)", color: "var(--primary)", flexShrink: 0 }}>
          <Users size={22} />
        </div>
        <div>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8125rem", fontWeight: 500 }}>Total students</p>
          <h2 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
            {totalDisplay}
          </h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "0.1rem" }}>
            {showFallback ? "Data unavailable" : "Enrolled in department"}
          </span>
        </div>
      </div>

      {/* Tile 2: At Risk */}
      <div style={cardStyle}>
        <div style={{ background: "var(--surface-2)", padding: "0.85rem", borderRadius: "var(--radius-sm)", color: "var(--danger)", flexShrink: 0 }}>
          <AlertTriangle size={22} />
        </div>
        <div>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8125rem", fontWeight: 500 }}>At risk (High + Critical)</p>
          <h2 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "var(--danger)", fontVariantNumeric: "tabular-nums" }}>
            {atRiskDisplay}
          </h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "0.1rem" }}>
            {hasError ? "Data unavailable" : "High and Critical bands"}
          </span>
        </div>
      </div>

      {/* Tile 3: Escalated Alerts */}
      <div
        style={cardStyle}
        title="Alerts exceeding the 48h SLA deadline. (Open alert count is shown on the Supervised alerts tab)"
      >
        <div style={{ background: "var(--surface-2)", padding: "0.85rem", borderRadius: "var(--radius-sm)", color: "var(--warning)", flexShrink: 0 }}>
          <ShieldAlert size={22} />
        </div>
        <div>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8125rem", fontWeight: 500 }}>Escalated alerts (SLA breached)</p>
          <h2 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "var(--warning)", fontVariantNumeric: "tabular-nums" }}>
            {escalatedDisplay}
          </h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "0.1rem" }}>
            {hasError ? "Data unavailable" : "Requires department triage"}
          </span>
        </div>
      </div>
    </div>
  );
}
