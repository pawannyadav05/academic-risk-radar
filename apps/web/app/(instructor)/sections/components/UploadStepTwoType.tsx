import React from "react";
import { RectifyControl } from "./RectifyControl";

interface UploadStepTwoTypeProps {
  importSource: "attendance" | "assessment";
  onSourceChange: (source: "attendance" | "assessment") => void;
  isRectify: boolean;
  onRectifyChange: (rectify: boolean) => void;
  selectedSubject: string;
  disabled?: boolean;
}

export function UploadStepTwoType({
  importSource,
  onSourceChange,
  isRectify,
  onRectifyChange,
  selectedSubject,
  disabled = false,
}: UploadStepTwoTypeProps) {
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
          2
        </span>
        <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, color: "var(--text)" }}>
          Choose data type
        </h3>
      </div>

      {/* Segmented Control */}
      <div
        role="radiogroup"
        aria-label="Academic data type"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <button
          type="button"
          role="radio"
          aria-checked={importSource === "attendance"}
          disabled={disabled}
          onClick={() => onSourceChange("attendance")}
          style={{
            background: importSource === "attendance" ? "var(--surface-2)" : "transparent",
            border: importSource === "attendance" ? "2px solid var(--primary)" : "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "0.75rem 1rem",
            textAlign: "left",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.2rem" }}>
            Attendance
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.35 }}>
            Percentage per student for this subject.
          </div>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={importSource === "assessment"}
          disabled={disabled}
          onClick={() => onSourceChange("assessment")}
          style={{
            background: importSource === "assessment" ? "var(--surface-2)" : "transparent",
            border: importSource === "assessment" ? "2px solid var(--primary)" : "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "0.75rem 1rem",
            textAlign: "left",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.2rem" }}>
            Assessment
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.35 }}>
            Quiz, midterm, or lab test scores out of maximum marks.
          </div>
        </button>
      </div>

      <RectifyControl
        isRectify={isRectify}
        onRectifyChange={onRectifyChange}
        importSource={importSource}
        selectedSubject={selectedSubject}
        disabled={disabled}
      />
    </div>
  );
}
