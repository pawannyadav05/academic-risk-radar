import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { TermStepDetails, TermDetailsState } from "./TermStepDetails";
import { TermStepUpload } from "./TermStepUpload";
import { TermStepReview } from "./TermStepReview";
import { TERM_CSV_CONFIGS } from "./termSamples";

interface NewTermWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewTermWizard({ isOpen, onClose, onSuccess }: NewTermWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [details, setDetails] = useState<TermDetailsState>({
    academicYear: "2025–2026",
    label: "Spring 2026",
    termId: "20261",
    startDate: "2026-01-05",
    endDate: "2026-05-30",
  });
  const [csvTexts, setCsvTexts] = useState<Record<string, string>>({});
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDetailChange = (field: keyof TermDetailsState, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSet = (key: string, name: string, content: string) => {
    setCsvTexts((prev) => ({ ...prev, [key]: content }));
    setFileNames((prev) => ({ ...prev, [key]: name }));
  };

  const handlePopulateSamples = () => {
    const texts: Record<string, string> = {};
    const names: Record<string, string> = {};
    TERM_CSV_CONFIGS.forEach((cfg) => {
      texts[cfg.key] = cfg.sampleContent;
      names[cfg.key] = `${cfg.key}-sample.csv`;
    });
    setCsvTexts(texts);
    setFileNames(names);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        termId: Number(details.termId),
        ...csvTexts,
      };

      const res = await fetch("/api/v1/admin/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess();
      } else {
        setErrorMsg(data.error || "Failed to create term.");
      }
    } catch {
      setErrorMsg("Network error occurred while creating term.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "var(--overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Wizard Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
              Add new academic term
            </h3>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              Step {step} of 3: {step === 1 ? "Term details" : step === 2 ? "Upload data" : "Review & create"}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "0.25rem",
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Wizard Step Progress Tracker */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface-2)",
          }}
        >
          {[
            { num: 1, label: "Term details" },
            { num: 2, label: "Upload data" },
            { num: 3, label: "Review & create" },
          ].map((s) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div
                key={s.num}
                style={{
                  flex: 1,
                  padding: "0.65rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.8125rem",
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? "var(--accent)" : isCompleted ? "var(--steady)" : "var(--text-muted)",
                  borderBottom: isCurrent ? "2px solid var(--accent)" : "none",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    background: isCurrent ? "var(--accent)" : isCompleted ? "var(--steady)" : "var(--border)",
                    color: isCurrent || isCompleted ? "var(--primary-contrast)" : "var(--text-muted)",
                  }}
                >
                  {isCompleted ? <Check size={12} strokeWidth={3} /> : s.num}
                </div>
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Wizard Body */}
        <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
          {errorMsg && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                background: "var(--danger-subtle)",
                border: "1px solid var(--danger)",
                color: "var(--danger)",
                fontSize: "0.8125rem",
              }}
            >
              {errorMsg}
            </div>
          )}

          {step === 1 && (
            <TermStepDetails
              details={details}
              onChange={handleDetailChange}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <TermStepUpload
              csvTexts={csvTexts}
              fileNames={fileNames}
              onFileSet={handleFileSet}
              onPopulateSamples={handlePopulateSamples}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <TermStepReview
              details={details}
              csvTexts={csvTexts}
              isSubmitting={isSubmitting}
              onBack={() => setStep(2)}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
