import React, { useState } from "react";
import { UploadCloud, RefreshCw } from "lucide-react";
import { RectifyConfirmModal } from "./RectifyConfirmModal";

interface SubmitActionBarProps {
  importSource: "attendance" | "assessment";
  selectedSubject: string;
  rowCount: number;
  uploading: boolean;
  isRectify: boolean;
  onSubmit: () => void;
}

export function SubmitActionBar({
  importSource,
  selectedSubject,
  rowCount,
  uploading,
  isRectify,
  onSubmit,
}: SubmitActionBarProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const hasData = rowCount > 0;
  const summaryText = `${importSource === "attendance" ? "Attendance" : "Assessment"} for ${selectedSubject} · ${rowCount} ${rowCount === 1 ? "row" : "rows"}`;

  const handleButtonClick = () => {
    if (!hasData || uploading) return;
    if (isRectify) {
      setShowConfirmModal(true);
    } else {
      onSubmit();
    }
  };

  const handleConfirmRectify = () => {
    setShowConfirmModal(false);
    onSubmit();
  };

  return (
    <>
      <div
        className="instructor-submit-bar"
        style={{
          marginTop: "1.5rem",
          padding: "1rem 1.25rem",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          position: "sticky",
          bottom: "1rem",
          zIndex: 10,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>
            {hasData ? summaryText : "No data added yet"}
          </span>
          {!hasData && (
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              (Drop or paste CSV records above to continue)
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleButtonClick}
          disabled={!hasData || uploading}
          title={!hasData ? "Add CSV records to enable submission" : undefined}
          style={{
            background: !hasData ? "var(--surface-2)" : isRectify ? "var(--danger)" : "var(--primary)",
            color: !hasData ? "var(--text-muted)" : "var(--primary-contrast)",
            border: !hasData ? "1px solid var(--border)" : "none",
            borderRadius: "var(--radius-sm)",
            padding: "0.6rem 1.4rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: !hasData || uploading ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.15s ease",
            outline: "none",
          }}
        >
          {uploading ? (
            <>
              <RefreshCw size={15} className="animate-spin" />
              <span>Submitting and recalculating...</span>
            </>
          ) : (
            <>
              <UploadCloud size={16} />
              <span>Submit and recalculate risk</span>
            </>
          )}
        </button>
      </div>

      {showConfirmModal && (
        <RectifyConfirmModal
          importSource={importSource}
          selectedSubject={selectedSubject}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmRectify}
        />
      )}
    </>
  );
}
