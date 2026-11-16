"use client";

import React, { useState } from "react";
import { CSV_FIELDS, CsvFieldItem } from "./CsvFieldItem";

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}

export function NewTermForm({ onCancel, onSuccess }: Props) {
  const [termId, setTermId] = useState("");
  const [csvTexts, setCsvTexts] = useState<Record<string, string>>({});
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  function handleFile(key: string, file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setCsvTexts((prev) => ({ ...prev, [key]: (e.target?.result as string) ?? "" }));
      setFileNames((prev) => ({ ...prev, [key]: file.name }));
    };
    reader.readAsText(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const tid = Number(termId);
    if (!Number.isInteger(tid) || tid <= 0) {
      setFeedback({ type: "error", message: "Term ID must be a positive whole number." });
      return;
    }
    for (const f of CSV_FIELDS) {
      if (!csvTexts[f.key]) {
        setFeedback({ type: "error", message: `Upload a file for "${f.label}" before continuing.` });
        return;
      }
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/admin/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ termId: tid, ...csvTexts }),
      });
      const data = await res.json();
      if (res.ok) onSuccess();
      else setFeedback({ type: "error", message: data.error ?? "Term creation failed." });
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Network error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ border: "1px solid #D9DFDD", borderRadius: "8px", padding: "1.5rem", background: "#FFFFFF", marginBottom: "1.5rem" }}>
      <h2 style={{ margin: "0 0 1.25rem", fontSize: "1.0625rem", fontWeight: 700, color: "#1B2A33" }}>New academic term</h2>
      {feedback && (
        <div style={{ padding: "0.65rem 0.9rem", borderRadius: "4px", marginBottom: "1.1rem", fontSize: "0.8125rem", background: feedback.type === "error" ? "#FBF0F4" : "#E8F5F1", color: feedback.type === "error" ? "#8A4A7B" : "#2E8B7A", border: `1px solid ${feedback.type === "error" ? "#8A4A7B" : "#2E8B7A"}` }}>
          {feedback.message}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#1B2A33", lineHeight: 1.6 }}>
            Term ID
            <input type="number" min={1} step={1} required value={termId} onChange={(e) => setTermId(e.target.value)} placeholder="e.g. 20241" style={{ display: "block", marginTop: "0.4rem", width: "200px", padding: "0.5rem 0.75rem", borderRadius: "4px", border: "1px solid #D9DFDD", fontSize: "0.875rem", color: "#1B2A33", background: "#FFFFFF", outline: "none" }} />
          </label>
        </div>
        {CSV_FIELDS.map((f) => (
          <CsvFieldItem key={f.key} field={f} fileName={fileNames[f.key]} onFile={(file) => handleFile(f.key, file)} />
        ))}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
          <button type="submit" disabled={submitting} style={{ padding: "0.6rem 1.25rem", borderRadius: "4px", border: "1px solid #2D5BA3", background: submitting ? "#D9DFDD" : "#2D5BA3", color: "#FFFFFF", fontSize: "0.875rem", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}>
            {submitting ? "Creating term…" : "Create term"}
          </button>
          <button type="button" onClick={onCancel} disabled={submitting} style={{ padding: "0.6rem 1.1rem", borderRadius: "4px", border: "1px solid #D9DFDD", background: "transparent", color: "#5B6B75", fontSize: "0.875rem", cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
