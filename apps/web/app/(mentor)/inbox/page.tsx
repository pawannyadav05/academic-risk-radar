"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Alert, AlertStatus } from "@academic-risk-radar/shared-types";
import { Tabs } from "@/app/components/Tabs";
import { PageHeader } from "@/app/components/PageHeader";
import { AlertsTable } from "./components/AlertsTable";
import { AlertCardsMobile } from "./components/AlertCardsMobile";
import { InboxDrawer } from "./components/InboxDrawer";
import { Toast } from "./components/Toast";
import { RefreshCw, Search, X, CheckCircle, BookOpen, UserCheck, Inbox } from "lucide-react";

const API_BASE = "/api/v1";

type FilterTabKey = "all" | "open" | "escalated" | "acknowledged";

export default function MentorInboxPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & search
  const [statusFilter, setStatusFilter] = useState<FilterTabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Sorting: default to SLA urgency (soonest deadline first)
  const [sortField, setSortField] = useState<"studentId" | "status" | "slaDeadline" | "createdAt">("slaDeadline");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Interaction & Drawer
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>("just now");

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/alerts`, { credentials: "include" });
      if (res.status === 401) {
        throw new Error("Sign in with your mentor account to view assigned alerts.");
      }
      if (!res.ok) {
        throw new Error(`Failed to load alerts (HTTP ${res.status}).`);
      }
      const data = await res.json();
      setAlerts(data.alerts || []);
      const now = new Date();
      setLastRefreshed(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not load alerts.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Counts for tabs
  const counts = useMemo(() => {
    const total = alerts.length;
    const open = alerts.filter((a) => a.status === "open").length;
    const escalated = alerts.filter((a) => a.status === "escalated").length;
    const acknowledged = alerts.filter((a) => a.status === "acknowledged" || a.status === "closed").length;
    return { total, open, escalated, acknowledged };
  }, [alerts]);

  // Filter & Search & Sort
  const processedAlerts = useMemo(() => {
    return alerts
      .filter((a) => {
        // Tab filter
        if (statusFilter === "open") return a.status === "open";
        if (statusFilter === "escalated") return a.status === "escalated";
        if (statusFilter === "acknowledged") return a.status === "acknowledged" || a.status === "closed";
        return true;
      })
      .filter((a) => {
        // Search
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          a.studentId.toLowerCase().includes(q) ||
          a._id.toLowerCase().includes(q) ||
          (a.riskSnapshotId && a.riskSnapshotId.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (sortField === "slaDeadline" || sortField === "createdAt") {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }

        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [alerts, statusFilter, searchQuery, sortField, sortDirection]);

  const handleSort = (field: "studentId" | "status" | "slaDeadline" | "createdAt") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Optimistic Acknowledge
  const handleAcknowledge = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const prevAlerts = [...alerts];
    // Optimistic update
    setAlerts((prev) =>
      prev.map((a) => (a._id === alertId ? { ...a, status: "acknowledged" as AlertStatus } : a))
    );
    setAcknowledgingId(alertId);

    try {
      const res = await fetch(`${API_BASE}/alerts/${encodeURIComponent(alertId)}/acknowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Server rejected acknowledgement request.");
      }

      setToast({ message: "Alert acknowledged successfully.", type: "success" });
    } catch {
      // Rollback
      setAlerts(prevAlerts);
      setToast({ message: "Failed to acknowledge alert. Action rolled back.", type: "error" });
    } finally {
      setAcknowledgingId(null);
    }
  };

  const handleLogActionSuccess = (alertId: string) => {
    // Optimistically update alert status to acknowledged
    setAlerts((prev) =>
      prev.map((a) => (a._id === alertId ? { ...a, status: "acknowledged" as AlertStatus } : a))
    );
    setToast({ message: "Mentoring action recorded successfully.", type: "success" });
  };

  // Subtitle with singular/plural support
  const unacknowledgedCount = counts.open + counts.escalated;
  const subtitle =
    unacknowledgedCount === 0
      ? "All alerts are acknowledged or closed."
      : unacknowledgedCount === 1
      ? "1 alert needs your acknowledgement"
      : `${unacknowledgedCount} alerts need your acknowledgement`;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 0", color: "var(--text)" }}>
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Faculty Dual-Role Navigation */}
      <Tabs
        items={[
          {
            label: "Teaching section",
            href: "/sections",
            icon: BookOpen,
            active: false,
          },
          {
            label: "Mentee alerts & interventions",
            href: "/inbox",
            icon: UserCheck,
            active: true,
            count: counts.open > 0 ? `Open ${counts.open}` : undefined,
          },
        ]}
        ariaLabel="Faculty navigation"
      />

      {/* Page Header */}
      <PageHeader
        breadcrumb="Mentor / Mentee alerts"
        title="Mentee alerts"
        description={subtitle}
        action={
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Updated {lastRefreshed}
            </span>
            <button
              type="button"
              onClick={fetchAlerts}
              disabled={loading}
              title="Refresh alert list"
              aria-label="Refresh alert list"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        }
      />

      {/* Filter Tabs & Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        {/* Filter buttons with counts */}
        <div style={{ display: "inline-flex", gap: "0.25rem", background: "var(--surface-2)", padding: "0.2rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          {(
            [
              { key: "all", label: "All", count: counts.total },
              { key: "open", label: "Open", count: counts.open },
              { key: "escalated", label: "Sent to HoD", count: counts.escalated },
              { key: "acknowledged", label: "Acknowledged", count: counts.acknowledged },
            ] as const
          ).map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.35rem 0.65rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.8125rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--text)" : "var(--text-muted)",
                  background: isActive ? "var(--surface)" : "transparent",
                  border: isActive ? "1px solid var(--border)" : "1px solid transparent",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    padding: "0.1rem 0.4rem",
                    borderRadius: "10px",
                    background: isActive ? "var(--surface-2)" : "var(--surface)",
                    color: isActive ? "var(--text)" : "var(--text-muted)",
                    border: "1px solid var(--border)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input with clear button */}
        <div style={{ position: "relative", width: "260px" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student ID or alert..."
            style={{
              width: "100%",
              height: "36px",
              paddingLeft: "2.25rem",
              paddingRight: searchQuery ? "2rem" : "0.75rem",
              boxSizing: "border-box",
              borderRadius: "var(--radius-sm)",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search query"
              style={{
                position: "absolute",
                right: "0.5rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "0.25rem",
                display: "inline-flex",
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          style={{
            padding: "0.875rem 1rem",
            marginBottom: "1.25rem",
            background: "var(--surface-2)",
            border: "1px solid var(--danger)",
            borderRadius: "var(--radius-sm)",
            color: "var(--danger)",
            fontSize: "0.875rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchAlerts}
            style={{
              background: "transparent",
              border: "1px solid var(--danger)",
              color: "var(--danger)",
              padding: "0.25rem 0.65rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state: 5 skeleton rows */}
      {loading && !error && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.875rem 0.5rem",
                borderBottom: i === 5 ? "none" : "1px solid var(--border)",
              }}
            >
              <div style={{ width: "120px", height: "16px", background: "var(--surface-2)", borderRadius: "4px" }} />
              <div style={{ width: "90px", height: "16px", background: "var(--surface-2)", borderRadius: "4px" }} />
              <div style={{ width: "80px", height: "16px", background: "var(--surface-2)", borderRadius: "4px" }} />
              <div style={{ width: "140px", height: "16px", background: "var(--surface-2)", borderRadius: "4px" }} />
              <div style={{ width: "100px", height: "30px", background: "var(--surface-2)", borderRadius: "4px" }} />
            </div>
          ))}
        </div>
      )}

      {/* Empty state: No alerts */}
      {!loading && !error && processedAlerts.length === 0 && (
        <div
          style={{
            padding: "3.5rem 2rem",
            textAlign: "center",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "var(--surface-2)",
              color: "var(--success)",
              margin: "0 auto 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle size={28} strokeWidth={2} />
          </div>
          <h3 style={{ margin: "0 0 0.35rem", fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
            You&apos;re all caught up
          </h3>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>
            {statusFilter !== "all" || searchQuery
              ? "No alerts match the active filter or search query."
              : "All mentee alerts are acknowledged or closed."}
          </p>
        </div>
      )}

      {/* Data display: Desktop Table + Mobile Cards */}
      {!loading && !error && processedAlerts.length > 0 && (
        <>
          <AlertsTable
            alerts={processedAlerts}
            onRowClick={(alert) => setSelectedAlert(alert)}
            onAcknowledge={handleAcknowledge}
            onLogActionClick={(alert, e) => {
              e.stopPropagation();
              setSelectedAlert(alert);
            }}
            acknowledgingId={acknowledgingId}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />

          <AlertCardsMobile
            alerts={processedAlerts}
            onCardClick={(alert) => setSelectedAlert(alert)}
            onAcknowledge={handleAcknowledge}
            onLogActionClick={(alert, e) => {
              e.stopPropagation();
              setSelectedAlert(alert);
            }}
            acknowledgingId={acknowledgingId}
          />
        </>
      )}

      {/* Right-side Detail & Intervention Drawer */}
      {selectedAlert && (
        <InboxDrawer
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onLogActionSuccess={handleLogActionSuccess}
        />
      )}
    </div>
  );
}
