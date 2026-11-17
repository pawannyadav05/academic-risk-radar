import React from "react";

interface StatTilesProps {
  attendancePct: number;
  cgpa: string;
}

export function StatTiles({ attendancePct, cgpa }: StatTilesProps) {
  const diff = attendancePct - 75;
  const attendanceComparison =
    diff < 0
      ? `${Math.abs(diff)} points below the 75% target`
      : diff > 0
      ? `${diff} points above the 75% target`
      : "Right at the 75% target";

  const isAttendanceDeficit = attendancePct < 75;
  const attendanceColor = isAttendanceDeficit ? "var(--warning)" : "var(--success)";

  const numCgpa = parseFloat(cgpa) || 7.4;
  const cgpaPct = Math.min(100, Math.max(0, (numCgpa / 10) * 100));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Tile 1: Attendance */}
      <div
        aria-label="Attendance stat tile"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>
              Overall attendance
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--text)",
                background: "var(--surface-2)",
                padding: "0.15rem 0.5rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: attendanceColor,
                  flexShrink: 0,
                }}
              />
              {isAttendanceDeficit ? "Below target" : "On track"}
            </span>
          </div>

          <div style={{ margin: "0.75rem 0 0.5rem", display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "2rem", fontWeight: 700, color: attendanceColor, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {attendancePct}%
            </span>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              {attendanceComparison}
            </span>
          </div>
        </div>

        {/* Small Progress Bar with 75% target marker */}
        <div>
          <div
            style={{
              position: "relative",
              height: "8px",
              background: "var(--surface-2)",
              borderRadius: "4px",
              border: "1px solid var(--border)",
              overflow: "visible",
            }}
          >
            {/* Fill */}
            <div
              style={{
                width: `${Math.min(100, Math.max(0, attendancePct))}%`,
                height: "100%",
                background: attendanceColor,
                borderRadius: "3px",
              }}
            />

            {/* 75% Target Marker */}
            <div
              role="img"
              aria-label="75% target line"
              style={{
                position: "absolute",
                top: "-4px",
                left: "75%",
                width: "2px",
                height: "16px",
                background: "var(--text-muted)",
                zIndex: 2,
              }}
              title="75% Institutional target"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
            <span>0%</span>
            <span style={{ marginLeft: "45%" }}>75% target</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Tile 2: CGPA */}
      <div
        aria-label="CGPA stat tile"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>
              Academic record (CGPA)
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              10.0 scale
            </span>
          </div>

          <div style={{ margin: "0.75rem 0 0.5rem", display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
            <span style={{ fontSize: "2rem", fontWeight: 700, color: "var(--success)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {cgpa}
            </span>
            <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
              / 10.0
            </span>
          </div>
        </div>

        {/* Small CGPA Progress Bar */}
        <div>
          <div
            style={{
              position: "relative",
              height: "8px",
              background: "var(--surface-2)",
              borderRadius: "4px",
              border: "1px solid var(--border)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${cgpaPct}%`,
                height: "100%",
                background: "var(--success)",
                borderRadius: "3px",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
            <span>Cumulative grade average</span>
            <span>Scale max 10.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
