"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Users, ShieldAlert, AlertTriangle, Clock } from "lucide-react";

const API_BASE = "/api/v1";

interface DepartmentAnalytics {
  departmentId: string;
  totalStudents: number;
  bandDistribution: { low: number; moderate: number; high: number; critical: number };
  escalatedAlerts: number;
}

export default function HodDashboardPage() {
  const [departmentId, setDepartmentId] = useState<string>("CSE");
  const [data, setData] = useState<DepartmentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initUser() {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
        if (res.ok) {
          const body = await res.json();
          if (body.user?.departmentId) {
            setDepartmentId(body.user.departmentId);
          }
        }
      } catch {}
    }
    initUser();
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/analytics/department/${departmentId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load department metrics`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load department analytics");
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const atRiskCount = data ? (data.bandDistribution.high || 0) + (data.bandDistribution.critical || 0) : 0;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem", color: "#1B2A33" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: "0.2rem 0 0.35rem", fontSize: "1.75rem", fontWeight: 700, color: "#0f172a" }}>
          Department Dashboard: {departmentId}
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>
          Academic overview and escalated SLA triage for Department of {departmentId}.
        </p>
      </div>

      <div
        style={{
          background: "#F2F4F3",
          border: "1px solid #D9DFDD",
          borderRadius: "8px",
          padding: "1rem 1.25rem",
          marginBottom: "2rem",
          fontSize: "0.875rem",
          color: "#5B6B75",
        }}
      >
        Advanced department comparison charts and multi-week SLA escalation trends are under development. Aggregated operational metrics are shown below.
      </div>

      {/* Basic Aggregated Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div style={{ background: "#FFFFFF", padding: "1.25rem", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#F2F4F3", padding: "0.85rem", borderRadius: "4px", color: "#2D5BA3" }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.8125rem", fontWeight: 500 }}>Total Department Students</p>
            <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "#1B2A33" }}>
              {loading ? "..." : (data?.totalStudents ?? 0)}
            </h3>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "1.25rem", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#F2F4F3", padding: "0.85rem", borderRadius: "4px", color: "#8A4A7B" }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.8125rem", fontWeight: 500 }}>Students At Risk (High / Critical)</p>
            <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "#8A4A7B" }}>
              {loading ? "..." : atRiskCount}
            </h3>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "1.25rem", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#F2F4F3", padding: "0.85rem", borderRadius: "4px", color: "#8A4A7B" }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.8125rem", fontWeight: 500 }}>Escalated Alerts (SLA Breaches)</p>
            <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "#8A4A7B" }}>
              {loading ? "..." : (data?.escalatedAlerts ?? 0)}
            </h3>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: "#FFFFFF", border: "1px solid #8A4A7B", color: "#8A4A7B", padding: "1rem", borderRadius: "8px", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}
    </div>
  );
}
