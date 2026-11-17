"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RiskModelVersion } from "@academic-risk-radar/shared-types";
import { PageHeader } from "@/app/components/PageHeader";
import { AdminErrorBanner } from "../components/AdminErrorBanner";
import { AdminToast } from "../components/AdminToast";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ActiveVersionCard } from "./components/ActiveVersionCard";
import { ModelVersionForm } from "./components/ModelVersionForm";
import { ImpactPreviewPanel, PreviewData } from "./components/ImpactPreviewPanel";
import { VersionHistoryTable } from "./components/VersionHistoryTable";
import { VersionDetailModal } from "./components/VersionDetailModal";

const API_BASE = "/api/v1";

export default function ModelVersionsPage() {
  const [versions, setVersions] = useState<RiskModelVersion[]>([]);
  const [activeVersion, setActiveVersion] = useState<RiskModelVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [versionTag, setVersionTag] = useState<string>("v1.2.0");
  const [weights, setWeights] = useState<Record<string, number>>({
    attendance_deficit: 0.35,
    assessment_deficit: 0.25,
    missing_assignments: 0.15,
    lms_engagement_deficit: 0.15,
    trend_deterioration: 0.10,
  });
  const [thresholds, setThresholds] = useState<Record<string, number>>({
    low: 0.0,
    moderate: 0.25,
    high: 0.50,
    critical: 0.75,
  });

  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viewingVersion, setViewingVersion] = useState<RiskModelVersion | null>(null);
  const [activateTarget, setActivateTarget] = useState<string | null>(null);

  const loadVersions = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStatusCode(null);
    try {
      const res = await fetch(`${API_BASE}/admin/model-versions`, { credentials: "include" });
      if (!res.ok) {
        setStatusCode(res.status);
        throw new Error(`HTTP ${res.status}: Failed to load model configurations`);
      }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setVersions(data);
        setActiveVersion(data[0]);
        if (data[0].weights) setWeights({ ...data[0].weights });
        if (data[0].thresholds) setThresholds({ ...data[0].thresholds });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load model versions";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const handleSimulate = async () => {
    setIsSimulating(true);
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
        setToast({ message: "Simulation impact preview generated.", type: "success" });
      } else {
        setToast({ message: data.error || "Simulation preview failed", type: "error" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setToast({ message: msg, type: "error" });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/admin/model-versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ version: versionTag, weights, thresholds, commit: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: `Model version ${versionTag} saved successfully.`, type: "success" });
        loadVersions();
      } else {
        setToast({ message: data.error || "Failed to save version", type: "error" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setToast({ message: msg, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateConfirm = async () => {
    if (!activateTarget) return;
    setIsSubmitting(true);
    try {
      // If activating a newly proposed version, save it first if not in list
      if (!versions.some((v) => v.version === activateTarget)) {
        const createRes = await fetch(`${API_BASE}/admin/model-versions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ version: activateTarget, weights, thresholds, commit: true }),
        });
        if (!createRes.ok) {
          const createData = await createRes.json();
          throw new Error(createData.error || "Failed to create version before activation");
        }
      }

      const res = await fetch(`${API_BASE}/admin/model-versions/${encodeURIComponent(activateTarget)}/activate`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: `Model version ${activateTarget} is now active.`, type: "success" });
        setActivateTarget(null);
        loadVersions();
      } else {
        setToast({ message: data.error || "Failed to activate version", type: "error" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Activation failed";
      setToast({ message: msg, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        breadcrumb="Admin / Model versions"
        title="Risk model configuration"
        description="Calibrate explainable scoring weights, simulate risk band shifts against student records, and activate versions with audit tracking."
      />

      {error && <AdminErrorBanner error={error} statusCode={statusCode} onRetry={loadVersions} />}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: "110px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }} />
          ))}
        </div>
      ) : (
        <>
          {activeVersion && <ActiveVersionCard version={activeVersion} />}

          <ModelVersionForm
            versionTag={versionTag}
            setVersionTag={setVersionTag}
            weights={weights}
            onWeightChange={(k, pct) => setWeights((prev) => ({ ...prev, [k]: pct / 100 }))}
            thresholds={thresholds}
            onThresholdChange={(k, val) => setThresholds((prev) => ({ ...prev, [k]: val }))}
            activeWeights={(activeVersion?.weights as Record<string, number>) || {}}
            existingVersions={versions.map((v) => v.version)}
            onSimulate={handleSimulate}
            onSaveDraft={handleSaveDraft}
            onActivate={() => setActivateTarget(versionTag)}
            isSubmitting={isSubmitting}
            isSimulating={isSimulating}
          />

          <ImpactPreviewPanel preview={previewData} />

          <VersionHistoryTable
            versions={versions}
            activeVersion={activeVersion?.version || ""}
            onActivate={(v) => setActivateTarget(v)}
            onView={(v) => setViewingVersion(v)}
            isActivating={isSubmitting}
          />
        </>
      )}

      {toast && <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <VersionDetailModal version={viewingVersion} onClose={() => setViewingVersion(null)} />

      <ConfirmDialog
        isOpen={Boolean(activateTarget)}
        title={`Activate model version ${activateTarget}?`}
        description={
          <div>
            <p style={{ margin: "0 0 0.5rem" }}>
              Activating <strong>{activateTarget}</strong> will immediately apply these factor weights and thresholds to all future student risk evaluations and emit an immutable audit log entry.
            </p>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Previous active version: {activeVersion?.version || "None"}
            </span>
          </div>
        }
        confirmText="Activate version"
        variant="primary"
        isLoading={isSubmitting}
        onConfirm={handleActivateConfirm}
        onCancel={() => setActivateTarget(null)}
      />
    </div>
  );
}
