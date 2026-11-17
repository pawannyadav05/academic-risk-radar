"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { DeanKpiRow } from "./components/DeanKpiRow";
import { DeanErrorBanner } from "./components/DeanErrorBanner";
import DepartmentComparisonChart from "./components/DepartmentComparisonChart";
import OutcomeSuccessDonutChart from "./components/OutcomeSuccessDonutChart";
import { DeanDepartmentsAttentionTable } from "./components/DeanDepartmentsAttentionTable";

const API_BASE = "/api/v1";

interface RawDeptEntry {
  departmentId?: string;
  name?: string;
  bandCounts?: { low?: number; moderate?: number; high?: number; critical?: number };
  department?: string;
  totalStudents?: number;
  atRisk?: number;
}

interface InstitutionAnalytics {
  totalStudents: number;
  bandDistribution: { low: number; moderate: number; high: number; critical: number };
  departmentComparison?: RawDeptEntry[];
  interventionSuccessRate: number;
}

export default function DeanDashboardPage() {
  const [data, setData] = useState<InstitutionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStatusCode(null);
    try {
      const res = await fetch(`${API_BASE}/analytics/institution`, {
        credentials: "include",
      });
      if (!res.ok) {
        setStatusCode(res.status);
        throw new Error(`HTTP ${res.status}: Failed to load institution metrics`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load institution analytics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const atRiskCount = data ? (data.bandDistribution.high || 0) + (data.bandDistribution.critical || 0) : 0;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 0", color: "var(--text)" }}>
      <PageHeader
        breadcrumb="Dean"
        title="Institution-wide academic risk"
        description="Retention risk and intervention results across departments."
      />

      {/* KPI row */}
      <DeanKpiRow
        totalStudents={data?.totalStudents}
        atRiskCount={atRiskCount}
        interventionSuccessRate={data?.interventionSuccessRate}
        loading={loading}
        hasError={!!error}
      />

      {error && (
        <DeanErrorBanner
          error={error}
          statusCode={statusCode}
          onRetry={fetchAnalytics}
        />
      )}

      {/* Visual Recharts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.5rem" }}>
        <DepartmentComparisonChart departmentComparison={data?.departmentComparison} />
        <OutcomeSuccessDonutChart interventionSuccessRate={data?.interventionSuccessRate} />
      </div>

      {/* Departments needing attention table */}
      <DeanDepartmentsAttentionTable departmentComparison={data?.departmentComparison} />
    </div>
  );
}
