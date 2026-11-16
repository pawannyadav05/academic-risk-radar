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
    background: active ? "#FFFFFF" : "transparent",
    color: active ? "#1B2A33" : "#5B6B75",
    border: active ? "1px solid #D9DFDD" : "1px solid transparent",
    borderRadius: "4px",
    padding: "0.35rem 0.85rem",
    fontSize: "0.8125rem",
    fontWeight: 600,
    cursor: "pointer",
  });

  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1B2A33" }}>Data source</span>
          <div style={{ display: "inline-flex", background: "#F2F4F3", padding: "0.2rem", borderRadius: "4px", border: "1px solid #D9DFDD" }}>
            <button type="button" onClick={() => onSourceChange("attendance")} style={btnStyle(importSource === "attendance")}>
              Attendance
            </button>
            <button type="button" onClick={() => onSourceChange("assessment")} style={btnStyle(importSource === "assessment")}>
              Assessment
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }}>
          <span style={{ fontSize: "0.8125rem", color: "#5B6B75" }}>Upload file</span>
          <input type="file" accept=".csv" onChange={onFileUpload} style={{ fontSize: "0.8125rem", color: "#5B6B75" }} />
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="csv-content-input" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#1B2A33", marginBottom: "0.35rem" }}>
          CSV content for {selectedSubject || "selected subject"}
        </label>
        <textarea
          id="csv-content-input"
          rows={4}
          value={csvContent}
          onChange={(e) => onCsvContentChange(e.target.value)}
          placeholder="Paste comma-separated student records here..."
          style={{ width: "100%", fontFamily: "ui-monospace, monospace", fontSize: "0.8125rem", padding: "0.75rem", border: "1px solid #D9DFDD", borderRadius: "4px", background: "#F2F4F3", color: "#1B2A33", boxSizing: "border-box" }}
        />
        <p style={{ margin: "0.35rem 0 0", fontSize: "0.75rem", color: "#5B6B75" }}>
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
            background: isRectify ? "#8A4A7B" : "#2D5BA3",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "4px",
            padding: "0.6rem 1.4rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: uploading ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {uploading ? (
            <><RefreshCw size={16} /> Validating and saving...</>
          ) : isRectify ? (
            <><UploadCloud size={16} /> Rectify and recalculate risk</>
          ) : (
            <><UploadCloud size={16} /> Submit and recalculate risk</>
          )}
        </button>
      </div>
    </form>
  );
}
