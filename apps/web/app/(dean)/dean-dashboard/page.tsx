"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Users, AlertTriangle, TrendingUp, Calendar } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface InstitutionAnalytics {
  totalStudents: number;
  bandDistribution: { low: number; moderate: number; high: number; critical: number };
  interventionSuccessRate: number;
}

export default function DeanDashboardPage() {
  const [data, setData] = useState<InstitutionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/analytics/institution`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load institution metrics`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load institution analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const atRiskCount = data ? (data.bandDistribution.high || 0) + (data.bandDistribution.critical || 0) : 0;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem", color: "#1e293b" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <span style={{ fontSize: "0.75rem", color: "#8b5cf6", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Executive Dean Portal
        </span>
        <h1 style={{ margin: "0.2rem 0 0.35rem", fontSize: "1.75rem", fontWeight: 700, color: "#0f172a" }}>
          Institution-Wide Academic Risk Overview
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>
          Executive summary of academic retention and intervention efficacy across departments.
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
        <div style={{ background: "#f3e8ff", color: "#7c3aed", padding: "0.5rem", borderRadius: "8px", marginTop: "0.15rem" }}>
          <Calendar size={20} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#2e1065" }}>
              Institution-Wide Department Comparisons & Trend Visualizations
            </h3>
            <span style={{ background: "#f3e8ff", color: "#6d28d9", fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "999px" }}>
              STAGE 3 ROADMAP (WEEK 13)
            </span>
          </div>
          <p style={{ margin: "0.35rem 0 0", color: "#475569", fontSize: "0.8125rem", lineHeight: 1.5 }}>
            As planned in the Master Specification Blueprint, full multi-department benchmark charts and longitudinal outcome transition flows are deferred to the <strong>Stage 3 Product Readiness Review (Week 13)</strong>. High-level institution-wide KPI counts are displayed below.
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
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.8125rem", fontWeight: 500 }}>Total Enrolled Students</p>
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
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.8125rem", fontWeight: 500 }}>Institution-Wide At-Risk</p>
            <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "#dc2626" }}>
              {loading ? "..." : atRiskCount}
            </h3>
          </div>
        </div>

        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#f0fdf4", padding: "0.85rem", borderRadius: "50%", color: "#16a34a" }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.8125rem", fontWeight: 500 }}>Intervention Success Rate</p>
            <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "#16a34a" }}>
              {loading ? "..." : `${Math.round((data?.interventionSuccessRate ?? 0) * 100)}%`}
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
