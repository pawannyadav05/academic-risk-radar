import React from "react";

export interface TeachingAssignmentItem {
  subjectCode: string;
  sectionId: string;
}

interface Props {
  assignments: TeachingAssignmentItem[];
  selectedSubject: string;
  selectedSection: string;
  onSubjectChange: (subject: string) => void;
  onSectionChange: (section: string) => void;
  isRectify: boolean;
  onRectifyChange: (rectify: boolean) => void;
  disabled?: boolean;
}

const LBL: React.CSSProperties = { fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)" };
const SEL: React.CSSProperties = { background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "0.4rem 0.75rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", cursor: "pointer", outline: "none" };

export function TeachingDropdowns({
  assignments,
  selectedSubject,
  selectedSection,
  onSubjectChange,
  onSectionChange,
  isRectify,
  onRectifyChange,
  disabled = false,
}: Props) {
  const availableSubjects = Array.from(new Set(assignments.map((a) => a.subjectCode)));
  const availableSections = Array.from(
    new Set(assignments.filter((a) => !selectedSubject || a.subjectCode === selectedSubject).map((a) => a.sectionId))
  );

  function handleSubjectSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextSubject = e.target.value;
    onSubjectChange(nextSubject);
    const sectionsForSubject = assignments.filter((a) => a.subjectCode === nextSubject).map((a) => a.sectionId);
    if (sectionsForSubject.length > 0 && !sectionsForSubject.includes(selectedSection)) {
      onSectionChange(sectionsForSubject[0]);
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <label htmlFor="subject-code-select" style={LBL}>Subject code</label>
        <select id="subject-code-select" value={selectedSubject} onChange={handleSubjectSelect} disabled={disabled || availableSubjects.length === 0} style={SEL}>
          {availableSubjects.map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <label htmlFor="section-select" style={LBL}>Section</label>
        <select id="section-select" value={selectedSection} onChange={(e) => onSectionChange(e.target.value)} disabled={disabled || availableSections.length === 0} style={SEL}>
          {availableSections.map((sec) => (
            <option key={sec} value={sec}>{sec}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginLeft: "auto" }}>
        <input type="checkbox" id="rectify-toggle" checked={isRectify} onChange={(e) => onRectifyChange(e.target.checked)} disabled={disabled} style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--primary)" }} />
        <label htmlFor="rectify-toggle" style={{ ...LBL, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
          <span>Rectify previous submission</span>
          {isRectify && (
            <span style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem", borderRadius: "var(--radius-sm)", background: "var(--surface-2)", color: "var(--danger)", border: "1px solid var(--danger)", fontWeight: 600 }}>
              Overwrites prior records
            </span>
          )}
        </label>
      </div>
    </div>
  );
}
