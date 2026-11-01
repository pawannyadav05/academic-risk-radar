"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Alert, AlertStatus } from "@academic-risk-radar/shared-types";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert,
  Search,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

const API_BASE = "/api/v1";

// Design tokens
const T = {
  page: "#F2F4F3",
  surface: "#FFFFFF",
  text: "#1B2A33",
  muted: "#5B6B75",
  border: "#D9DFDD",
  accent: "#2D5BA3",
  steady: "#2E8B7A",
  watch: "#D49A1F",
  needsSupport: "#8A4A7B",
} as const;

const STATUS_CONFIG: Record<
  AlertStatus,
  { label: string; textColor: string; icon: React.ReactNode }
> = {
  open: {
    label: "Open",
    textColor: T.watch,
    icon: <Clock size={14} aria-hidden />,
  },
  acknowledged: {
    label: "Acknowledged",
    textColor: T.steady,
    icon: <CheckCircle size={14} aria-hidden />,
  },
  escalated: {
    label: "Sent to HoD",
    textColor: T.needsSupport,
    icon: <ShieldAlert size={14} aria-hidden />,
  },
  closed: {
    label: "Closed",
    textColor: T.muted,
    icon: <CheckCircle size={14} aria-hidden />,
  },
};

function getSlaBadge(deadlineStr: string, status: AlertStatus) {
  if (status === "acknowledged" || status === "closed") {
    return (
      <span style={{ color: T.steady, display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.8125rem" }}>
        <CheckCircle size={13} aria-hidden /> Met
      </span>
    );
  }

  const diffMs = new Date(deadlineStr).getTime() - Date.now();
  const isBreached = diffMs <= 0;

  if (isBreached || status === "escalated") {
    return (
      <span
        style={{
          color: T.needsSupport,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: "0.8125rem",
          fontWeight: 600,
        }}
      >
        <AlertTriangle size={13} aria-hidden />
        Overdue
      </span>
    );
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  return (
    <span
      style={{
        color: hours < 12 ? T.needsSupport : T.muted,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: "0.8125rem",
      }}
    >
      <Clock size={13} aria-hidden />
      {hours}h left
    </span>
  );
}

export default function MentorInboxPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  const [lastAcknowledged, setLastAcknowledged] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== "all") {
        queryParams.set("status", statusFilter);
      }
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

      const res = await fetch(`${API_BASE}/alerts${queryString}`, {
        credentials: "include",
      });

      if (res.status === 401) {
        throw new Error("Sign in with your mentor account to view your assigned alerts.");
      }

      if (!res.ok) {
        throw new Error(`Could not load alerts (HTTP ${res.status}). Try again.`);
      }

      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not load alerts.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleAcknowledge = async (alertId: string) => {
    setAcknowledgingId(alertId);
    setLastAcknowledged(null);
    try {
      const res = await fetch(`${API_BASE}/alerts/${encodeURIComponent(alertId)}/acknowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const updatedData = await res.json();
      const updatedAlert: Alert = updatedData.alert;

      setAlerts((prev) =>
        prev.map((a) => (a._id === alertId ? { ...a, ...updatedAlert } : a))
      );
      setLastAcknowledged(updatedAlert.studentId || alertId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not acknowledge this alert.";
      setError(message);
    } finally {
      setAcknowledgingId(null);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      a.studentId.toLowerCase().includes(query) ||
      a._id.toLowerCase().includes(query) ||
      a.riskSnapshotId.toLowerCase().includes(query)
    );
  });

  const openCount = alerts.filter((a) => a.status === "open").length;

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem", fontFamily: "var(--font-atkinson, system-ui, sans-serif)", color: T.text }}>

      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.5rem", fontWeight: 700, color: T.text }}>
            Your mentee alerts
          </h1>
          <p style={{ margin: 0, color: T.muted, fontSize: "0.9375rem" }}>
            {openCount > 0
              ? `${openCount} open ${openCount === 1 ? "alert requires" : "alerts require"} acknowledgement.`
              : "All alerts are acknowledged or closed."}
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            background: T.surface,
            color: T.text,
            border: `1px solid ${T.border}`,
            borderRadius: "4px",
            padding: "0.5rem 0.875rem",
            fontSize: "0.875rem",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          <RefreshCw size={14} aria-hidden />
          Refresh
        </button>
      </div>

      {/* Inline acknowledgement confirmation */}
      {lastAcknowledged && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.625rem 0.875rem",
            marginBottom: "1rem",
            background: T.surface,
            border: `1px solid ${T.steady}`,
            borderRadius: "4px",
            color: T.steady,
            fontSize: "0.875rem",
          }}
        >
          <CheckCircle size={15} aria-hidden />
          Alert for {lastAcknowledged} marked as acknowledged.
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            padding: "0.75rem 1rem",
            marginBottom: "1.25rem",
            background: T.surface,
            border: `1px solid ${T.needsSupport}`,
            borderRadius: "4px",
            color: T.needsSupport,
            fontSize: "0.875rem",
          }}
        >
          <span>{error}</span>
          <button
            onClick={fetchAlerts}
            style={{
              background: "transparent",
              border: `1px solid ${T.needsSupport}`,
              color: T.needsSupport,
              padding: "0.25rem 0.625rem",
              borderRadius: "4px",
              fontSize: "0.8125rem",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter tabs and search */}
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
        <div style={{ display: "flex", gap: "0.25rem" }}>
          {[
            { key: "all", label: "All" },
            { key: "open", label: "Open" },
            { key: "escalated", label: "Sent to HoD" },
            { key: "acknowledged", label: "Acknowledged" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                background: statusFilter === tab.key ? T.accent : "transparent",
                color: statusFilter === tab.key ? "#fff" : T.muted,
                border: `1px solid ${statusFilter === tab.key ? T.accent : T.border}`,
                borderRadius: "4px",
                padding: "0.375rem 0.75rem",
                fontSize: "0.8125rem",
                fontWeight: statusFilter === tab.key ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: "relative" }}>
          <Search
            size={14}
            style={{ position: "absolute", left: "0.625rem", top: "50%", transform: "translateY(-50%)", color: T.muted, pointerEvents: "none" }}
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search by student ID or alert ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: "4px",
              padding: "0.375rem 0.75rem 0.375rem 2rem",
              color: T.text,
              fontSize: "0.875rem",
              width: "260px",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ padding: "3rem", textAlign: "center", color: T.muted, fontSize: "0.9375rem" }}>
          <RefreshCw size={18} style={{ display: "block", margin: "0 auto 0.5rem" }} aria-hidden />
          Loading your alerts…
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredAlerts.length === 0 && (
        <div
          style={{
            padding: "3rem 2rem",
            textAlign: "center",
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: "8px",
            color: T.muted,
          }}
        >
          <CheckCircle size={36} style={{ display: "block", margin: "0 auto 1rem", color: T.steady }} aria-hidden />
          <p style={{ margin: "0 0 0.25rem", fontWeight: 600, color: T.text, fontSize: "1rem" }}>
            No alerts match this filter.
          </p>
          <p style={{ margin: 0, fontSize: "0.875rem" }}>
            {statusFilter !== "all"
              ? "Try switching to a different status tab, or clear the search."
              : "All mentee alerts are acknowledged or closed."}
          </p>
        </div>
      )}

      {/* Alert table — "Lists are tables" */}
      {!loading && !error && filteredAlerts.length > 0 && (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "8px", overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
              color: T.text,
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: `1px solid ${T.border}`,
                  background: T.page,
                }}
              >
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, textAlign: "left", color: T.muted, fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                  Student ID
                </th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, textAlign: "left", color: T.muted, fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                  Status
                </th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, textAlign: "left", color: T.muted, fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                  SLA deadline
                </th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, textAlign: "left", color: T.muted, fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                  SLA status
                </th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, textAlign: "left", color: T.muted, fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                  Raised
                </th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, textAlign: "right", color: T.muted, fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert, idx) => {
                const conf = STATUS_CONFIG[alert.status] || STATUS_CONFIG.open;
                const isAcknowledging = acknowledgingId === alert._id;
                const isOpenOrEscalated = alert.status === "open" || alert.status === "escalated";
                const isLast = idx === filteredAlerts.length - 1;

                return (
                  <tr
                    key={alert._id}
                    style={{
                      borderBottom: isLast ? "none" : `1px solid ${T.border}`,
                      verticalAlign: "middle",
                    }}
                  >
                    {/* Student ID */}
                    <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}>
                      <span style={{ fontWeight: 600, color: T.text, fontVariantNumeric: "tabular-nums" }}>
                        {alert.studentId}
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.75rem",
                          color: T.muted,
                          marginTop: "0.125rem",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {alert._id}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          color: conf.textColor,
                          fontWeight: 600,
                          fontSize: "0.8125rem",
                        }}
                      >
                        {conf.icon}
                        {conf.label}
                      </span>
                    </td>

                    {/* SLA deadline */}
                    <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap", color: T.muted, fontVariantNumeric: "tabular-nums" }}>
                      {new Date(alert.slaDeadline).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* SLA status badge */}
                    <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}>
                      {getSlaBadge(alert.slaDeadline, alert.status)}
                    </td>

                    {/* Raised */}
                    <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap", color: T.muted, fontVariantNumeric: "tabular-nums" }}>
                      {new Date(alert.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                        {isOpenOrEscalated && (
                          <button
                            onClick={() => handleAcknowledge(alert._id)}
                            disabled={isAcknowledging}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              background: "transparent",
                              color: T.steady,
                              border: `1px solid ${T.steady}`,
                              padding: "0.375rem 0.75rem",
                              borderRadius: "4px",
                              fontSize: "0.8125rem",
                              fontWeight: 600,
                              cursor: isAcknowledging ? "not-allowed" : "pointer",
                              opacity: isAcknowledging ? 0.6 : 1,
                            }}
                          >
                            <CheckCircle size={13} aria-hidden />
                            {isAcknowledging ? "Saving…" : "Acknowledge"}
                          </button>
                        )}

                        <Link
                          href={`/interventions?alertId=${alert._id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            background: T.accent,
                            color: "#fff",
                            textDecoration: "none",
                            padding: "0.375rem 0.75rem",
                            borderRadius: "4px",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                          }}
                        >
                          <ExternalLink size={13} aria-hidden />
                          Log mentoring action
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Snapshot detail link row — rendered below the table as supplementary context */}
    </div>
  );
}
