import React, { ReactNode } from "react";

interface SectionStatTileProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  ariaLabel: string;
  iconColor?: string;
  valueColor?: string;
  isHeading?: boolean;
}

export function SectionStatTile({
  label,
  value,
  icon,
  ariaLabel,
  iconColor = "var(--text)",
  valueColor = "var(--text)",
  isHeading = true,
}: SectionStatTileProps) {
  return (
    <div
      aria-label={ariaLabel}
      style={{
        background: "var(--surface)",
        padding: "1.25rem 1.5rem",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--surface-2)",
          padding: "0.75rem",
          borderRadius: "var(--radius-sm)",
          color: iconColor,
          display: "inline-flex",
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8125rem", fontWeight: 500 }}>
          {label}
        </p>
        {isHeading ? (
          <h2
            style={{
              margin: "0.15rem 0 0",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: valueColor,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.1,
            }}
          >
            {value}
          </h2>
        ) : (
          <div
            style={{
              margin: "0.15rem 0 0",
              fontSize: "1rem",
              fontWeight: 600,
              color: valueColor,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {value}
          </div>
        )}
      </div>
    </div>
  );
}
