import React from "react";

interface DonutRingProps {
  value: number;
  color: string;
  trackColor?: string;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
}

export function DonutRing({
  value,
  color,
  trackColor = "#D9DFDD",
  size = 150,
  strokeWidth = 12,
  label,
  sublabel,
}: DonutRingProps) {
  const r = size / 2 - strokeWidth - 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(1, Math.max(0, value)));
  const c = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      {/* Track */}
      <circle cx={c} cy={c} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      {/* Progress */}
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circ}`}
        strokeDashoffset={`${offset}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
      />
      {/* Center Label */}
      <text
        x={c}
        y={sublabel ? c - 5 : c + 6}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#1B2A33"
        fontSize={size * 0.16}
        fontWeight="700"
        fontFamily="var(--font-atkinson, system-ui, sans-serif)"
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={c}
          y={c + 14}
          textAnchor="middle"
          fill="#5B6B75"
          fontSize={size * 0.085}
          fontFamily="var(--font-atkinson, system-ui, sans-serif)"
        >
          {sublabel}
        </text>
      )}
    </svg>
  );
}
