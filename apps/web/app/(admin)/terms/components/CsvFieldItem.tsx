import React from "react";

export interface CsvField {
  key: string;
  label: string;
  hint: string;
}

export const CSV_FIELDS: CsvField[] = [
  {
    key: "sectionDetailsCsv",
    label: "Section details",
    hint: "Columns: sectionname, subjectcode1, subjectcode2, ... (e.g. k24p2of,cse101,cse202)",
  },
  {
    key: "facultyCsv",
    label: "Faculty details",
    hint: "Columns: uid, name, department, designation, hod_uid (optional), dean_uid (optional)",
  },
  {
    key: "studentCredsCsv",
    label: "Student credentials",
    hint: "Columns: student_id, password",
  },
  {
    key: "facultyCredsCsv",
    label: "Faculty credentials",
    hint: "Columns: uid, password",
  },
  {
    key: "studentMentorCsv",
    label: "Student–mentor mapping",
    hint: "Columns: student_id, section, mentor_uid",
  },
  {
    key: "instructorSectionCsv",
    label: "Instructor–section mapping",
    hint: "Columns: uid, section, subject_code",
  },
];

interface Props {
  field: CsvField;
  fileName?: string;
  onFile: (file: File | null) => void;
}

export function CsvFieldItem({ field, fileName, onFile }: Props) {
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <label style={LABEL}>
        {field.label}
        <span style={{ fontSize: "0.75rem", color: "#5B6B75", fontWeight: 400 }}>
          {" "}— {field.hint}
        </span>
        <div style={{ marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <label style={BUTTON_LABEL}>
            Choose CSV
            <input
              type="file"
              accept=".csv,text/csv"
              style={{ display: "none" }}
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {fileName && (
            <span style={{ fontSize: "0.8125rem", color: "#2E8B7A" }}>✓ {fileName}</span>
          )}
        </div>
      </label>
    </div>
  );
}

const LABEL: React.CSSProperties = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "#1B2A33",
  lineHeight: 1.6,
};

const BUTTON_LABEL: React.CSSProperties = {
  display: "inline-block",
  padding: "0.45rem 0.85rem",
  borderRadius: "4px",
  border: "1px solid #D9DFDD",
  background: "#F2F4F3",
  fontSize: "0.8125rem",
  color: "#1B2A33",
  cursor: "pointer",
  fontWeight: 500,
};
