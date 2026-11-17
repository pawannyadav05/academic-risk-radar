import React from "react";
import { AlertCircle } from "lucide-react";

interface RectifyControlProps {
  isRectify: boolean;
  onRectifyChange: (rectify: boolean) => void;
  importSource: "attendance" | "assessment";
  selectedSubject: string;
  disabled?: boolean;
}

export function RectifyControl({
  isRectify,
  onRectifyChange,
  importSource,
  selectedSubject,
  disabled = false,
}: RectifyControlProps) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          padding: "0.85rem 1rem",
        }}
      >
        <input
          type="checkbox"
          id="rectify-checkbox"
          checked={isRectify}
          onChange={(e) => onRectifyChange(e.target.checked)}
          disabled={disabled}
          style={{
            width: "18px",
            height: "18px",
            cursor: "pointer",
            marginTop: "2px",
            accentColor: "var(--primary)",
          }}
        />
        <div style={{ flex: 1 }}>
          <label
            htmlFor="rectify-checkbox"
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            Rectify previous submission
          </label>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
            Use this to correct a submission you already sent.
          </p>
        </div>
      </div>

      {isRectify && (
        <div
          role="status"
          style={{
            marginTop: "0.75rem",
            background: "var(--surface-2)",
            border: "1px solid var(--warning)",
            borderRadius: "var(--radius-sm)",
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.6rem",
            fontSize: "0.8125rem",
            color: "var(--text)",
          }}
        >
          <div style={{ color: "var(--warning)", flexShrink: 0, marginTop: "1px" }}>
            <AlertCircle size={16} />
          </div>
          <div>
            <strong>Rectification enabled:</strong> Uploading will overwrite earlier {importSource} records for {selectedSubject} in this section and recalculate risk scores.
          </div>
        </div>
      )}
    </>
  );
}
