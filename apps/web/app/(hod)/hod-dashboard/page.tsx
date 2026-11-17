"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, Bell, FileText } from "lucide-react";
import { Tabs } from "@/app/components/Tabs";
import { PageHeader } from "@/app/components/PageHeader";
import { HodKpiRow } from "./components/HodKpiRow";
import { HodErrorBanner } from "./components/HodErrorBanner";
import DepartmentRiskBarChart from "./components/DepartmentRiskBarChart";
import SlaEscalationLineChart from "./components/SlaEscalationLineChart";
import { HodSupervisedAlertsTab } from "./components/HodSupervisedAlertsTab";
import { HodInterventionLogsTab } from "./components/HodInterventionLogsTab";
import { Alert, Intervention } from "@academic-risk-radar/shared-types";

const API_BASE = "/api/v1";

interface DepartmentAnalytics {
  departmentId: string;
  totalStudents: number;
  bandDistribution: { low: number; moderate: number; high: number; critical: number };
  recentTrends?: Array<{ week: string; bandCounts: { low: number; moderate: number; high: number; critical: number } }>;
  escalatedAlerts: number;
}

export default function HodDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "alerts" | "interventions">("overview");
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [data, setData] = useState<DepartmentAnalytics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  // Initialize department from current authenticated user
  const initUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      if (res.ok) {
        const body = await res.json();
        const dept = body.user?.departmentId || "DEP-CSE";
        setDepartmentId(dept);
        return dept;
      }
    } catch {}
    setDepartmentId("DEP-CSE");
    return "DEP-CSE";
  }, []);

  const fetchAnalytics = useCallback(async (dept: string) => {
    setLoading(true);
    setError(null);
    setStatusCode(null);
    try {
      const [analyticsRes, alertsRes, interventionsRes] = await Promise.all([
        fetch(`${API_BASE}/analytics/department/${dept}`, { credentials: "include" }),
        fetch(`${API_BASE}/alerts`, { credentials: "include" }),
        fetch(`${API_BASE}/interventions`, { credentials: "include" }),
      ]);

      if (!analyticsRes.ok) {
        setStatusCode(analyticsRes.status);
        throw new Error(`HTTP ${analyticsRes.status}: Failed to load department metrics`);
      }

      const json = await analyticsRes.json();
      setData(json);

      if (alertsRes.ok) {
        const aJson = await alertsRes.json();
        setAlerts(aJson.alerts || []);
      }
      if (interventionsRes.ok) {
        const iJson = await interventionsRes.json();
        setInterventions(iJson.interventions || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load department analytics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initUser().then((dept) => {
      if (dept) fetchAnalytics(dept);
    });
  }, [initUser, fetchAnalytics]);

  const atRiskCount = data ? (data.bandDistribution.high || 0) + (data.bandDistribution.critical || 0) : 0;
  const currentDept = departmentId || "DEP-CSE";

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 0", color: "var(--text)" }}>
      {/* Hierarchy Navigation Tabs */}
      <Tabs
        items={[
          {
            label: "Department overview",
            active: activeTab === "overview",
            onClick: () => setActiveTab("overview"),
            title: "Department metrics and risk distribution",
            icon: LayoutDashboard,
          },
          {
            label: "Supervised alerts & escalations",
            active: activeTab === "alerts",
            onClick: () => setActiveTab("alerts"),
            count: alerts.length > 0 ? alerts.length : undefined,
            title: `${alerts.length} open alerts across department mentors`,
            icon: Bell,
          },
          {
            label: "Mentor intervention logs",
            active: activeTab === "interventions",
            onClick: () => setActiveTab("interventions"),
            count: interventions.length > 0 ? interventions.length : undefined,
            title: `${interventions.length} logged mentor intervention sessions`,
            icon: FileText,
          },
        ]}
        ariaLabel="Department navigation"
      />

      <PageHeader
        breadcrumb={`Head of Department / ${currentDept}`}
        title={activeTab === "overview" ? "Department overview" : activeTab === "alerts" ? "Supervised alerts & escalations" : "Mentor intervention logs"}
        description="Risk distribution and 48-hour alert escalations for your department."
      />

      {/* KPI metric cards (Shown across HoD view) */}
      <HodKpiRow
        totalStudents={data?.totalStudents}
        atRiskCount={atRiskCount}
        escalatedAlerts={data?.escalatedAlerts}
        loading={loading}
        hasError={!!error}
      />

      {error && (
        <HodErrorBanner
          error={error}
          statusCode={statusCode}
          onRetry={() => fetchAnalytics(currentDept)}
        />
      )}

      {/* Active Tab Content */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.5rem" }}>
          <DepartmentRiskBarChart bandDistribution={data?.bandDistribution} />
          <SlaEscalationLineChart escalatedAlerts={data?.escalatedAlerts} recentTrends={data?.recentTrends} />
        </div>
      )}

      {activeTab === "alerts" && (
        <HodSupervisedAlertsTab
          alerts={alerts}
          loading={loading}
          onRefresh={() => fetchAnalytics(currentDept)}
        />
      )}

      {activeTab === "interventions" && (
        <HodInterventionLogsTab
          interventions={interventions}
          loading={loading}
        />
      )}
    </div>
  );
}
