import React from "react";
import { Users, AlertTriangle, CalendarCheck } from "lucide-react";
import { SectionStatTile } from "./SectionStatTile";

interface SectionOverviewStatsProps {
  totalStudents?: number;
  totalNeedingSupport?: number;
  lastSubmissionDate?: string | null;
  loading: boolean;
}

export function SectionOverviewStats({
  totalStudents,
  totalNeedingSupport = 0,
  lastSubmissionDate,
  loading,
}: SectionOverviewStatsProps) {
  const hasAttention = totalNeedingSupport > 0;
  const attentionColor = hasAttention ? "var(--warning)" : "var(--text)";

  if (loading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
        aria-label="Loading section overview metrics"
      >
        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              background: "var(--surface)",
              padding: "1.25rem 1.5rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              height: "88px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "40%",
                height: "12px",
                background: "var(--surface-2)",
                borderRadius: "var(--radius-sm)",
                marginBottom: "0.75rem",
              }}
            />
            <div
              style={{
                width: "25%",
                height: "28px",
                background: "var(--surface-2)",
                borderRadius: "var(--radius-sm)",
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: lastSubmissionDate
          ? "repeat(auto-fit, minmax(220px, 1fr))"
          : "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem",
      }}
    >
      <SectionStatTile
        label="Total students"
        value={totalStudents ?? 0}
        icon={<Users size={20} strokeWidth={2} />}
        ariaLabel="Total section students tile"
      />

      <SectionStatTile
        label="Needs attention"
        value={totalNeedingSupport}
        icon={<AlertTriangle size={20} strokeWidth={2} />}
        ariaLabel="Students needing attention tile"
        iconColor={attentionColor}
        valueColor={attentionColor}
      />

      {lastSubmissionDate && (
        <SectionStatTile
          label="Last data submission"
          value={lastSubmissionDate}
          icon={<CalendarCheck size={20} strokeWidth={2} />}
          ariaLabel="Last data submission tile"
          isHeading={false}
        />
      )}
    </div>
  );
}
