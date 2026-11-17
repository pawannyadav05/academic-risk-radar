"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { AdminErrorBanner } from "../components/AdminErrorBanner";
import { AdminToast } from "../components/AdminToast";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ConnectorStatusRow, ConnectorStatus } from "./components/ConnectorStatusRow";
import { ConnectorIngestionCard } from "./components/ConnectorIngestionCard";
import { QuarantineAuditTable, QuarantineItem } from "./components/QuarantineAuditTable";

export default function ConnectorsPage() {
  const [status, setStatus] = useState<ConnectorStatus | null>(null);
  const [quarantined, setQuarantined] = useState<QuarantineItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Sync confirmation modal state
  const [pendingSync, setPendingSync] = useState<{
    source: string;
    csv: string;
    invalidCount: number;
  } | null>(null);

  // Feedback result
  const [syncResult, setSyncResult] = useState<{
    status: string;
    insertedCount?: number;
    quarantinedCount?: number;
    duplicateCount?: number;
    jobId?: string;
    mode?: string;
    message?: string;
  } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setStatusCode(null);
      const res = await fetch("/api/v1/admin/connectors/status", {
        credentials: "include",
      });
      if (!res.ok) {
        setStatusCode(res.status);
        setError(`HTTP ${res.status}: Failed to load connector status`);
        return;
      }
      const data = await res.json();
      setStatus(data);

      const qRes = await fetch("/api/v1/admin/connectors/quarantine?limit=30", {
        credentials: "include",
      });
      if (qRes.ok) {
        const qData = await qRes.json();
        setQuarantined(qData.quarantined || []);
      }
    } catch {
      setError("Network error: Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const executeSync = async (source: string, csv: string) => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch(`/api/v1/admin/connectors/${source}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ csvData: csv }),
      });

      const data = await res.json();

      if (res.status === 202) {
        const result = {
          status: "queued",
          jobId: data.jobId,
          mode: data.mode,
          message: "Sync enqueued to BullMQ background worker.",
        };
        setSyncResult(result);
        setToast({ type: "success", message: "Background sync job scheduled." });
        return result;
      } else if (res.ok) {
        const result = {
          status: "completed",
          insertedCount: data.insertedCount ?? 0,
          quarantinedCount: data.quarantinedCount ?? 0,
          duplicateCount: data.duplicateCount ?? 0,
          message: `Ingestion finished. Inserted ${data.insertedCount ?? 0} records, quarantined ${data.quarantinedCount ?? 0}.`,
        };
        setSyncResult(result);
        setToast({
          type: (data.quarantinedCount ?? 0) > 0 ? "error" : "success",
          message: `Sync finished: ${data.insertedCount ?? 0} inserted, ${data.quarantinedCount ?? 0} quarantined.`,
        });
        fetchStatus();
        return result;
      } else {
        const result = {
          status: "error",
          message: data.error || data.message || `Failed to ingest records (HTTP ${res.status})`,
        };
        setSyncResult(result);
        setToast({ type: "error", message: result.message });
        return result;
      }
    } catch {
      const result = { status: "error", message: "Network error occurred while syncing data." };
      setSyncResult(result);
      setToast({ type: "error", message: result.message });
      return result;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRequestConfirm = (source: string, csv: string, invalidCount: number) => {
    setPendingSync({ source, csv, invalidCount });
  };

  const handleConfirmSync = async () => {
    if (!pendingSync) return;
    const { source, csv } = pendingSync;
    setPendingSync(null);
    await executeSync(source, csv);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <PageHeader
        breadcrumb="Admin / Data connectors"
        title="Data connectors"
        description="Ingest external institutional feeds, monitor pipeline health and inspect schema-quarantined records."
      />

      {error && (
        <div style={{ marginBottom: "1.5rem" }}>
          <AdminErrorBanner error={error} statusCode={statusCode} onRetry={fetchStatus} />
        </div>
      )}

      {loading && !status ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  height: 108,
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  animation: "pulse 1.5s infinite ease-in-out",
                }}
              />
            ))}
          </div>
          <div
            style={{
              height: 340,
              borderRadius: "var(--radius-md)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              animation: "pulse 1.5s infinite ease-in-out",
            }}
          />
        </div>
      ) : (
        <>
          <ConnectorStatusRow status={status} />

          <ConnectorIngestionCard
            onSync={executeSync}
            isSyncing={isSyncing}
            onRequestConfirm={handleRequestConfirm}
            syncResult={syncResult}
          />

          <QuarantineAuditTable items={quarantined} />
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingSync)}
        title="Confirm data synchronization"
        description={
          pendingSync?.invalidCount && pendingSync.invalidCount > 0
            ? `Your payload contains ${pendingSync.invalidCount} detected schema irregularities that will be routed to the quarantine registry. Do you wish to proceed with syncing to the production database?`
            : `Are you sure you want to trigger ingestion for ${pendingSync?.source.toUpperCase()}? Records will be parsed and loaded into the academic record store.`
        }
        confirmText="Synchronize now"
        cancelText="Cancel"
        variant={pendingSync?.invalidCount && pendingSync.invalidCount > 0 ? "danger" : "primary"}
        onConfirm={handleConfirmSync}
        onCancel={() => setPendingSync(null)}
      />

      {toast && (
        <AdminToast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
