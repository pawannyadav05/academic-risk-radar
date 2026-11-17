import React, { useState, useMemo } from "react";
import { Download, RefreshCw, CheckCircle2, AlertTriangle, FileText, Upload } from "lucide-react";
import { CsvFileDropzone } from "@/app/(instructor)/sections/components/CsvFileDropzone";
import { ConnectorPreviewTable } from "./ConnectorPreviewTable";
import { CONNECTOR_SAMPLES, validateCsvPreview } from "./connectorSamples";

interface SyncResult {
  status: string;
  insertedCount?: number;
  quarantinedCount?: number;
  duplicateCount?: number;
  jobId?: string;
  mode?: string;
  message?: string;
}

interface ConnectorIngestionCardProps {
  onSync: (source: string, csv: string) => Promise<SyncResult | null>;
  isSyncing: boolean;
  onRequestConfirm: (source: string, csv: string, invalidCount: number) => void;
  syncResult: SyncResult | null;
}

const SOURCES = [
  { id: "attendance", label: "Attendance" },
  { id: "assessment", label: "Assessments" },
  { id: "assignment", label: "Assignments" },
  { id: "lms", label: "LMS activity" },
];

export function ConnectorIngestionCard({
  onSync,
  isSyncing,
  onRequestConfirm,
  syncResult,
}: ConnectorIngestionCardProps) {
  const [source, setSource] = useState<string>("attendance");
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [csvContent, setCsvContent] = useState<string>(CONNECTOR_SAMPLES.attendance);
  const [fileName, setFileName] = useState<string>("");

  const handleSourceChange = (s: string) => {
    setSource(s);
    setCsvContent(CONNECTOR_SAMPLES[s] || "");
    setFileName("");
  };

  const handleFileDrop = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setCsvContent(String(e.target?.result || ""));
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const sample = CONNECTOR_SAMPLES[source] || "";
    const blob = new Blob([sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${source}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const validation = useMemo(() => validateCsvPreview(source, csvContent), [source, csvContent]);

  const handleTriggerSync = () => {
    if (!csvContent.trim()) return;
    if (validation.invalidCount > 0 || validation.headerError) {
      onRequestConfirm(source, csvContent, validation.invalidCount);
    } else {
      onSync(source, csvContent);
    }
  };

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "1.5rem",
        marginBottom: "2rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
            Trigger connector ingestion
          </h2>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Upload bulk files or paste CSV rows into the automated normalisation queue.
          </p>
        </div>

        {/* Source Segmented Control */}
        <div style={{ display: "flex", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "2px" }}>
          {SOURCES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSourceChange(s.id)}
              style={{
                background: source === s.id ? "var(--surface)" : "transparent",
                color: source === s.id ? "var(--text)" : "var(--text-muted)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                padding: "0.35rem 0.75rem",
                fontSize: "0.8125rem",
                fontWeight: source === s.id ? 600 : 500,
                cursor: "pointer",
                boxShadow: source === s.id ? "var(--shadow-sm)" : "none",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Mode Selector & Template Links */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setMode("upload")}
            style={{
              background: mode === "upload" ? "var(--surface-2)" : "transparent",
              border: `1px solid ${mode === "upload" ? "var(--primary)" : "var(--border)"}`,
              borderRadius: "var(--radius-sm)",
              padding: "0.3rem 0.65rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: mode === "upload" ? "var(--text)" : "var(--text-muted)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <Upload size={12} />
            <span>Upload file</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("paste")}
            style={{
              background: mode === "paste" ? "var(--surface-2)" : "transparent",
              border: `1px solid ${mode === "paste" ? "var(--primary)" : "var(--border)"}`,
              borderRadius: "var(--radius-sm)",
              padding: "0.3rem 0.65rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: mode === "paste" ? "var(--text)" : "var(--text-muted)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <FileText size={12} />
            <span>Paste CSV</span>
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", fontSize: "0.75rem" }}>
          <button
            type="button"
            onClick={() => setCsvContent(CONNECTOR_SAMPLES[source] || "")}
            style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", padding: 0, fontWeight: 500 }}
          >
            Load sample CSV
          </button>
          <span style={{ color: "var(--border)" }}>•</span>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", padding: 0, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
          >
            <Download size={12} />
            <span>Download template</span>
          </button>
        </div>
      </div>

      {/* Upload Zone or Textarea */}
      {mode === "upload" ? (
        <div>
          <CsvFileDropzone onFileUpload={handleFileDrop} disabled={isSyncing} />
          {fileName && (
            <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text)", fontWeight: 500 }}>
              Loaded: <span style={{ fontFamily: "ui-monospace, monospace" }}>{fileName}</span> ({validation.totalRows} data rows)
            </div>
          )}
        </div>
      ) : (
        <textarea
          rows={6}
          value={csvContent}
          onChange={(e) => setCsvContent(e.target.value)}
          placeholder="studentId,sectionId,date,status..."
          style={{
            width: "100%",
            background: "var(--surface-2)",
            color: "var(--text)",
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.8125rem",
            padding: "0.75rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            boxSizing: "border-box",
            resize: "vertical",
          }}
        />
      )}

      {/* Header Validation Warning */}
      {validation.headerError && (
        <div style={{ marginTop: "0.75rem", padding: "0.5rem 0.75rem", background: "var(--surface-2)", border: "1px solid var(--danger)", borderRadius: "var(--radius-sm)", color: "var(--danger)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <AlertTriangle size={14} />
          <span>{validation.headerError}</span>
        </div>
      )}

      {/* Row Validation Preview */}
      <ConnectorPreviewTable
        headers={validation.headers}
        rows={validation.previewRows}
        totalRows={validation.totalRows}
        invalidCount={validation.invalidCount}
      />

      {/* Sync Result Summary Panel */}
      {syncResult && (
        <div
          style={{
            marginTop: "1.25rem",
            padding: "0.85rem 1rem",
            borderRadius: "var(--radius-sm)",
            border: `1px solid ${syncResult.status === "error" ? "var(--danger)" : "var(--success)"}`,
            background: "var(--surface-2)",
            color: "var(--text)",
            fontSize: "0.8125rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 600, color: syncResult.status === "error" ? "var(--danger)" : "var(--success)", marginBottom: "0.25rem" }}>
            {syncResult.status === "error" ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
            <span>{syncResult.message || "Sync execution finished"}</span>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.4rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            <span>Processed: <strong style={{ color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{syncResult.insertedCount ?? 0}</strong></span>
            <span>Duplicates skipped: <strong style={{ color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{syncResult.duplicateCount ?? 0}</strong></span>
            <span>Quarantined: <strong style={{ color: (syncResult.quarantinedCount ?? 0) > 0 ? "var(--danger)" : "var(--text)", fontVariantNumeric: "tabular-nums" }}>{syncResult.quarantinedCount ?? 0}</strong></span>
          </div>
        </div>
      )}

      {/* Prominent Action Bar with Clear Margin (Fixes clipping in screenshot) */}
      <div
        style={{
          marginTop: "1.5rem",
          marginBottom: "0.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Idempotent upsert • Invalid rows isolated to quarantine registry
        </span>

        <button
          type="button"
          onClick={handleTriggerSync}
          disabled={isSyncing || !csvContent.trim()}
          style={{
            background: "var(--primary)",
            color: "var(--primary-contrast)",
            border: "1px solid var(--primary)",
            borderRadius: "var(--radius-sm)",
            padding: "0.6rem 1.4rem",
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: isSyncing || !csvContent.trim() ? "not-allowed" : "pointer",
            opacity: isSyncing || !csvContent.trim() ? 0.6 : 1,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : null}
          <span>{isSyncing ? "Syncing..." : `Sync ${source} data`}</span>
        </button>
      </div>
    </div>
  );
}
