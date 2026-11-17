import React from "react";
import { WeightSliderList } from "./WeightSliderList";
import { ThresholdsInputList } from "./ThresholdsInputList";

interface ModelVersionFormProps {
  versionTag: string;
  setVersionTag: (v: string) => void;
  weights: Record<string, number>;
  onWeightChange: (k: string, pct: number) => void;
  thresholds: Record<string, number>;
  onThresholdChange: (k: string, val: number) => void;
  activeWeights: Record<string, number>;
  existingVersions: string[];
  onSimulate: () => void;
  onSaveDraft: () => void;
  onActivate: () => void;
  isSubmitting: boolean;
  isSimulating: boolean;
}

export function ModelVersionForm({
  versionTag,
  setVersionTag,
  weights,
  onWeightChange,
  thresholds,
  onThresholdChange,
  activeWeights,
  existingVersions,
  onSimulate,
  onSaveDraft,
  onActivate,
  isSubmitting,
  isSimulating,
}: ModelVersionFormProps) {
  const sumPct = Object.values(weights).reduce((a, b) => a + Math.round(b * 100), 0);
  const isWeightValid = sumPct === 100;
  const weightDiff = 100 - sumPct;

  const isVersionFormat = /^v\d+\.\d+\.\d+$/.test(versionTag.trim());
  const isVersionUnique = !existingVersions.includes(versionTag.trim());

  const low = thresholds.low ?? 0.0;
  const mod = thresholds.moderate ?? 0.25;
  const high = thresholds.high ?? 0.5;
  const crit = thresholds.critical ?? 0.75;
  const isThresholdsValid = low >= 0 && low < mod && mod < high && high < crit && crit <= 1.0;

  const isValid = isWeightValid && isVersionFormat && isVersionUnique && isThresholdsValid;

  let disabledReason = "";
  if (!isVersionFormat) disabledReason = "Version must match format vX.Y.Z (e.g. v1.2.0)";
  else if (!isVersionUnique) disabledReason = `Version ${versionTag} already exists`;
  else if (!isWeightValid) disabledReason = `Weights must total 100% (currently ${sumPct}%)`;
  else if (!isThresholdsValid) disabledReason = "Thresholds must be strictly increasing";

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "1.25rem", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>Propose new model version</h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Calibrate factor weights (must equal 100%) and cutoff limits.
          </p>
        </div>
        <div>
          <label htmlFor="version-id-input" style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem" }}>
            Version identifier
          </label>
          <input
            id="version-id-input"
            type="text"
            value={versionTag}
            onChange={(e) => setVersionTag(e.target.value)}
            placeholder="v1.2.0"
            style={{
              padding: "0.4rem 0.6rem",
              borderRadius: "var(--radius-sm)",
              border: `1px solid ${!isVersionFormat || !isVersionUnique ? "var(--danger)" : "var(--border)"}`,
              fontSize: "0.8125rem",
              background: "var(--surface)",
              color: "var(--text)",
              width: "120px",
            }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "1.25rem" }}>
        <WeightSliderList
          weights={weights}
          onWeightChange={onWeightChange}
          sumPct={sumPct}
          isWeightValid={isWeightValid}
          weightDiff={weightDiff}
        />
        <ThresholdsInputList
          thresholds={thresholds}
          onThresholdChange={onThresholdChange}
          isThresholdsValid={isThresholdsValid}
          activeWeights={activeWeights}
          weights={weights}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <button
          type="button"
          onClick={onSimulate}
          disabled={!isValid || isSimulating}
          title={!isValid ? disabledReason : "Run simulation preview against student records"}
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "0.45rem 0.95rem",
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "var(--text)",
            cursor: !isValid || isSimulating ? "not-allowed" : "pointer",
            opacity: !isValid || isSimulating ? 0.6 : 1,
          }}
        >
          {isSimulating ? "Simulating..." : "Simulate impact"}
        </button>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={!isValid || isSubmitting}
            title={!isValid ? disabledReason : "Save model version without activating"}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "0.45rem 0.95rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--text)",
              cursor: !isValid || isSubmitting ? "not-allowed" : "pointer",
              opacity: !isValid || isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting ? "Saving..." : "Save draft"}
          </button>
          <button
            type="button"
            onClick={onActivate}
            disabled={!isValid || isSubmitting}
            title={!isValid ? disabledReason : "Save and activate this version as the live scoring model"}
            style={{
              background: "var(--primary)",
              border: "1px solid var(--primary)",
              borderRadius: "var(--radius-sm)",
              padding: "0.45rem 1.1rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--primary-contrast)",
              cursor: !isValid || isSubmitting ? "not-allowed" : "pointer",
              opacity: !isValid || isSubmitting ? 0.6 : 1,
            }}
          >
            Activate version
          </button>
        </div>
      </div>
    </div>
  );
}
