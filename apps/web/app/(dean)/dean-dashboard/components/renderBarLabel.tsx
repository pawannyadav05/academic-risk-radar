import React from "react";

export function renderBarLabel(color: string, fontWeight: number) {
  return function BarLabel(props: { x?: number | string; y?: number | string; width?: number | string; value?: unknown }) {
    const x = Number(props.x) || 0;
    const y = Number(props.y) || 0;
    const width = Number(props.width) || 0;
    const val = props.value !== undefined && props.value !== null ? String(props.value) : "0";
    return (
      <text x={x + width / 2} y={y - 5} fill={color} textAnchor="middle" fontSize={10} fontWeight={fontWeight}>
        {val}
      </text>
    );
  };
}
