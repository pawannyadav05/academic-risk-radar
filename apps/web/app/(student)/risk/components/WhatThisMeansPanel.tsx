import React from "react";
import { RiskBand } from "@academic-risk-radar/shared-types";
import { Lightbulb, ArrowUpRight } from "lucide-react";

interface WhatThisMeansPanelProps {
  band: RiskBand;
  attendancePct: number;
  assessmentAvgPct: number;
  weakSubjects?: Array<{ courseId: string; percentage: number }>;
}

export function WhatThisMeansPanel({
  band,
  attendancePct,
  assessmentAvgPct,
  weakSubjects = [],
}: WhatThisMeansPanelProps) {
  // Generate supportive 2-3 sentence summary
  let meaningText = "";
  if (band === "low") {
    meaningText =
      "Your academic standing is strong across attendance and course evaluations. You are consistently meeting all institutional requirements. Continuing these habits will maintain your solid standing through finals.";
  } else if (band === "moderate") {
    meaningText =
      "Your current standing indicates a minor deviation in one or two areas, typically attendance or recent assessments. Addressing these early keeps your progress on track and prevents compounding deficits. A brief check-in with your assigned mentor is recommended.";
  } else if (band === "high") {
    meaningText =
      "Your course standing shows multiple areas requiring structured attention before mid-term evaluations. Reaching out to faculty and utilizing mentoring resources will help you regain steady momentum. Your department is here to support you.";
  } else {
    meaningText =
      "Your academic metrics indicate urgent attention is needed across course attendance and assessments. Immediate collaboration with your mentor and course instructors is essential to build a recovery plan.";
  }

  // Derive suggested next steps
  const nextSteps: string[] = [];
  if (weakSubjects.length > 0) {
    const names = weakSubjects.map((s) => `${s.courseId} (${s.percentage}%)`).join(", ");
    nextSteps.push(`Focus on attending all upcoming sessions in ${names} to reach the 75% target.`);
  } else if (attendancePct < 75) {
    nextSteps.push(`Bring your overall attendance up by ${75 - attendancePct} percentage points to reach the 75% department requirement.`);
  }

  if (assessmentAvgPct < 65) {
    nextSteps.push("Review recent quizzes and problem sets with your course instructor during designated office hours.");
  } else {
    nextSteps.push("Maintain your current assignment preparation rhythm and complete upcoming deliverables on time.");
  }

  nextSteps.push("Connect with your faculty mentor during weekly check-in hours to review your academic roadmap.");

  return (
    <div
      aria-label="What this means section"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem 1.5rem",
        marginBottom: "1.25rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.625rem" }}>
        <div
          style={{
            background: "var(--surface-2)",
            color: "var(--primary)",
            padding: "0.35rem",
            borderRadius: "var(--radius-sm)",
            display: "inline-flex",
          }}
        >
          <Lightbulb size={16} strokeWidth={2} />
        </div>
        <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, color: "var(--text)" }}>
          What this means &amp; how to improve
        </h3>
      </div>

      <p style={{ margin: "0 0 1rem", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
        {meaningText}
      </p>

      <div>
        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.5rem" }}>
          Suggested next steps:
        </div>
        <ul aria-label="Suggested next steps list" style={{ margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {nextSteps.map((step, idx) => (
            <li key={idx} style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.45 }}>
              {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
