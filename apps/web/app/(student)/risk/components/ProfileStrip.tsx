import React from "react";

interface ProfileStripProps {
  name: string;
  enrolmentId: string;
  programme: string;
  section: string;
  computedAt?: string;
}

export function ProfileStrip({
  name,
  enrolmentId,
  programme,
  section,
  computedAt,
}: ProfileStripProps) {
  const displayName = name && name !== "Student" ? name : enrolmentId;
  const initials = displayName
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "ST";

  const formattedDate = computedAt
    ? new Date(computedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "1rem 1.5rem",
        marginBottom: "1.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* 48px Initials Avatar */}
        <div
          aria-label="Student avatar initials"
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "1.125rem",
            flexShrink: 0,
            letterSpacing: "0.02em",
          }}
        >
          {initials}
        </div>

        <div>
          <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>
            {displayName}
          </h2>
          <div
            aria-label="Student details caption"
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              marginTop: "0.15rem",
              lineHeight: 1.4,
            }}
          >
            {programme} · Section {section} · ID: <span style={{ fontVariantNumeric: "tabular-nums" }}>{enrolmentId}</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "right", alignSelf: "center" }} aria-label="Profile last updated date">
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
          Standing calculation
        </span>
        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
          Last updated {formattedDate}
        </span>
      </div>
    </div>
  );
}
