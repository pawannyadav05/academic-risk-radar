import React from "react";
import { UploadCloud, RefreshCw } from "lucide-react";

interface Props {
  importSource: "attendance" | "assessment";
  onSourceChange: (source: "attendance" | "assessment") => void;
  csvContent: string;
  onCsvContentChange: (val: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  uploading: boolean;
  isRectify: boolean;
  selectedSubject: string;
}

export function AcademicDataUploadForm({
  importSource,
  onSourceChange,
  csvContent,
  onCsvContentChange,
  onFileUpload,
  onSubmit,
  uploading,
  isRectify,
  selectedSubject,
}: Props) {
  const btnStyle = (active: boolean): React.CSSProperties => ({
    background: active ? "var(--surface)" : "transparent",
    color: active ? "var(--text)" : "var(--text-muted)",
    border: active ? "1px solid var(--border)" : "1px solid transparent",
    borderRadius: "var(--radius-sm)",
    padding: "0.35rem 0.85rem",
    fontSize: "0.8125rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s ease, color 0.15s ease",
  });

  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)" }}>Data source</span>
          <div style={{ display: "inline-flex", background: "var(--surface-2)", padding: "0.2rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
            <button type="button" onClick={() => onSourceChange("attendance")} style={btnStyle(importSource === "attendance")}>
              Attendance
            </button>
            <button type="button" onClick={() => onSourceChange("assessment")} style={btnStyle(importSource === "assessment")}>
              Assessment
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Upload file</span>
          <input type="file" accept=".csv" onChange={onFileUpload} style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }} />
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="csv-content-input" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.35rem" }}>
          CSV content for {selectedSubject || "selected subject"}
        </label>
        <textarea
          id="csv-content-input"
          rows={4}
          value={csvContent}
          onChange={(e) => onCsvContentChange(e.target.value)}
          placeholder="Paste comma-separated student records here..."
          style={{ width: "100%", fontFamily: "ui-monospace, monospace", fontSize: "0.8125rem", padding: "0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface-2)", color: "var(--text)", boxSizing: "border-box" }}
        />
        <p style={{ margin: "0.35rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>
          {isRectify
            ? "Rectify mode: Uploaded records will update previous student records for this subject and recalculate risk."
            : "New submission: Records will be verified for student enrollment and instructor mapping before saving."}
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="submit"
          disabled={uploading}
          style={{
            background: isRectify ? "var(--danger)" : "var(--primary)",
            color: "var(--primary-contrast)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            padding: "0.6rem 1.4rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: uploading ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "background 0.15s ease",
          }}
        >
          {uploading ? (
            <><RefreshCw size={16} /> Validating and saving...</>
          ) : isRectify ? (
            <><UploadCloud size={16} /> Rectify and recalculate risk</>
          ) : (
            <><UploadCloud size={16} /> Submit and calculate risk</>
          )}
        </button>
      </div>
    </form>
  );
}
