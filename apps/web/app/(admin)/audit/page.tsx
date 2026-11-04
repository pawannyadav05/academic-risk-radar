"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AuditEntry } from "@academic-risk-radar/shared-types";
import { AuditFilterBar } from "./components/AuditFilterBar";
import { AuditTable } from "./components/AuditTable";
import { AuditPagination } from "./components/AuditPagination";
import { AuditDetailModal } from "./components/AuditDetailModal";

const API_BASE = "/api/v1";

export default function AuditLogsPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [entityType, setEntityType] = useState<string>("");
  const [actorId, setActorId] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  const fetchAuditLogs = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (entityType) params.set("entityType", entityType);
      if (actorId) params.set("actorId", actorId.trim());
      params.set("page", String(targetPage));
      params.set("limit", "15");

      const res = await fetch(`${API_BASE}/admin/audit?${params.toString()}`, { credentials: "include" });
      const data = await res.json();

      if (res.ok) {
        setEntries(data.entries || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setPage(data.page || targetPage);
      } else {
        setError(data.error || "Failed to load audit logs");
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [entityType, actorId]);

  useEffect(() => {
    fetchAuditLogs(1);
  }, [fetchAuditLogs]);

  const handleReset = () => {
    setEntityType("");
    setActorId("");
    setPage(1);
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: "0 0 0.35rem", fontSize: "1.5rem", fontWeight: 700, color: "#1B2A33" }}>
          System audit log
        </h1>
        <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.875rem", maxWidth: "600px" }}>
          Immutable append-only record of model activations, administrative configurations, and mentor interventions.
        </p>
      </div>

      <AuditFilterBar
        entityType={entityType}
        setEntityType={setEntityType}
        actorId={actorId}
        setActorId={setActorId}
        onApply={() => fetchAuditLogs(1)}
        onReset={handleReset}
      />

      {error && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "4px", marginBottom: "1.25rem", fontSize: "0.8125rem", background: "#FBF0F4", color: "#8A4A7B", border: "1px solid #8A4A7B" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: "#5B6B75", fontSize: "0.875rem", padding: "2rem 0" }}>Loading audit records...</div>
      ) : (
        <>
          <AuditTable entries={entries} onSelectEntry={setSelectedEntry} />
          <AuditPagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={(p) => fetchAuditLogs(p)}
          />
        </>
      )}

      <AuditDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
    </div>
  );
}
