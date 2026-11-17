import React from "react";
import { UploadCloud, CheckCircle2, Download, RefreshCw } from "lucide-react";
import { TERM_CSV_CONFIGS, countCsvRows } from "./termSamples";

interface TermStepUploadProps {
  csvTexts: Record<string, string>;
  fileNames: Record<string, string>;
  onFileSet: (key: string, name: string, content: string) => void;
  onPopulateSamples: () => void;
  onBack: () => void;
  onNext: () => void;
}

export function TermStepUpload({
  csvTexts,
  fileNames,
  onFileSet,
  onPopulateSamples,
  onBack,
  onNext,
}: TermStepUploadProps) {
  const handleFileChange = (key: string, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = String(e.target?.result || "");
      onFileSet(key, file.name, content);
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = (key: string, label: string) => {
    const config = TERM_CSV_CONFIGS.find((c) => c.key === key);
    if (!config) return;
    const blob = new Blob([config.sampleContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${key}-sample.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allUploaded = TERM_CSV_CONFIGS.every((cfg) => Boolean(csvTexts[cfg.key]?.trim()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
          background: "var(--surface-2)",
          padding: "0.6rem 0.85rem",
          borderRadius: "var(--radius-sm)",
          fontSize: "0.8125rem",
          color: "var(--text-muted)",
        }}
      >
        <span>Upload all 6 required institutional rosters to initialize the academic term.</span>
        <button
          type="button"
          onClick={onPopulateSamples}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--accent)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <RefreshCw size={12} />
          Fill sample templates
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "0.75rem",
          maxHeight: "380px",
          overflowY: "auto",
          paddingRight: "0.25rem",
        }}
      >
        {TERM_CSV_CONFIGS.map((cfg) => {
          const content = csvTexts[cfg.key] || "";
          const fileName = fileNames[cfg.key] || "";
          const rowCount = countCsvRows(content);
          const isUploaded = Boolean(content.trim());

          return (
            <div
              key={cfg.key}
              style={{
                border: isUploaded ? "1px solid var(--border)" : "1px dashed var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "0.75rem",
                background: "var(--surface)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "0.5rem",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)" }}>
                    {cfg.label}
                  </span>
                  {isUploaded && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.2rem",
                        fontSize: "0.75rem",
                        color: "var(--steady)",
                        fontWeight: 600,
                      }}
                    >
                      <CheckCircle2 size={13} />
                      {rowCount} rows
                    </span>
                  )}
                </div>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                  {cfg.columnsHint}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.3rem 0.6rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--text)",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  <UploadCloud size={13} />
                  {isUploaded ? "Replace file" : "Choose CSV"}
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(cfg.key, e.target.files?.[0] ?? null)}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => handleDownloadSample(cfg.key, cfg.label)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: "0.6875rem",
                    cursor: "pointer",
                  }}
                >
                  <Download size={11} />
                  Sample
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            padding: "0.55rem 1.1rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text-muted)",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Back
        </button>

        <button
          type="button"
          disabled={!allUploaded}
          onClick={onNext}
          style={{
            padding: "0.55rem 1.25rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--accent)",
            background: allUploaded ? "var(--accent)" : "var(--surface-2)",
            color: allUploaded ? "var(--accent-contrast)" : "var(--text-muted)",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: allUploaded ? "pointer" : "not-allowed",
          }}
        >
          Next: Review & create
        </button>
      </div>
    </div>
  );
}
