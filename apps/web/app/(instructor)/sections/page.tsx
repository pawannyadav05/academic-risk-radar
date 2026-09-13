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
import { Users, AlertTriangle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

const BAND_COLORS = {
  low: "#059669",
  moderate: "#d97706",
  high: "#dc2626",
  critical: "#7f1d1d",
};

interface SectionAnalytics {
  sectionId: string;
  totalStudents: number;
  bandDistribution: { low: number; moderate: number; high: number; critical: number };
  attendanceDeficitDistribution: Array<{ bucket: string; count: number }>;
}

export default function InstructorSectionsPage() {
  const [data, setData] = useState<SectionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionId = "CS101"; // Hardcoded for demo purposes

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/analytics/section/${sectionId}`, {
        headers: {
          "x-user-id": "instructor-demo-001",
          "x-user-role": "instructor",
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load section analytics");
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

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

  // Format data for Recharts
  const pieData = [
    { name: "Low Risk", value: data.bandDistribution.low, color: BAND_COLORS.low },
    { name: "Moderate Risk", value: data.bandDistribution.moderate, color: BAND_COLORS.moderate },
    { name: "High Risk", value: data.bandDistribution.high, color: BAND_COLORS.high },
    { name: "Critical Risk", value: data.bandDistribution.critical, color: BAND_COLORS.critical },
  ].filter((item) => item.value > 0);

  const barData = data.attendanceDeficitDistribution;

  const totalAtRisk = data.bandDistribution.high + data.bandDistribution.critical;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.875rem", color: "#1e293b" }}>Section Dashboard: {data.sectionId}</h1>
        <p style={{ margin: "0.25rem 0 0", color: "#64748b" }}>Overview of student risk and engagement for this section.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#eff6ff", padding: "1rem", borderRadius: "50%", color: "#3b82f6" }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>Total Students</p>
            <h3 style={{ margin: 0, fontSize: "1.5rem", color: "#1e293b" }}>{data.totalStudents}</h3>
          </div>
        </div>

        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#fee2e2", padding: "1rem", borderRadius: "50%", color: "#dc2626" }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>Students At Risk (High/Critical)</p>
            <h3 style={{ margin: 0, fontSize: "1.5rem", color: "#1e293b" }}>{totalAtRisk}</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}>
        {/* Risk Breakdown Pie Chart */}
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#1e293b" }}>Section Risk Breakdown</h3>
          <div style={{ height: "300px" }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Students`, "Count"]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#94a3b8" }}>
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Attendance Deficit Bar Chart */}
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#1e293b" }}>Attendance Deficit Distribution</h3>
          <div style={{ height: "300px" }}>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="bucket" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#94a3b8" }}>
                No data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
