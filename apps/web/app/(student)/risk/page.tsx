"use client";

import React, { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Seed data — Pawan Kumar Yadav (real profile mirroring engine.ts computation)
// ─────────────────────────────────────────────────────────────────────────────
const STUDENT = {
  name: "Pawan Kumar Yadav",
  enrolmentId: "K2P24OF",
  programme: "B.Tech. (Computer Science and Engineering)",
  section: "P132",
  batch: "2024",
  email: "kumarpawanyadav02@gmail.com",
  phone: "9608364081",
  address: "Jehanabad, Jehanabad, India",
  hostel: "Non-Hostler",
};

const METRICS = {
  attendanceRate: 0.68,
  assessmentAvg: 0.843,         // 8.43 CGPA / 10
  missingAssignmentsRatio: 0.20,
  lmsEngagementRatio: 0.60,
  trendDeteriorationSignal: 0.30,
};

// ─────────────────────────────────────────────────────────────────────────────
// Inline scoring engine  (identical algorithm to packages/scoring-engine/src/engine.ts)
// ─────────────────────────────────────────────────────────────────────────────
function computeRiskSnapshot(metrics: typeof METRICS) {
  const weights: Record<string, number> = {
    attendance_deficit:    0.30,
    assessment_deficit:    0.25,
    missing_assignments:   0.20,
    lms_engagement_deficit: 0.10,
    trend_deterioration:   0.15,
  };

  const rawValues: Record<string, number> = {
    attendance_deficit:    +(1.0 - metrics.attendanceRate).toFixed(4),
    assessment_deficit:    +(1.0 - metrics.assessmentAvg).toFixed(4),
    missing_assignments:   +metrics.missingAssignmentsRatio.toFixed(4),
    lms_engagement_deficit: +(1.0 - metrics.lmsEngagementRatio).toFixed(4),
    trend_deterioration:   +metrics.trendDeteriorationSignal.toFixed(4),
  };

  const factors = Object.entries(weights).map(([name, weight]) => {
    const value = rawValues[name] ?? 0;
    const contribution = +(weight * value).toFixed(4);
    return { name, weight, value, contribution };
  });
  factors.sort((a, b) => b.contribution - a.contribution);

  const totalScore = +factors.reduce((s, f) => s + f.contribution, 0).toFixed(4);
  const band =
    totalScore >= 0.75 ? "critical"
    : totalScore >= 0.50 ? "high"
    : totalScore >= 0.25 ? "moderate"
    : "low";

  return { totalScore, band, factors, computedAt: "2026-09-22T18:00:00.000Z", modelVersion: "v1.0.0" };
}

const RISK = computeRiskSnapshot(METRICS);

// ─────────────────────────────────────────────────────────────────────────────
// Config maps
// ─────────────────────────────────────────────────────────────────────────────
const BAND_CONFIG = {
  low:      { label: "Low Risk",      color: "#22c55e", bg: "rgba(34,197,94,0.10)",   border: "rgba(34,197,94,0.25)" },
  moderate: { label: "Moderate Risk", color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.25)" },
  high:     { label: "High Risk",     color: "#ef4444", bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.25)" },
  critical: { label: "Critical Risk", color: "#dc2626", bg: "rgba(220,38,38,0.12)",   border: "rgba(220,38,38,0.30)" },
};

const FACTOR_META: Record<string, { label: string; icon: string }> = {
  attendance_deficit:     { label: "Attendance Deficit",       icon: "🏫" },
  assessment_deficit:     { label: "Assessment Grade Deficit",  icon: "📝" },
  missing_assignments:    { label: "Missing Assignments",       icon: "📋" },
  lms_engagement_deficit: { label: "LMS Engagement Deficit",   icon: "💻" },
  trend_deterioration:    { label: "Trend Deterioration",      icon: "📉" },
};

// ─────────────────────────────────────────────────────────────────────────────
// SVG Donut Ring
// ─────────────────────────────────────────────────────────────────────────────
function DonutRing({
  value,
  color,
  trackColor = "#1e293b",
  size = 150,
  strokeWidth = 13,
  label,
  sublabel,
}: {
  value: number; color: string; trackColor?: string;
  size?: number; strokeWidth?: number; label: string; sublabel?: string;
}) {
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
        cx={c} cy={c} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${circ}`}
        strokeDashoffset={`${offset}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
      />
      {/* Label */}
      <text
        x={c} y={sublabel ? c - 5 : c + 6}
        textAnchor="middle" dominantBaseline="middle"
        fill="#f1f5f9" fontSize={size * 0.145}
        fontWeight="700" fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={c} y={c + 14}
          textAnchor="middle"
          fill="#64748b" fontSize={size * 0.085}
          fontFamily="system-ui, sans-serif"
        >
          {sublabel}
        </text>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────────────────────────────────────
export default function StudentRiskPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "factors">("overview");
  const band = BAND_CONFIG[RISK.band as keyof typeof BAND_CONFIG];
  const cgpa = (METRICS.assessmentAvg * 10).toFixed(2);
  const attendancePct = Math.round(METRICS.attendanceRate * 100);
  const riskPct = Math.round(RISK.totalScore * 100);

  return (
    <div style={{
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      color: "#e2e8f0",
      minHeight: "calc(100vh - 60px)",
      background: "#090e1a",
      margin: "-2rem",
      padding: "1.5rem",
    }}>

      {/* ── PROFILE HEADER CARD ─────────────────────────────────────────── */}
      <div style={{
        background: "#0f172a",
        borderRadius: "16px",
        overflow: "hidden",
        marginBottom: "1.25rem",
        border: "1px solid #1e293b",
      }}>

        {/* Top banner strip — solid dark gradient, no image */}
        <div style={{
          height: "110px",
          background: "linear-gradient(120deg, #0d1f3c 0%, #162544 50%, #0f2238 100%)",
          borderBottom: "1px solid #1e293b",
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}>
          {/* subtle grid lines */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

          {/* Avatar */}
          <div style={{
            position: "absolute", bottom: "-40px",
            width: "80px", height: "80px",
            borderRadius: "50%",
            border: `2.5px solid ${band.color}`,
            background: "#1e293b",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.95rem", fontWeight: "600", color: "#64748b",
            letterSpacing: "0.05em",
            boxShadow: `0 0 0 3px #0f172a, 0 0 18px ${band.color}55`,
            zIndex: 2,
          }}>
            N/A
          </div>
        </div>

        {/* Stats row */}
        <div style={{ paddingTop: "3rem", paddingBottom: "1.25rem", paddingInline: "2rem" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            alignItems: "center",
            gap: "1rem",
            textAlign: "center",
          }}>
            {/* CGPA */}
            <div>
              <div style={{ fontSize: "2rem", fontWeight: "800", color: "#22c55e", lineHeight: 1 }}>
                {cgpa}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#475569", marginTop: "0.3rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                CGPA
              </div>
            </div>

            {/* Name & ID */}
            <div>
              <div style={{ fontSize: "1.15rem", fontWeight: "700", color: "#f1f5f9" }}>
                {STUDENT.name}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.2rem" }}>
                {STUDENT.programme} ({STUDENT.section})
              </div>
              <div style={{ fontSize: "0.72rem", color: "#475569", marginTop: "0.1rem" }}>
                {STUDENT.enrolmentId}
              </div>
              {/* Risk band pill */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.35rem",
                marginTop: "0.5rem",
                padding: "0.2rem 0.7rem",
                borderRadius: "9999px",
                fontSize: "0.72rem", fontWeight: "600",
                color: band.color,
                background: band.bg,
                border: `1px solid ${band.border}`,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: band.color, display: "inline-block" }} />
                {band.label}
              </div>
            </div>

            {/* Attendance */}
            <div>
              <div style={{ fontSize: "2rem", fontWeight: "800", color: "#f59e0b", lineHeight: 1 }}>
                {attendancePct}%
              </div>
              <div style={{ fontSize: "0.7rem", color: "#475569", marginTop: "0.3rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Attendance
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display: "flex", alignItems: "center",
          borderTop: "1px solid #1e293b",
          paddingInline: "1.5rem",
        }}>
          {(["overview", "factors"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.85rem 1.1rem",
                border: "none", background: "transparent",
                color: activeTab === tab ? "#f97316" : "#475569",
                fontWeight: activeTab === tab ? 600 : 400,
                fontSize: "0.83rem",
                cursor: "pointer",
                borderBottom: activeTab === tab ? "2px solid #f97316" : "2px solid transparent",
                transition: "color 0.15s",
                display: "flex", alignItems: "center", gap: "0.4rem",
              }}
            >
              <span>{tab === "overview" ? "🧮" : "📊"}</span>
              {tab === "overview" ? "Risk Overview" : "Factor Breakdown"}
            </button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#334155" }}>
            Last computed: {new Date(RISK.computedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            &nbsp;·&nbsp;Model {RISK.modelVersion}
          </span>
        </div>
      </div>

      {/* ── TAB CONTENT ─────────────────────────────────────────────────── */}
      {activeTab === "overview" ? (

        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.25rem" }}>

          {/* LEFT — Personal info */}
          <div style={{
            background: "#0f172a",
            borderRadius: "16px",
            padding: "1.5rem",
            border: "1px solid #1e293b",
          }}>
            <div style={{
              fontSize: "0.95rem", fontWeight: "700", color: "#f1f5f9",
              marginBottom: "1.25rem",
              paddingBottom: "0.75rem",
              borderBottom: "1px solid #1e293b",
              display: "flex", alignItems: "center", gap: "0.5rem",
            }}>
              Personal Information
            </div>

            {[
              { icon: "👤", value: STUDENT.name },
              { icon: "✉️", value: STUDENT.email },
              { icon: "📞", value: STUDENT.phone },
              { icon: "📍", value: STUDENT.address },
              { icon: "🏠", value: `Hostel: ${STUDENT.hostel}` },
              { icon: "🎓", value: `Batch: ${STUDENT.batch}` },
            ].map((row, i, arr) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.6rem 0",
                borderBottom: i < arr.length - 1 ? "1px solid #0d1526" : "none",
              }}>
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>{row.icon}</span>
                <span style={{ fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.4 }}>{row.value}</span>
              </div>
            ))}

            {/* Scoring model meta */}
            <div style={{
              marginTop: "1.25rem",
              padding: "0.875rem 1rem",
              background: "#090e1a",
              borderRadius: "10px",
              border: "1px solid #1e293b",
            }}>
              <div style={{ fontSize: "0.65rem", color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
                Scoring Engine
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                <span style={{ fontSize: "0.78rem", color: "#475569" }}>Model Version</span>
                <span style={{ fontSize: "0.78rem", color: "#f97316", fontWeight: 600 }}>{RISK.modelVersion}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                <span style={{ fontSize: "0.78rem", color: "#475569" }}>Composite Score</span>
                <span style={{ fontSize: "0.78rem", color: band.color, fontWeight: 600 }}>
                  {riskPct} / 100
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.78rem", color: "#475569" }}>Risk Band</span>
                <span style={{ fontSize: "0.78rem", color: band.color, fontWeight: 600 }}>{band.label}</span>
              </div>
            </div>
          </div>

          {/* RIGHT — 3 Donut charts */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>

            {/* Risk Score */}
            <div style={{
              background: "#0f172a", borderRadius: "16px", padding: "1.5rem",
              border: `1px solid ${band.border}`,
              display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "0.875rem" }}>⚡</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f1f5f9" }}>Risk Score</span>
                <span style={{ marginLeft: "auto", fontSize: "0.875rem", fontWeight: 700, color: band.color }}>
                  {riskPct}
                </span>
              </div>
              <DonutRing
                value={RISK.totalScore}
                color={band.color}
                size={158}
                label={`${riskPct}`}
                sublabel="/ 100"
              />
              <div style={{ marginTop: "0.875rem", fontSize: "0.73rem", color: "#475569", textAlign: "center" }}>
                {band.label}
              </div>
            </div>

            {/* Attendance */}
            <div style={{
              background: "#0f172a", borderRadius: "16px", padding: "1.5rem",
              border: "1px solid #1e293b",
              display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "0.875rem" }}>🏫</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f1f5f9" }}>Attendance</span>
                <span style={{ marginLeft: "auto", fontSize: "0.875rem", fontWeight: 700, color: "#f59e0b" }}>
                  {attendancePct}%
                </span>
              </div>
              <DonutRing
                value={METRICS.attendanceRate}
                color="#f59e0b"
                trackColor="#1e293b"
                size={158}
                label={`${attendancePct}%`}
              />
              <div style={{ marginTop: "0.875rem", fontSize: "0.73rem", color: "#475569", textAlign: "center" }}>
                Below 75% threshold
              </div>
            </div>

            {/* CGPA */}
            <div style={{
              background: "#0f172a", borderRadius: "16px", padding: "1.5rem",
              border: "1px solid #1e293b",
              display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "0.875rem" }}>📝</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f1f5f9" }}>CGPA</span>
                <span style={{ marginLeft: "auto", fontSize: "0.875rem", fontWeight: 700, color: "#22c55e" }}>
                  {cgpa}
                </span>
              </div>
              <DonutRing
                value={METRICS.assessmentAvg}
                color="#22c55e"
                trackColor="#1e293b"
                size={158}
                label={cgpa}
                sublabel="out of 10"
              />
              <div style={{ marginTop: "0.875rem", fontSize: "0.73rem", color: "#475569", textAlign: "center" }}>
                Out of 10.0
              </div>
            </div>
          </div>
        </div>

      ) : (

        /* ── FACTOR BREAKDOWN TAB ──────────────────────────────────────── */
        <div style={{
          background: "#0f172a", borderRadius: "16px", padding: "1.5rem",
          border: "1px solid #1e293b",
        }}>
          <div style={{
            display: "flex", alignItems: "baseline", gap: "0.75rem",
            marginBottom: "1.5rem",
          }}>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#f1f5f9" }}>
              Risk Factor Breakdown
            </h3>
            <span style={{ fontSize: "0.72rem", color: "#334155" }}>
              Sorted by contribution — highest driver first
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {RISK.factors.map((factor, i) => {
              const meta = FACTOR_META[factor.name] ?? { label: factor.name, icon: "⚙️" };
              const sharePct = ((factor.contribution / RISK.totalScore) * 100).toFixed(0);
              const isTop = i === 0;
              const barColor =
                factor.contribution >= 0.07 ? "#ef4444"
                : factor.contribution >= 0.04 ? "#f59e0b"
                : "#22c55e";

              return (
                <div key={factor.name} style={{
                  padding: "1.1rem 1.25rem",
                  background: isTop ? "rgba(249,115,22,0.05)" : "#090e1a",
                  borderRadius: "12px",
                  border: `1px solid ${isTop ? "rgba(249,115,22,0.18)" : "#1e293b"}`,
                }}>
                  {/* Row header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{meta.icon}</span>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#f1f5f9" }}>
                          {meta.label}
                        </span>
                        {isTop && (
                          <span style={{
                            fontSize: "0.62rem", fontWeight: 700, color: "#f97316",
                            background: "rgba(249,115,22,0.12)", padding: "0.1rem 0.45rem",
                            borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.05em",
                          }}>
                            Top Driver
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#475569", marginTop: "0.15rem" }}>
                        Weight: {(factor.weight * 100).toFixed(0)}%&nbsp;&nbsp;·&nbsp;&nbsp;
                        Raw value: {(factor.value * 100).toFixed(1)}%
                      </div>
                    </div>

                    {/* Contribution */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "1.05rem", fontWeight: 700, color: barColor }}>
                        +{(factor.contribution * 100).toFixed(1)}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "#334155" }}>{sharePct}% of total</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 5, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(100, factor.value * 100)}%`,
                      background: barColor,
                      borderRadius: 3,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total score footer */}
          <div style={{
            marginTop: "1.25rem",
            padding: "0.9rem 1.25rem",
            background: "#090e1a",
            borderRadius: "12px",
            border: "1px solid #1e293b",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: "0.72rem", color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Σ Composite Risk Score
              </div>
              <div style={{ fontSize: "0.73rem", color: "#475569", marginTop: "0.2rem" }}>
                SUM(weight × factor value) across all signals
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "1.35rem", fontWeight: 800, color: band.color }}>
                {riskPct}
              </span>
              <span style={{ fontSize: "0.8rem", color: "#475569" }}> / 100</span>
              <div style={{ fontSize: "0.75rem", color: band.color, fontWeight: 600, marginTop: "0.1rem" }}>
                {band.label}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
