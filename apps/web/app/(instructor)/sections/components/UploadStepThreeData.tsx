import React, { useState } from "react";
import { FileText, Download } from "lucide-react";
import { CsvFileDropzone } from "./CsvFileDropzone";

interface UploadStepThreeDataProps {
  csvContent: string;
  onCsvContentChange: (content: string) => void;
  onFileUpload: (file: File) => void;
  onDownloadTemplate: () => void;
  importSource: "attendance" | "assessment";
  selectedSubject: string;
  disabled?: boolean;
}

export function UploadStepThreeData({
  csvContent,
  onCsvContentChange,
  onFileUpload,
  onDownloadTemplate,
  selectedSubject,
  disabled = false,
}: UploadStepThreeDataProps) {
  const [showPasteBox, setShowPasteBox] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
            3
          </span>
          <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, color: "var(--text)" }}>
            Add data
          </h3>
        </div>

        <button
          type="button"
          onClick={onDownloadTemplate}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--accent)",
            fontSize: "0.8125rem",
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            textDecoration: "underline",
          }}
        >
          <Download size={13} />
          Download sample CSV template
        </button>
      </div>

      <CsvFileDropzone onFileUpload={onFileUpload} disabled={disabled} />

      {/* Toggle to paste CSV manually */}
      <div style={{ marginTop: "0.75rem" }}>
        <button
          type="button"
          onClick={() => setShowPasteBox((prev) => !prev)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "0.8125rem",
            cursor: "pointer",
            padding: "0.25rem 0",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          <FileText size={14} />
          <span>{showPasteBox ? "Hide raw CSV box" : "or paste CSV"}</span>
        </button>

        {showPasteBox && (
          <div style={{ marginTop: "0.5rem" }}>
            <label
              htmlFor="csv-textarea-input"
              style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem" }}
            >
              CSV content for {selectedSubject}
            </label>
            <textarea
              id="csv-textarea-input"
              rows={5}
              value={csvContent}
              onChange={(e) => onCsvContentChange(e.target.value)}
              placeholder="Paste comma-separated student records here..."
              style={{
                width: "100%",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.8125rem",
                padding: "0.65rem 0.75rem",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
