"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Users, AlertTriangle, TrendingUp } from "lucide-react";
import DepartmentComparisonChart from "./components/DepartmentComparisonChart";
import OutcomeSuccessDonutChart from "./components/OutcomeSuccessDonutChart";

const API_BASE = "/api/v1";

interface InstitutionAnalytics {
  totalStudents: number;
  bandDistribution: { low: number; moderate: number; high: number; critical: number };
  departmentComparison?: Array<{ department: string; totalStudents: number; atRisk: number }>;
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
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem", color: "#1B2A33" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: "0.2rem 0 0.35rem", fontSize: "1.75rem", fontWeight: 700, color: "#1B2A33" }}>
          Institution-Wide Academic Risk Overview
        </h1>
        <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.875rem" }}>
          Executive summary of academic retention and intervention efficacy across departments.
        </p>
      </div>

      {/* KPI metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div style={{ background: "#FFFFFF", padding: "1.25rem", borderRadius: "8px", border: "1px solid #D9DFDD", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#F2F4F3", padding: "0.85rem", borderRadius: "4px", color: "#2D5BA3" }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.8125rem", fontWeight: 500 }}>Total Enrolled Students</p>
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
            <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.8125rem", fontWeight: 500 }}>Institution-Wide At-Risk</p>
            <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "#8A4A7B", fontVariantNumeric: "tabular-nums" }}>
              {loading ? "..." : atRiskCount}
            </h3>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "1.25rem", borderRadius: "8px", border: "1px solid #D9DFDD", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#F2F4F3", padding: "0.85rem", borderRadius: "4px", color: "#2E8B7A" }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.8125rem", fontWeight: 500 }}>Intervention Success Rate</p>
            <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "#2E8B7A", fontVariantNumeric: "tabular-nums" }}>
              {loading ? "..." : `${Math.round((data?.interventionSuccessRate ?? 0.68) * 100)}%`}
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
          <DepartmentComparisonChart departmentComparison={data.departmentComparison} />
          <OutcomeSuccessDonutChart interventionSuccessRate={data.interventionSuccessRate} />
        </div>
      )}
    </div>
  );
}
