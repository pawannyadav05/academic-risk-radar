"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { UploadCloud, Download, BookOpen, UserCheck } from "lucide-react";
import DeficitDistributionChart from "./components/DeficitDistributionChart";
import { TeachingDropdowns, TeachingAssignmentItem } from "./components/TeachingDropdowns";
import { AcademicDataUploadForm } from "./components/AcademicDataUploadForm";
import { ImportFeedbackBanner, ImportFeedback } from "./components/ImportFeedbackBanner";
import { SectionKpiCards } from "./components/SectionKpiCards";

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
  const [error, setError] = useState<string | null>(null);

  const [importSource, setImportSource] = useState<"attendance" | "assessment">("attendance");
  const [csvContent, setCsvContent] = useState<string>(SAMPLE_CSV.attendance);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<ImportFeedback | null>(null);

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
        console.warn("Could not load teaching assignments:", err);
      }
    }
    initInstructorData();
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/analytics/section/${sectionId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to load section analytics (HTTP ${res.status})`);
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load section analytics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleSourceChange = (source: "attendance" | "assessment") => {
    setImportSource(source);
    setCsvContent(SAMPLE_CSV[source] || "");
    setFeedback(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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

  const handleSubmitData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) {
      setFeedback({ status: "error", message: "CSV content cannot be empty." });
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

      fetchAnalytics();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit academic data";
      setFeedback({
        status: "error",
        message: msg,
      });
    } finally {
      setUploading(false);
    }
  };

  const totalAtRisk = data ? data.bandDistribution.high + data.bandDistribution.critical : 0;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem", color: "#1B2A33" }}>
      {/* Faculty Dual-Role Navigation */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid #D9DFDD", paddingBottom: "0.5rem" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.75rem", borderRadius: "4px", fontSize: "0.8125rem", fontWeight: 600, background: "#FFFFFF", color: "#2D5BA3", border: "1px solid #D9DFDD", borderBottom: "2px solid #2D5BA3" }}>
          <BookOpen size={14} />
          Teaching section (Instructor)
        </span>
        <Link href="/inbox" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.75rem", borderRadius: "4px", fontSize: "0.8125rem", fontWeight: 500, color: "#5B6B75", textDecoration: "none" }}>
          <UserCheck size={14} />
          Mentee alerts &amp; interventions (Mentor)
        </Link>
      </div>

      {/* Header and section summary */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.5rem", fontWeight: 700, color: "#1B2A33" }}>
          Section {sectionId} — {selectedSubject}
        </h1>
        <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.875rem" }}>
          Upload attendance or marks with dependent subject verification and rectify options.
        </p>
      </div>

      {/* Academic Data Submission Panel */}
      <div style={{ background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "8px", padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ background: "#F2F4F3", color: "#2D5BA3", padding: "0.5rem", borderRadius: "4px" }}>
              <UploadCloud size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600, color: "#1B2A33" }}>Academic data submission</h2>
              <p style={{ margin: "0.15rem 0 0", color: "#5B6B75", fontSize: "0.8125rem" }}>
                Select subject and section, then submit or rectify records.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            style={{ background: "#FFFFFF", border: "1px solid #D9DFDD", color: "#5B6B75", padding: "0.45rem 0.85rem", borderRadius: "4px", fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Download size={14} /> Sample CSV template
          </button>
        </div>

        {/* Dynamic Dependent Dropdowns & Rectify Mode */}
        <TeachingDropdowns
          assignments={teachingAssignments}
          selectedSubject={selectedSubject}
          selectedSection={sectionId}
          onSubjectChange={setSelectedSubject}
          onSectionChange={setSectionId}
          isRectify={isRectify}
          onRectifyChange={setIsRectify}
          disabled={uploading}
        />

        {/* Live Feedback Banner */}
        <ImportFeedbackBanner feedback={feedback} />

        {/* Data Upload Form */}
        <AcademicDataUploadForm
          importSource={importSource}
          onSourceChange={handleSourceChange}
          csvContent={csvContent}
          onCsvContentChange={setCsvContent}
          onFileUpload={handleFileUpload}
          onSubmit={handleSubmitData}
          uploading={uploading}
          isRectify={isRectify}
          selectedSubject={selectedSubject}
        />
      </div>

      {/* KPI metrics cards */}
      <SectionKpiCards totalStudents={data?.totalStudents ?? 0} totalAtRisk={totalAtRisk} />

      {/* Charts */}
      {data && (
        <DeficitDistributionChart
          attendanceDeficitDistribution={data.attendanceDeficitDistribution}
        />
      )}
    </div>
  );
}
