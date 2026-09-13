"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Users, TrendingUp } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

const BAND_COLORS = {
  low: "#059669",
  moderate: "#d97706",
  high: "#dc2626",
  critical: "#7f1d1d",
};

interface InstitutionAnalytics {
  totalStudents: number;
  bandDistribution: { low: number; moderate: number; high: number; critical: number };
  departmentComparison: Array<{ departmentId: string; name: string; bandCounts: any }>;
  interventionSuccessRate: number;
  weeklyTrends: Array<{ week: string; bandCounts: any }>;
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
        headers: {
          "x-user-id": "dean-demo-001",
          "x-user-role": "dean",
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
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

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem", color: "#64748b" }}>
        Loading dashboard...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ background: "#fee2e2", color: "#dc2626", padding: "1rem", borderRadius: "8px" }}>
        {error || "Failed to load data"}
      </div>
    );
  }

  // Format data for Stacked Bar Chart
  const deptData = data.departmentComparison.map((dept) => ({
    name: dept.name || dept.departmentId,
    Low: dept.bandCounts.low || 0,
    Moderate: dept.bandCounts.moderate || 0,
    High: dept.bandCounts.high || 0,
    Critical: dept.bandCounts.critical || 0,
  }));

  // Format data for Donut Chart (Intervention Success Rate)
  const successRate = data.interventionSuccessRate || 0; // percentage
  const donutData = [
    { name: "Improved", value: successRate, color: "#3b82f6" },
    { name: "No Change / Deteriorated", value: 100 - successRate, color: "#e2e8f0" },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.875rem", color: "#1e293b" }}>Institutional Overview Dashboard</h1>
        <p style={{ margin: "0.25rem 0 0", color: "#64748b" }}>High-level institutional risk trends and cross-department comparisons.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#eff6ff", padding: "1rem", borderRadius: "50%", color: "#3b82f6" }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>Total Enrolled Students</p>
            <h3 style={{ margin: 0, fontSize: "1.5rem", color: "#1e293b" }}>{data.totalStudents}</h3>
          </div>
        </div>

        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#dcfce7", padding: "1rem", borderRadius: "50%", color: "#16a34a" }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>Intervention Success Rate</p>
            <h3 style={{ margin: 0, fontSize: "1.5rem", color: "#1e293b" }}>{successRate.toFixed(1)}%</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}>
        {/* Cross-Department Comparison (Stacked Bar) */}
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", gridColumn: "1 / -1" }}>
          <h3 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#1e293b" }}>Cross-Department Risk Comparison</h3>
          <div style={{ height: "400px" }}>
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} />
                  <Legend />
                  <Bar dataKey="Critical" stackId="a" fill={BAND_COLORS.critical} />
                  <Bar dataKey="High" stackId="a" fill={BAND_COLORS.high} />
                  <Bar dataKey="Moderate" stackId="a" fill={BAND_COLORS.moderate} />
                  <Bar dataKey="Low" stackId="a" fill={BAND_COLORS.low} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#94a3b8" }}>
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Intervention Success Rate Donut */}
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#1e293b" }}>Intervention Outcomes</h3>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Rate"]} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
