import React from "react";
import { RiskModelVersion } from "@academic-risk-radar/shared-types";
import { X } from "lucide-react";
import { RiskBandSegmentedBar } from "./RiskBandSegmentedBar";

interface VersionDetailModalProps {
  version: RiskModelVersion | null;
  onClose: () => void;
}

export function VersionDetailModal({ version, onClose }: VersionDetailModalProps) {
  if (!version) return null;

  const weights = (version.weights as Record<string, number>) || {};
  const thresholds = (version.thresholds as Record<string, number>) || {};

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="version-modal-title"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "var(--overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 150,
        padding: "1rem",
        animation: "fadeIn 0.12s ease",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          maxWidth: "520px",
          width: "100%",
          padding: "1.5rem",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h2 id="version-modal-title" style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
              Model configuration: {version.version}
            </h2>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              Effective: {new Date(version.effectiveFrom).toLocaleDateString()} · By: {version.createdBy || "System"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close configuration details"
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "0.2rem" }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-muted)" }}>
            Factor weights
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {Object.entries(weights).map(([k, w]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", borderBottom: "1px solid var(--surface-2)", paddingBottom: "0.25rem" }}>
                <span style={{ color: "var(--text)" }}>{k.replace(/_/g, " ")}</span>
                <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--primary)" }}>
                  {Math.round(w * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-muted)" }}>
            Risk band cutoffs
          </h3>
          <RiskBandSegmentedBar thresholds={thresholds} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "0.45rem 1rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
