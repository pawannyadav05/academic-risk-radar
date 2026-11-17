import React from "react";

interface LogoMarkProps {
  size?: number;
  variant?: "primary" | "inverted";
}

/**
 * Academic Risk Radar Logo Mark
 * Simple orange rounded square with a clean radar / target crosshair glyph in SVG.
 */
export function LogoMark({ size = 32, variant = "primary" }: LogoMarkProps) {
  const isPrimary = variant === "primary";
  const bg = isPrimary ? "var(--primary)" : "var(--primary-contrast)";
  const fg = isPrimary ? "var(--primary-contrast)" : "var(--primary)";
  const radius = Math.round(size * 0.22);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${radius}px`,
        background: bg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <svg
        width={Math.round(size * 0.68)}
        height={Math.round(size * 0.68)}
        viewBox="0 0 24 24"
        fill="none"
        stroke={fg}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Outer radar ring */}
        <circle cx="12" cy="12" r="9" strokeWidth="1.75" />
        {/* Inner radar ring */}
        <circle cx="12" cy="12" r="5" strokeWidth="1.75" strokeDasharray="3 2" />
        {/* Radar center pulse / target point */}
        <circle cx="12" cy="12" r="1.75" fill={fg} stroke="none" />
        {/* Radar sweep / crosshair tick */}
        <line x1="12" y1="3" x2="12" y2="7" strokeWidth="2" />
        <line x1="12" y1="17" x2="12" y2="21" strokeWidth="2" />
        <line x1="3" y1="12" x2="7" y2="12" strokeWidth="2" />
        <line x1="17" y1="12" x2="21" y2="12" strokeWidth="2" />
      </svg>
    </div>
  );
}
