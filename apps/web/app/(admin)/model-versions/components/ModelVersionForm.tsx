import React from "react";

interface ModelVersionFormProps {
  versionTag: string;
  setVersionTag: (v: string) => void;
  weights: Record<string, number>;
  handleWeightChange: (k: string, v: number) => void;
  thresholds: Record<string, number>;
  handleThresholdChange: (k: string, v: number) => void;
  weightSum: number;
  onPreview: () => void;
  onPublish: () => void;
  isSubmitting: boolean;
}

export function ModelVersionForm({
  versionTag,
  setVersionTag,
  weights,
  handleWeightChange,
  thresholds,
  handleThresholdChange,
  weightSum,
  onPreview,
  onPublish,
  isSubmitting,
}: ModelVersionFormProps) {
  const isWeightSumValid = Math.abs(weightSum - 1.0) < 0.001;

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "8px", padding: "1.25rem", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#1B2A33" }}>Propose new model version</h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "#5B6B75" }}>
            Adjust weights and risk band thresholds to calibrate early-warning sensitivity.
          </p>
        </div>
        <div>
          <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1B2A33", marginRight: "0.5rem" }}>Version identifier:</label>
          <input
            type="text"
            value={versionTag}
            onChange={(e) => setVersionTag(e.target.value)}
            placeholder="v1.1.0"
            style={{ width: "100px", padding: "0.35rem 0.5rem", borderRadius: "4px", border: "1px solid #D9DFDD", fontSize: "0.8125rem" }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#5B6B75" }}>Factor weights</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: isWeightSumValid ? "#2E8B7A" : "#8A4A7B" }}>
              Total: {(weightSum * 100).toFixed(0)}% {isWeightSumValid ? "(valid)" : "(must equal 100%)"}
            </span>
          </div>
          {Object.entries(weights).map(([k, val]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
              <span style={{ fontSize: "0.8125rem", color: "#1B2A33" }}>{k.replace(/_/g, " ")}</span>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={val}
                onChange={(e) => handleWeightChange(k, parseFloat(e.target.value) || 0)}
                style={{ width: "80px", padding: "0.25rem 0.4rem", borderRadius: "4px", border: "1px solid #D9DFDD", fontSize: "0.8125rem", textAlign: "right" }}
              />
            </div>
          ))}
        </div>

        <div>
          <div style={{ marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#5B6B75" }}>Risk band upper limits</span>
          </div>
          {Object.entries(thresholds).map(([k, val]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
              <span style={{ fontSize: "0.8125rem", color: "#1B2A33", textTransform: "capitalize" }}>{k}</span>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={val}
                onChange={(e) => handleThresholdChange(k, parseFloat(e.target.value) || 0)}
                style={{ width: "80px", padding: "0.25rem 0.4rem", borderRadius: "4px", border: "1px solid #D9DFDD", fontSize: "0.8125rem", textAlign: "right" }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid #F2F4F3", paddingTop: "1rem" }}>
        <button
          type="button"
          onClick={onPreview}
          disabled={isSubmitting || !isWeightSumValid}
          style={{ background: "#FFFFFF", border: "1px solid #2D5BA3", borderRadius: "4px", padding: "0.45rem 1rem", fontSize: "0.8125rem", fontWeight: 600, color: "#2D5BA3", cursor: "pointer" }}
        >
          {isSubmitting ? "Calculating..." : "Preview band impact"}
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={isSubmitting || !isWeightSumValid || !versionTag.trim()}
          style={{ background: "#2D5BA3", border: "1px solid #2D5BA3", borderRadius: "4px", padding: "0.45rem 1.1rem", fontSize: "0.8125rem", fontWeight: 600, color: "#FFFFFF", cursor: "pointer" }}
        >
          {isSubmitting ? "Publishing..." : "Save and publish version"}
        </button>
      </div>
    </div>
  );
}

