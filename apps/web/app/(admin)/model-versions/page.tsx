"use client";

import React, { useState, useEffect } from "react";
import { RiskModelVersion } from "@academic-risk-radar/shared-types";
import { ActiveVersionCard } from "./components/ActiveVersionCard";
import { VersionHistoryTable } from "./components/VersionHistoryTable";
import { ModelVersionForm } from "./components/ModelVersionForm";
import { ImpactPreviewPanel } from "./components/ImpactPreviewPanel";

const API_BASE = "/api/v1";

export default function ModelVersionsPage() {
  const [versions, setVersions] = useState<RiskModelVersion[]>([]);
  const [activeVersion, setActiveVersion] = useState<RiskModelVersion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);

  const [versionTag, setVersionTag] = useState<string>("v1.1.0");
  const [weights, setWeights] = useState<Record<string, number>>({
    attendance_deficit: 0.35,
    assessment_deficit: 0.25,
    missing_assignments: 0.15,
    lms_engagement_deficit: 0.15,
    trend_deterioration: 0.10,
  });
  const [thresholds, setThresholds] = useState<Record<string, number>>({
    low: 0.25,
    moderate: 0.50,
    high: 0.75,
    critical: 1.00,
  });

  const weightSum = Object.values(weights).reduce((a, b) => a + b, 0);

  const loadVersions = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/model-versions`, { credentials: "include" });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setVersions(data);
        setActiveVersion(data[0]);
        if (data[0].weights) setWeights({ ...data[0].weights });
        if (data[0].thresholds) setThresholds({ ...data[0].thresholds });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: `Failed to load model versions: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, []);

  const handlePreview = async () => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API_BASE}/admin/model-versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ version: versionTag, weights, thresholds, commit: false }),
      });
      const data = await res.json();
      if (res.ok && data.preview) {
        setPreviewData(data.preview);
      } else {
        setFeedback({ type: "error", message: data.error || "Simulation preview failed" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: `Network error: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API_BASE}/admin/model-versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ version: versionTag, weights, thresholds, commit: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: `Version ${versionTag} published and logged to audit trail.` });
        loadVersions();
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to publish version" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: `Network error: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async (versionToActivate: string) => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API_BASE}/admin/model-versions/${encodeURIComponent(versionToActivate)}/activate`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: `Model version ${versionToActivate} activated.` });
        loadVersions();
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to activate version" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: `Network error: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ color: "#5B6B75", fontSize: "0.875rem", padding: "1.5rem 0" }}>Loading model configurations...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: "0 0 0.35rem", fontSize: "1.5rem", fontWeight: 700, color: "#1B2A33" }}>
          Risk model configuration
        </h1>
        <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.875rem", maxWidth: "600px" }}>
          Calibrate explainable scoring weights, simulate risk band shifts against student records, and activate versions with audit tracking.
        </p>
      </div>

      {feedback && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "4px", marginBottom: "1.25rem", fontSize: "0.8125rem", background: feedback.type === "success" ? "#E8F5F1" : "#FBF0F4", color: feedback.type === "success" ? "#2E8B7A" : "#8A4A7B", border: `1px solid ${feedback.type === "success" ? "#2E8B7A" : "#8A4A7B"}` }}>
          {feedback.message}
        </div>
      )}

      {activeVersion && <ActiveVersionCard version={activeVersion} />}

      <ModelVersionForm
        versionTag={versionTag}
        setVersionTag={setVersionTag}
        weights={weights}
        handleWeightChange={(k, v) => setWeights((prev) => ({ ...prev, [k]: v }))}
        thresholds={thresholds}
        handleThresholdChange={(k, v) => setThresholds((prev) => ({ ...prev, [k]: v }))}
        weightSum={weightSum}
        onPreview={handlePreview}
        onPublish={handlePublish}
        isSubmitting={isSubmitting}
      />

      <ImpactPreviewPanel preview={previewData} />

      <VersionHistoryTable
        versions={versions}
        activeVersion={activeVersion?.version || ""}
        onActivate={handleActivate}
        isActivating={isSubmitting}
      />
    </div>
  );
}
