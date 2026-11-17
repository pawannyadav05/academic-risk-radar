"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AuditEntry } from "@academic-risk-radar/shared-types";
import { Lock } from "lucide-react";
import { PageHeader } from "@/app/components/PageHeader";
import { AdminErrorBanner } from "../components/AdminErrorBanner";
import { AuditFilterBar } from "./components/AuditFilterBar";
import { AuditTable } from "./components/AuditTable";
import { AuditPagination } from "./components/AuditPagination";
import { AuditDetailDrawer } from "./components/AuditDetailDrawer";

const API_BASE = "/api/v1";

export default function AuditLogsPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const [entityType, setEntityType] = useState<string>("");
  const [actorId, setActorId] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  const fetchAuditLogs = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError(null);
    setStatusCode(null);
    try {
      const params = new URLSearchParams();
      if (entityType) params.set("entityType", entityType);
      if (actorId.trim()) params.set("actorId", actorId.trim());
      if (fromDate) params.set("from", new Date(fromDate).toISOString());
      if (toDate) params.set("to", new Date(`${toDate}T23:59:59Z`).toISOString());
      params.set("page", String(targetPage));
      params.set("limit", "15");

      const res = await fetch(`${API_BASE}/admin/audit?${params.toString()}`, { credentials: "include" });
      if (!res.ok) {
        setStatusCode(res.status);
        throw new Error(`HTTP ${res.status}: Failed to load audit logs`);
      }
      const data = await res.json();
      setEntries(data.entries || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || targetPage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load audit trail";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [entityType, actorId, fromDate, toDate]);

  useEffect(() => {
    fetchAuditLogs(1);
  }, [fetchAuditLogs]);

  const handleReset = () => {
    setEntityType("");
    setActorId("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const handleRemoveFilter = (key: "entityType" | "actorId" | "from" | "to") => {
    if (key === "entityType") setEntityType("");
    if (key === "actorId") setActorId("");
    if (key === "from") setFromDate("");
    if (key === "to") setToDate("");
  };

  return (
    <div>
      <PageHeader
        breadcrumb="Admin / Audit log"
        title="System audit log"
        description="Immutable append-only record of model activations, administrative configurations, and mentor interventions."
        action={
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--surface)", border: "1px solid var(--border)", padding: "0.35rem 0.65rem", borderRadius: "var(--radius-sm)" }}>
            <Lock size={12} style={{ color: "var(--text-muted)" }} />
            <span>Immutable append-only record</span>
          </div>
        }
      />

      <AuditFilterBar
        entityType={entityType}
        setEntityType={setEntityType}
        actorId={actorId}
        setActorId={setActorId}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        onApply={() => fetchAuditLogs(1)}
        onReset={handleReset}
        onRemoveFilter={handleRemoveFilter}
      />

      {error && <AdminErrorBanner error={error} statusCode={statusCode} onRetry={() => fetchAuditLogs(page)} />}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: "48px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }} />
          ))}
        </div>
      ) : (
        <>
          <AuditTable entries={entries} onSelectEntry={setSelectedEntry} />
          <AuditPagination page={page} totalPages={totalPages} total={total} onPageChange={(p) => fetchAuditLogs(p)} />
        </>
      )}

      <AuditDetailDrawer entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
    </div>
  );
}
