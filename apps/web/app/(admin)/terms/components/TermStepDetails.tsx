import React from "react";

export interface TermDetailsState {
  academicYear: string;
  label: string;
  termId: string;
  startDate: string;
  endDate: string;
}

interface TermStepDetailsProps {
  details: TermDetailsState;
  onChange: (field: keyof TermDetailsState, value: string) => void;
  onNext: () => void;
}

export function TermStepDetails({ details, onChange, onNext }: TermStepDetailsProps) {
  const isValid =
    details.termId.trim() !== "" &&
    Number(details.termId) > 0 &&
    details.label.trim() !== "" &&
    details.academicYear.trim() !== "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label style={LABEL_STYLE}>
            Academic year <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 2025–2026"
            value={details.academicYear}
            onChange={(e) => onChange("academicYear", e.target.value)}
            style={INPUT_STYLE}
          />
        </div>

        <div>
          <label style={LABEL_STYLE}>
            Term label <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Spring 2026"
            value={details.label}
            onChange={(e) => onChange("label", e.target.value)}
            style={INPUT_STYLE}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
        <div>
          <label style={LABEL_STYLE}>
            Term ID <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            type="number"
            min={1}
            step={1}
            required
            placeholder="e.g. 20261"
            value={details.termId}
            onChange={(e) => onChange("termId", e.target.value)}
            style={INPUT_STYLE}
          />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
            Positive integer identifier
          </span>
        </div>

        <div>
          <label style={LABEL_STYLE}>Start date</label>
          <input
            type="date"
            value={details.startDate}
            onChange={(e) => onChange("startDate", e.target.value)}
            style={INPUT_STYLE}
          />
        </div>

        <div>
          <label style={LABEL_STYLE}>End date</label>
          <input
            type="date"
            value={details.endDate}
            onChange={(e) => onChange("endDate", e.target.value)}
            style={INPUT_STYLE}
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
        <button
          type="button"
          disabled={!isValid}
          onClick={onNext}
          style={{
            padding: "0.55rem 1.25rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--accent)",
            background: isValid ? "var(--accent)" : "var(--surface-2)",
            color: isValid ? "var(--accent-contrast)" : "var(--text-muted)",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: isValid ? "pointer" : "not-allowed",
          }}
        >
          Next: Upload data
        </button>
      </div>
    </div>
  );
}

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "var(--text)",
  marginBottom: "0.35rem",
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)",
  fontSize: "0.875rem",
  color: "var(--text)",
  background: "var(--surface)",
  outline: "none",
  fontFamily: "inherit",
};
