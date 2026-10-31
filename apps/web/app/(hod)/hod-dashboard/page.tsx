"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Users, ShieldAlert, AlertTriangle, Clock, Calendar } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

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
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem", color: "#1e293b" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <span style={{ fontSize: "0.75rem", color: "#6366f1", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          HoD Management Portal
        </span>
        <h1 style={{ margin: "0.2rem 0 0.35rem", fontSize: "1.75rem", fontWeight: 700, color: "#0f172a" }}>
          Department Dashboard: {departmentId}
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>
          Academic overview and escalated SLA triage for Department of {departmentId}.
        </p>
      </div>

      {/* Stage 3 Roadmap Deferral Notice Banner */}
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #cbd5e1",
          borderRadius: "12px",
          padding: "1.25rem 1.5rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "1rem",
        }}
      >
        <div style={{ background: "#e0e7ff", color: "#4f46e5", padding: "0.5rem", borderRadius: "8px", marginTop: "0.15rem" }}>
          <Calendar size={20} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#1e1b4b" }}>
              Detailed HoD Analytics & Section Comparison Charts
            </h3>
            <span style={{ background: "#e0e7ff", color: "#4338ca", fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "999px" }}>
              STAGE 3 ROADMAP (WEEK 13)
            </span>
          </div>
          <p style={{ margin: "0.35rem 0 0", color: "#475569", fontSize: "0.8125rem", lineHeight: 1.5 }}>
            As specified in the Master Stage Plan, advanced department comparison pie charts and multi-week historical SLA escalation trends are scheduled for delivery during the <strong>Stage 3 Product Readiness Review (Week 13)</strong>. For the Week 9 functional review, high-level aggregated operational metrics are shown below.
          </p>
        </div>
      </div>

      {/* Basic Aggregated Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#eff6ff", padding: "0.85rem", borderRadius: "50%", color: "#3b82f6" }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.8125rem", fontWeight: 500 }}>Total Department Students</p>
            <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "#0f172a" }}>
              {loading ? "..." : (data?.totalStudents ?? 0)}
            </h3>
          </div>
        </div>

        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#fef2f2", padding: "0.85rem", borderRadius: "50%", color: "#dc2626" }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.8125rem", fontWeight: 500 }}>Students At Risk (High / Critical)</p>
            <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "#dc2626" }}>
              {loading ? "..." : atRiskCount}
            </h3>
          </div>
        </div>

        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#fef2f2", padding: "0.85rem", borderRadius: "50%", color: "#b91c1c" }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.8125rem", fontWeight: 500 }}>Escalated Alerts (SLA Breaches)</p>
            <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "#b91c1c" }}>
              {loading ? "..." : (data?.escalatedAlerts ?? 0)}
            </h3>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "1rem", borderRadius: "8px", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}
    </div>
  );
}
