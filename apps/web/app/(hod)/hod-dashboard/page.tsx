"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Users, ShieldAlert, AlertTriangle } from "lucide-react";
import DepartmentRiskBarChart from "./components/DepartmentRiskBarChart";
import SlaEscalationLineChart from "./components/SlaEscalationLineChart";

const API_BASE = "/api/v1";

interface DepartmentAnalytics {
  departmentId: string;
  totalStudents: number;
  bandDistribution: { low: number; moderate: number; high: number; critical: number };
  recentTrends?: Array<{ week: string; bandCounts: { low: number; moderate: number; high: number; critical: number } }>;
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
        <h1 style={{ margin: "0.2rem 0 0.35rem", fontSize: "1.75rem", fontWeight: 700, color: "#1B2A33" }}>
          Department Dashboard: {departmentId}
        </h1>
        <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.875rem" }}>
          Academic risk cohort distributions and 48-hour SLA escalation triage for {departmentId}.
        </p>
      </div>

      {/* KPI metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div style={{ background: "#FFFFFF", padding: "1.25rem", borderRadius: "8px", border: "1px solid #D9DFDD", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#F2F4F3", padding: "0.85rem", borderRadius: "4px", color: "#2D5BA3" }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.8125rem", fontWeight: 500 }}>Total Department Students</p>
            <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "#1B2A33", fontVariantNumeric: "tabular-nums" }}>
              {loading ? "..." : (data?.totalStudents ?? 0)}
            </h3>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "1.25rem", borderRadius: "8px", border: "1px solid #D9DFDD", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#F2F4F3", padding: "0.85rem", borderRadius: "4px", color: "#8A4A7B" }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.8125rem", fontWeight: 500 }}>Students At Risk (High / Critical)</p>
            <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "#8A4A7B", fontVariantNumeric: "tabular-nums" }}>
              {loading ? "..." : atRiskCount}
            </h3>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "1.25rem", borderRadius: "8px", border: "1px solid #D9DFDD", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#F2F4F3", padding: "0.85rem", borderRadius: "4px", color: "#8A4A7B" }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.8125rem", fontWeight: 500 }}>Escalated Alerts (SLA Breaches)</p>
            <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "#8A4A7B", fontVariantNumeric: "tabular-nums" }}>
              {loading ? "..." : (data?.escalatedAlerts ?? 0)}
            </h3>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: "#FFFFFF", border: "1px solid #8A4A7B", color: "#8A4A7B", padding: "1rem", borderRadius: "8px", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      {/* Visual Recharts Row */}
      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.5rem" }}>
          <DepartmentRiskBarChart bandDistribution={data.bandDistribution} />
          <SlaEscalationLineChart escalatedAlerts={data.escalatedAlerts} recentTrends={data.recentTrends} />
        </div>
      )}
    </div>
  );
}
