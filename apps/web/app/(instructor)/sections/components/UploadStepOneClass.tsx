import React from "react";
import { TeachingAssignmentItem } from "./TeachingDropdowns";

interface UploadStepOneClassProps {
  assignments: TeachingAssignmentItem[];
  selectedSubject: string;
  selectedSection: string;
  onSubjectChange: (subject: string) => void;
  onSectionChange: (section: string) => void;
  disabled?: boolean;
}

export function UploadStepOneClass({
  assignments,
  selectedSubject,
  selectedSection,
  onSubjectChange,
  onSectionChange,
  disabled = false,
}: UploadStepOneClassProps) {
  const availableSubjects = Array.from(new Set(assignments.map((a) => a.subjectCode)));
  const availableSections = Array.from(
    new Set(assignments.filter((a) => !selectedSubject || a.subjectCode === selectedSubject).map((a) => a.sectionId))
  );

  const handleSubjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSub = e.target.value;
    onSubjectChange(nextSub);
    const validSections = assignments.filter((a) => a.subjectCode === nextSub).map((a) => a.sectionId);
    if (validSections.length > 0 && !validSections.includes(selectedSection)) {
      onSectionChange(validSections[0]);
    }
  };

  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <span
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            fontSize: "0.75rem",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          1
        </span>
        <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, color: "var(--text)" }}>
          Choose class
        </h3>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        <div>
          <label
            htmlFor="step-subject-select"
            style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.35rem" }}
          >
            Subject code
          </label>
          <select
            id="step-subject-select"
            value={selectedSubject}
            onChange={handleSubjectSelect}
            disabled={disabled || availableSubjects.length === 0}
            style={{ width: "100%", height: "40px" }}
          >
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="step-section-select"
            style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.35rem" }}
          >
            Section
          </label>
          <select
            id="step-section-select"
            value={selectedSection}
            onChange={(e) => onSectionChange(e.target.value)}
            disabled={disabled || availableSections.length === 0}
            style={{ width: "100%", height: "40px" }}
          >
            {availableSections.map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
