import React, { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

interface CsvFileDropzoneProps {
  onFileUpload: (file: File) => void;
  disabled?: boolean;
}

export function CsvFileDropzone({ onFileUpload, disabled = false }: CsvFileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith(".csv") || file.type === "text/csv") {
        onFileUpload(file);
      }
    }
  };

  const handleKeyDownZone = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={handleKeyDownZone}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: isDragging ? "2px dashed var(--primary)" : "2px dashed var(--border)",
        background: isDragging ? "var(--surface-2)" : "var(--surface)",
        borderRadius: "var(--radius-sm)",
        padding: "1.75rem 1.25rem",
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s ease",
        outline: "none",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileUpload(f);
        }}
        style={{ display: "none" }}
      />

      <div
        style={{
          display: "inline-flex",
          padding: "0.6rem",
          borderRadius: "50%",
          background: "var(--surface-2)",
          color: "var(--primary)",
          marginBottom: "0.6rem",
        }}
      >
        <UploadCloud size={24} />
      </div>

      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.25rem" }}>
        Drop a CSV here or browse
      </div>
      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>
        Accepted format: .csv · Max size: 2MB
      </p>
    </div>
  );
}
