"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RiskSnapshot, RiskBand } from "@academic-risk-radar/shared-types";
import { StudentProfileCard } from "./components/StudentProfileCard";
import { PersonalInfoCard } from "./components/PersonalInfoCard";
import { MetricsSummaryCards } from "./components/MetricsSummaryCards";
import { FactorBreakdownList } from "./components/FactorBreakdownList";
import { SubjectAttendanceCard } from "./components/SubjectAttendanceCard";
import { AssessmentHistoryTable, AssessmentRecordItem } from "./components/AssessmentHistoryTable";
import { StudentRiskSkeleton } from "./components/StudentRiskSkeleton";
import { StudentRiskEmpty } from "./components/StudentRiskEmpty";
import { StudentRiskError } from "./components/StudentRiskError";

const API_BASE = "/api/v1";

interface StudentSession {
  id: string;
  name: string;
  email: string;
  role: string;
  identityId?: string;
  departmentId?: string;
  sectionIds?: string[];
}

interface AcademicProfile {
  studentId: string;
  attendance?: {
    totalSessions: number;
    attendanceRate: number;
    subjectBreakdown?: Array<{
      courseId: string;
      percentage: number;
    }>;
  };
  assessments?: {
    totalAssessments: number;
    averageScoreRatio: number;
    records?: AssessmentRecordItem[];
  };
  computedMetrics: {
    attendanceRate: number;
    assessmentAvg: number;
    missingAssignmentsRatio: number;
    lmsEngagementRatio: number;
  };
}

export default function StudentRiskPage() {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [profile, setProfile] = useState<AcademicProfile | null>(null);
  const [risk, setRisk] = useState<RiskSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "factors">("overview");

  const loadStudentData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch authenticated session
      const meRes = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      if (!meRes.ok) {
        throw new Error("Authentication required. Please log in as a student to view your academic risk standing.");
      }
      const meData = await meRes.json();
      const currentUser: StudentSession = meData.user;
      setSession(currentUser);

      const targetStudentId = currentUser.identityId || currentUser.id;
      if (!targetStudentId) {
        throw new Error("No student ID linked to this institutional account.");
      }

      // 2. Concurrently fetch profile and risk snapshot
      const [profileRes, riskRes] = await Promise.all([
        fetch(`${API_BASE}/students/${targetStudentId}/profile`, { credentials: "include" }),
        fetch(`${API_BASE}/students/${targetStudentId}/risk`, { credentials: "include" }),
      ]);

      if (profileRes.ok) {
        const pData = await profileRes.json();
        setProfile(pData.profile);
      }

      if (riskRes.status === 404) {
        setRisk(null); // Newly enrolled student or no snapshot yet
      } else if (!riskRes.ok) {
        const rErr = await riskRes.json().catch(() => ({}));
        throw new Error(rErr.error || `Failed to fetch risk calculation (HTTP ${riskRes.status})`);
      } else {
        const rData = await riskRes.json();
        setRisk(rData);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load student standing.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);

  if (loading) {
    return <StudentRiskSkeleton />;
  }

  if (error) {
    return <StudentRiskError message={error} onRetry={loadStudentData} />;
  }

  const studentName = session?.name || "Student";
  const studentId = session?.identityId || session?.id || "N/A";
  const section = session?.sectionIds?.[0] || "SEC-CSE-101";
  const department = session?.departmentId || "DEP-CSE";

  if (!risk) {
    return (
      <StudentRiskEmpty
        onRefresh={loadStudentData}
        studentName={studentName}
        enrolmentId={studentId}
      />
    );
  }

  // Derived metrics from real API responses
  const attendanceRate = profile?.computedMetrics?.attendanceRate ?? 1.0;
  const attendancePct = Math.round(attendanceRate * 100);
  const assessmentAvg = profile?.computedMetrics?.assessmentAvg ?? 0.8;
  const cgpa = (assessmentAvg * 10).toFixed(2);
  const rawRiskScore = (risk.factors || []).reduce((acc, f) => acc + f.contribution, 0);
  const riskPct = Math.round(rawRiskScore * 100);
  const band: RiskBand = risk.band;

  return (
    <div
      style={{
        fontFamily: "var(--font-atkinson, system-ui, sans-serif)",
        color: "#1B2A33",
      }}
    >
      <StudentProfileCard
        name={studentName}
        enrolmentId={studentId}
        programme="B.Tech (Computer Science & Engineering)"
        section={section}
        cgpa={cgpa}
        attendancePct={attendancePct}
        band={band}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        computedAt={risk.computedAt}
        modelVersion={risk.modelVersion}
      />

      {activeTab === "overview" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.25rem" }}>
            <PersonalInfoCard
              name={studentName}
              email={session?.email || "student@radar.edu"}
              section={section}
              department={department}
              enrolmentId={studentId}
              modelVersion={risk.modelVersion}
              riskScore={riskPct}
              band={band}
            />
            <MetricsSummaryCards
              riskScore={riskPct}
              rawRiskScore={rawRiskScore}
              band={band}
              attendanceRate={attendanceRate}
              attendancePct={attendancePct}
              assessmentAvg={assessmentAvg}
              cgpa={cgpa}
            />
          </div>

          <SubjectAttendanceCard
            overallPct={attendancePct}
            subjectBreakdown={profile?.attendance?.subjectBreakdown}
          />

          <AssessmentHistoryTable
            records={profile?.assessments?.records}
            cgpa={cgpa}
          />
        </div>
      ) : (
        <FactorBreakdownList
          factors={risk.factors || []}
          totalScore={rawRiskScore}
          riskScore={riskPct}
          band={band}
        />
      )}
    </div>
  );
}
