import React from "react";
import { CheckCircle2, ShieldAlert, AlertTriangle } from "lucide-react";

export interface ConnectorSource {
  count: number;
  health: "active" | "degraded" | "inactive";
}

export interface ConnectorStatus {
  status: string;
  sources: {
    attendance: ConnectorSource;
    assessments: ConnectorSource;
    assignments: ConnectorSource;
    lmsActivity: ConnectorSource;
  };
  quarantine: {
    totalRecords: number;
  };
  lastChecked: string;
}

interface ConnectorStatusRowProps {
  status: ConnectorStatus | null;
}

export function ConnectorStatusRow({ status }: ConnectorStatusRowProps) {
  const sources = [
    { key: "attendance", label: "Attendance", source: status?.sources.attendance },
    { key: "assessments", label: "Assessments", source: status?.sources.assessments },
    { key: "assignments", label: "Assignments", source: status?.sources.assignments },
    { key: "lmsActivity", label: "LMS activity", source: status?.sources.lmsActivity },
  ];

  const quarantineCount = status?.quarantine.totalRecords ?? 0;
  const hasQuarantine = quarantineCount > 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}
    >
      {sources.map(({ key, label, source }) => {
        const health = source?.health || "active";
        const isHealthy = health === "active";
        const count = source?.count ?? 0;

        return (
          <div
            key={key}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "1.25rem",
              minHeight: "108px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-muted)" }}>{label}</span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  background: "var(--surface-2)",
                  color: isHealthy ? "var(--steady)" : "var(--watch)",
                  border: `1px solid ${isHealthy ? "var(--steady)" : "var(--watch)"}`,
                  padding: "0.1rem 0.4rem",
                  borderRadius: "var(--radius-sm)",
                  textTransform: "capitalize",
                }}
              >
                {isHealthy ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                <span>{health}</span>
              </span>
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
              {count.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
              Processed records
            </div>
          </div>
        );
      })}

      {/* Quarantine Tile */}
      <div
        style={{
          background: hasQuarantine ? "var(--surface-2)" : "var(--surface)",
          border: `1px solid ${hasQuarantine ? "var(--danger)" : "var(--border)"}`,
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          minHeight: "108px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: hasQuarantine ? "var(--danger)" : "var(--text-muted)" }}>
            Quarantine
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.6875rem",
              fontWeight: 600,
              background: "var(--surface)",
              color: hasQuarantine ? "var(--danger)" : "var(--steady)",
              border: `1px solid ${hasQuarantine ? "var(--danger)" : "var(--border)"}`,
              padding: "0.1rem 0.4rem",
              borderRadius: "var(--radius-sm)",
            }}
          >
            {hasQuarantine ? <ShieldAlert size={10} /> : <CheckCircle2 size={10} />}
            <span>{hasQuarantine ? "Fault-isolated" : "Clean"}</span>
          </span>
        </div>
        <div style={{ fontSize: "1.6rem", fontWeight: 700, color: hasQuarantine ? "var(--danger)" : "var(--text)", fontVariantNumeric: "tabular-nums" }}>
          {quarantineCount.toLocaleString()}
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
          {hasQuarantine ? "Requires remediation" : "0 quarantined rows"}
        </div>
      </div>
    </div>
  );
}
