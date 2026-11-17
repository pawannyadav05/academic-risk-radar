"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { BookOpen, UserCheck } from "lucide-react";
import { Tabs } from "@/app/components/Tabs";
import { PageHeader } from "@/app/components/PageHeader";
import { Toast } from "@/app/(mentor)/inbox/components/Toast";
import { SectionOverviewStats } from "./components/SectionOverviewStats";
import { StudentsNeedingSupportNotice } from "./components/StudentsNeedingSupportNotice";
import { UploadStepOneClass } from "./components/UploadStepOneClass";
import { UploadStepTwoType } from "./components/UploadStepTwoType";
import { UploadStepThreeData } from "./components/UploadStepThreeData";
import { CsvPreviewTable } from "./components/CsvPreviewTable";
import { SubmitActionBar } from "./components/SubmitActionBar";
import { ImportResultPanel } from "./components/ImportResultPanel";
import { WhereStudentsFallingBehindChart } from "./components/WhereStudentsFallingBehindChart";
import { TeachingAssignmentItem } from "./components/TeachingDropdowns";
import { ImportFeedback } from "./components/ImportFeedbackBanner";

const API_BASE = "/api/v1";

interface SectionAnalytics {
  sectionId: string;
  totalStudents: number;
  bandDistribution: { low: number; moderate: number; high: number; critical: number };
  attendanceDeficitDistribution: Array<{ bucket: string; count: number }>;
}

const SAMPLE_CSV: Record<string, string> = {
  attendance: `studentId,courseId,percentage
12409922,CS101,65
12409921,CS101,88
12409923,CS101,92
12409924,CS101,85
12409925,CS101,90`,
  assessment: `studentId,courseId,type,score,maxScore,date
12409922,CS101,Quiz 2,14,20,2026-03-20T10:00:00Z
12409921,CS101,Quiz 2,18,20,2026-03-20T10:00:00Z
12409923,CS101,Quiz 2,19,20,2026-03-20T10:00:00Z
12409924,CS101,Quiz 2,16,20,2026-03-20T10:00:00Z
12409925,CS101,Quiz 2,17,20,2026-03-20T10:00:00Z`,
};

export default function InstructorSectionsPage() {
  const [teachingAssignments, setTeachingAssignments] = useState<TeachingAssignmentItem[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("CS101");
  const [sectionId, setSectionId] = useState<string>("SEC-CSE-101");
  const [isRectify, setIsRectify] = useState<boolean>(false);

  const [data, setData] = useState<SectionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSubmissionDate, setLastSubmissionDate] = useState<string | null>(null);

  const [importSource, setImportSource] = useState<"attendance" | "assessment">("attendance");
  const [csvContent, setCsvContent] = useState<string>(SAMPLE_CSV.attendance);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<ImportFeedback | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function initInstructorData() {
      try {
        const assignRes = await fetch(`${API_BASE}/instructor/teaching-assignments`, {
          credentials: "include",
        });
        if (assignRes.ok) {
          const body = await assignRes.json();
          if (Array.isArray(body.assignments) && body.assignments.length > 0) {
            setTeachingAssignments(body.assignments);
            const first = body.assignments[0];
            setSelectedSubject(first.subjectCode);
            setSectionId(first.sectionId);
          }
        }
      } catch (err) {
        console.warn("Could not fetch teaching assignments:", err);
      }
    }
    initInstructorData();
  }, []);

  const fetchAnalytics = useCallback(async () => {
    if (!sectionId) return;
    setLoading(true);
    try {
      // Primary contract: /analytics/section/:id, fallback: /sections/:id/analytics
      let res = await fetch(`${API_BASE}/analytics/section/${sectionId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        res = await fetch(`${API_BASE}/sections/${sectionId}/analytics`, {
          credentials: "include",
        });
      }
      if (res.ok) {
        const json = await res.json();
        setData(json.data || json);
      }
    } catch (err: unknown) {
      console.warn("Could not load section analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Toast timer
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSubjectChange = (newSubject: string) => {
    setSelectedSubject(newSubject);
    let sample = SAMPLE_CSV[importSource] || "";
    sample = sample.replace(/CS101/g, newSubject);
    setCsvContent(sample);
  };

  const handleSourceChange = (src: "attendance" | "assessment") => {
    setImportSource(src);
    let sample = SAMPLE_CSV[src] || "";
    if (selectedSubject) {
      sample = sample.replace(/CS101/g, selectedSubject);
    }
    setCsvContent(sample);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setCsvContent(content);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    let template = SAMPLE_CSV[importSource] || "";
    if (selectedSubject) {
      template = template.replace(/CS101/g, selectedSubject);
    }
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${importSource}-${selectedSubject}-${sectionId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const rowCount = useMemo(() => {
    const lines = csvContent.split("\n").map((l) => l.trim()).filter(Boolean);
    return Math.max(0, lines.length - 1);
  }, [csvContent]);

  const handleSubmitData = async () => {
    if (!csvContent.trim()) {
      setFeedback({ status: "error", message: "CSV content cannot be empty." });
      setToast({ message: "CSV content cannot be empty.", type: "error" });
      return;
    }

    setUploading(true);
    setFeedback(null);

    try {
      const res = await fetch(`${API_BASE}/sections/${sectionId}/imports/${importSource}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          csvData: csvContent.trim(),
          subjectCode: selectedSubject,
          rectify: isRectify,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body.error || `Upload failed with HTTP ${res.status}`);
      }

      const now = new Date();
      const formattedSubmissionTime = now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + " at " + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setLastSubmissionDate(formattedSubmissionTime);

      setFeedback({
        status: "success",
        message: isRectify
          ? `Rectification successful: Updated ${importSource} records for ${selectedSubject} in ${sectionId}.`
          : `Successfully processed ${importSource} batch for ${selectedSubject} in ${sectionId}.`,
        insertedCount: body.insertedCount,
        quarantinedCount: body.quarantinedCount,
        affectedStudents: body.affectedStudents,
        scoringRecalculation: body.scoringRecalculation,
      });

      setToast({ message: "Risk scores updated", type: "success" });
      fetchAnalytics();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit academic data";
      setFeedback({ status: "error", message: msg });
      setToast({ message: msg, type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const totalAtRisk = data ? (data.bandDistribution.high ?? 0) + (data.bandDistribution.critical ?? 0) : 0;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 0", color: "var(--text)" }}>
      {/* Faculty Dual-Role Navigation */}
      <Tabs
        items={[
          {
            label: "Teaching section",
            href: "/sections",
            icon: BookOpen,
            active: true,
          },
          {
            label: "Mentee alerts & interventions",
            href: "/inbox",
            icon: UserCheck,
            active: false,
          },
        ]}
        ariaLabel="Faculty navigation"
      />

      {/* 1. Page Header */}
      <PageHeader
        breadcrumb={`Instructor / Section ${sectionId}`}
        title={`${selectedSubject}, Section ${sectionId}`}
        description="Submit attendance or assessment data and review how your section is doing."
      />

      {/* 2. Section Overview Stats (Above the Form) */}
      <SectionOverviewStats
        totalStudents={data?.totalStudents}
        totalNeedingSupport={totalAtRisk}
        lastSubmissionDate={lastSubmissionDate}
        loading={loading}
      />

      {/* 6. Students Needing Support Notice */}
      <StudentsNeedingSupportNotice
        sectionId={sectionId}
        totalAtRisk={totalAtRisk}
      />

      {/* Submission Feedback Panel */}
      <ImportResultPanel feedback={feedback} onDismiss={() => setFeedback(null)} />

      {/* 3. Upload Flow 3-Step Card */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "1.75rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Step 1: Choose class */}
        <UploadStepOneClass
          assignments={teachingAssignments}
          selectedSubject={selectedSubject}
          selectedSection={sectionId}
          onSubjectChange={handleSubjectChange}
          onSectionChange={setSectionId}
          disabled={uploading}
        />

        {/* Step 2: Choose data type */}
        <UploadStepTwoType
          importSource={importSource}
          onSourceChange={handleSourceChange}
          isRectify={isRectify}
          onRectifyChange={setIsRectify}
          selectedSubject={selectedSubject}
          disabled={uploading}
        />

        {/* Step 3: Add data */}
        <UploadStepThreeData
          csvContent={csvContent}
          onCsvContentChange={setCsvContent}
          onFileUpload={handleFileUpload}
          onDownloadTemplate={handleDownloadTemplate}
          importSource={importSource}
          selectedSubject={selectedSubject}
          disabled={uploading}
        />

        {/* 4. CSV Preview and client-side validation */}
        <CsvPreviewTable
          csvContent={csvContent}
          selectedSubject={selectedSubject}
          importSource={importSource}
        />

        {/* 5. Sticky Submit Action Bar */}
        <SubmitActionBar
          importSource={importSource}
          selectedSubject={selectedSubject}
          rowCount={rowCount}
          uploading={uploading}
          isRectify={isRectify}
          onSubmit={handleSubmitData}
        />
      </div>

      {/* 7. Distribution Chart: Where students are falling behind */}
      <WhereStudentsFallingBehindChart
        attendanceDeficitDistribution={data?.attendanceDeficitDistribution}
      />

      {/* Toast popup */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
