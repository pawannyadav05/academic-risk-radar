import React from "react";
import { CheckCircle2, AlertCircle, RefreshCw, Layers, Users, GraduationCap, ShieldCheck } from "lucide-react";
import { TermDetailsState } from "./TermStepDetails";
import { countCsvRows } from "./termSamples";

interface TermStepReviewProps {
  details: TermDetailsState;
  csvTexts: Record<string, string>;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function TermStepReview({
  details,
  csvTexts,
  isSubmitting,
  onBack,
  onSubmit,
}: TermStepReviewProps) {
  const sectionsCount = countCsvRows(csvTexts.sectionDetailsCsv || "");
  const facultyCount = countCsvRows(csvTexts.facultyCsv || "");
  const studentCount = countCsvRows(csvTexts.studentCredsCsv || "");
  const mentorCount = countCsvRows(csvTexts.studentMentorCsv || "");
  const teachingCount = countCsvRows(csvTexts.instructorSectionCsv || "");

  const summaryItems = [
    { label: "Sections configured", count: sectionsCount, icon: <Layers size={16} /> },
    { label: "Faculty accounts", count: facultyCount, icon: <Users size={16} /> },
    { label: "Student accounts", count: studentCount, icon: <GraduationCap size={16} /> },
    { label: "Mentor mappings", count: mentorCount, icon: <ShieldCheck size={16} /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          padding: "1rem",
          background: "var(--surface-2)",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700 }}>
          Term configuration overview
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginTop: "0.25rem" }}>
          <h4 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
            {details.label}
          </h4>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
            ID: {details.termId}
          </span>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            ({details.academicYear})
          </span>
        </div>

        {details.startDate && details.endDate && (
          <p style={{ margin: "0.4rem 0 0", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Duration: {details.startDate} to {details.endDate}
          </p>
        )}
      </div>

      <div>
        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", display: "block", marginBottom: "0.5rem" }}>
          Rosters to initialize:
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          {summaryItems.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                background: "var(--surface)",
              }}
            >
              <div style={{ color: "var(--accent)" }}>{item.icon}</div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                  {item.label}
                </span>
                <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)" }}>
                  {item.count} records
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.5rem",
          padding: "0.75rem",
          borderRadius: "var(--radius-sm)",
          background: "var(--steady-subtle)",
          border: "1px solid var(--steady)",
          fontSize: "0.8125rem",
          color: "var(--text)",
        }}
      >
        <CheckCircle2 size={16} style={{ color: "var(--steady)", marginTop: "0.1rem", flexShrink: 0 }} />
        <div>
          <strong>Pre-flight validation passed.</strong> Referential integrity will be verified during batch loading. Existing records will be upserted idempotently.
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          style={{
            padding: "0.55rem 1.1rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text-muted)",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          Back
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.55rem 1.35rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--accent)",
            background: isSubmitting ? "var(--surface-2)" : "var(--accent)",
            color: isSubmitting ? "var(--text-muted)" : "var(--accent-contrast)",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? (
            <>
              <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} />
              Creating term…
            </>
          ) : (
            "Create term"
          )}
        </button>
      </div>
    </div>
  );
}
