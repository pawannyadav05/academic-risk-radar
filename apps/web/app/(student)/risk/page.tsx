"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RiskSnapshot, RiskBand } from "@academic-risk-radar/shared-types";
import { ProfileStrip } from "./components/ProfileStrip";
import { AcademicStandingHero } from "./components/AcademicStandingHero";
import { StatTiles } from "./components/StatTiles";
import { WhatThisMeansPanel } from "./components/WhatThisMeansPanel";
import { SubjectAttendanceCard } from "./components/SubjectAttendanceCard";
import { AssessmentHistoryTable, AssessmentRecordItem } from "./components/AssessmentHistoryTable";
import { FactorBreakdownList } from "./components/FactorBreakdownList";
import { StudentRiskSkeleton } from "./components/StudentRiskSkeleton";
import { StudentRiskEmpty } from "./components/StudentRiskEmpty";
import { StudentRiskError } from "./components/StudentRiskError";
import { PageHeader } from "@/app/components/PageHeader";
import { Tabs } from "@/app/components/Tabs";

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
  cgpa?: number;
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

  const studentId = session?.identityId || session?.id || "N/A";
  const studentName =
    session?.name ||
    (profile as any)?.name ||
    (profile as any)?.studentName ||
    studentId;
  const section = session?.sectionIds?.[0] || "SEC-CSE-101";

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
  const assessmentAvg = profile?.computedMetrics?.assessmentAvg ?? 0.75;
  const assessmentAvgPct = Math.round(assessmentAvg * 100);
  const cgpa = (profile?.cgpa ?? 7.4).toFixed(2);
  const rawRiskScore = (risk.factors || []).reduce((acc, f) => acc + f.contribution, 0);
  const riskPct = Math.round(rawRiskScore * 100);
  const band: RiskBand = risk.band;

  const weakSubjects = (profile?.attendance?.subjectBreakdown || []).filter((s) => s.percentage < 75);

  return (
    <div
      style={{
        fontFamily: "var(--font-family)",
        color: "var(--text)",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <PageHeader
        breadcrumb="Student / Academic standing"
        title="Academic Risk Standing"
        description="Transparent progress overview and factor breakdown for your enrolled courses."
      />

      {/* 1. Profile strip at top */}
      <ProfileStrip
        name={studentName}
        enrolmentId={studentId}
        programme="B.Tech (Computer Science & Engineering)"
        section={section}
        computedAt={risk.computedAt}
      />

      {/* Tabs: Standing overview & Factor breakdown */}
      <Tabs
        items={[
          {
            label: "Standing overview",
            active: activeTab === "overview",
            onClick: () => setActiveTab("overview"),
          },
          {
            label: "Factor breakdown",
            active: activeTab === "factors",
            onClick: () => setActiveTab("factors"),
          },
        ]}
        ariaLabel="Student standing tabs"
      />

      {activeTab === "overview" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* 2 & 3. Hero Card + Two Compact Stat Tiles side by side */}
          <div
            className="student-hero-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "1.25rem",
            }}
          >
            <AcademicStandingHero score={riskPct} band={band} />
            <StatTiles attendancePct={attendancePct} cgpa={cgpa} />
          </div>

          {/* 4. What this means & Suggested next steps panel */}
          <WhatThisMeansPanel
            band={band}
            attendancePct={attendancePct}
            assessmentAvgPct={assessmentAvgPct}
            weakSubjects={weakSubjects}
          />

          {/* 5. Subject attendance with 75% target marker and updated copy */}
          <SubjectAttendanceCard
            overallPct={attendancePct}
            subjectBreakdown={profile?.attendance?.subjectBreakdown}
          />

          {/* 6. Recorded assessments data table with colored chips and horiz scroll */}
          <AssessmentHistoryTable
            records={profile?.assessments?.records}
            assessmentAvgPct={assessmentAvgPct}
          />
        </div>
      ) : (
        /* 7. Factor breakdown tab */
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
