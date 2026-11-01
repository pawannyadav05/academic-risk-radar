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
import { Users, AlertTriangle, UploadCloud, CheckCircle2, Download, RefreshCw } from "lucide-react";

const API_BASE = "/api/v1";

const BAND_COLORS = {
  low: "#2E8B7A",
  moderate: "#D49A1F",
  high: "#8A4A7B",
  critical: "#5B6B75",
};

interface SectionAnalytics {
  sectionId: string;
  totalStudents: number;
  bandDistribution: { low: number; moderate: number; high: number; critical: number };
  attendanceDeficitDistribution: Array<{ bucket: string; count: number }>;
}

interface ImportFeedback {
  status: "success" | "error";
  message: string;
  insertedCount?: number;
  quarantinedCount?: number;
  affectedStudents?: number;
  scoringRecalculation?: string;
}

const SAMPLE_CSV: Record<string, string> = {
  attendance: `studentId,courseId,percentage
12409922,CS101,65
12409921,CS101,88
12409923,CS101,92
12409924,CS101,85
12409925,CS101,90`,
  attendance_cs102: `studentId,courseId,percentage
12409922,CS102,75
12409921,CS102,91
12409923,CS102,89
12409924,CS102,94
12409925,CS102,88`,
  assessment: `studentId,courseId,type,score,maxScore,date
12409922,CS101,Quiz 2,14,20,2026-03-20T10:00:00Z
12409921,CS101,Quiz 2,18,20,2026-03-20T10:00:00Z
12409923,CS101,Quiz 2,19,20,2026-03-20T10:00:00Z
12409924,CS101,Quiz 2,16,20,2026-03-20T10:00:00Z
12409925,CS101,Quiz 2,17,20,2026-03-20T10:00:00Z`,
  assessment_cs102: `studentId,courseId,type,score,maxScore,date
12409922,CS102,Lab 2,36,50,2026-03-22T14:00:00Z
12409921,CS102,Lab 2,47,50,2026-03-22T14:00:00Z
12409923,CS102,Lab 2,42,50,2026-03-22T14:00:00Z
12409924,CS102,Lab 2,49,50,2026-03-22T14:00:00Z
12409925,CS102,Lab 2,44,50,2026-03-22T14:00:00Z`,
};

export default function InstructorSectionsPage() {
  const [assignedSections, setAssignedSections] = useState<string[]>(["SEC-CSE-101"]);
  const [sectionId, setSectionId] = useState<string>("SEC-CSE-101");
  const [data, setData] = useState<SectionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [importSource, setImportSource] = useState<"attendance" | "assessment">("attendance");
  const [csvContent, setCsvContent] = useState<string>(SAMPLE_CSV.attendance);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<ImportFeedback | null>(null);

  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
        if (res.ok) {
          const body = await res.json();
          if (body.user?.sectionIds && body.user.sectionIds.length > 0) {
            setAssignedSections(body.user.sectionIds);
            setSectionId(body.user.sectionIds[0]);
          }
        }
      } catch (err) {
        console.warn("Could not load instructor session; defaulting to SEC-CSE-101", err);
      }
    }
    initSession();
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
    } catch (err: any) {
      setError(err.message || "Failed to load section analytics");
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
    const template = SAMPLE_CSV[importSource] || "";
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${importSource}-sample-${sectionId}.csv`);
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
        body: JSON.stringify({ csvData: csvContent.trim() }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body.error || `Upload failed with HTTP ${res.status}`);
      }

      setFeedback({
        status: "success",
        message: `Successfully processed ${importSource} batch for section ${sectionId}.`,
        insertedCount: body.insertedCount,
        quarantinedCount: body.quarantinedCount,
        affectedStudents: body.affectedStudents,
        scoringRecalculation: body.scoringRecalculation,
      });

      fetchAnalytics();
    } catch (err: any) {
      setFeedback({
        status: "error",
        message: err.message || "Failed to submit academic data",
      });
    } finally {
      setUploading(false);
    }
  };

  const pieData = data
    ? [
        { name: "Low Risk", value: data.bandDistribution.low, color: BAND_COLORS.low },
        { name: "Moderate Risk", value: data.bandDistribution.moderate, color: BAND_COLORS.moderate },
        { name: "High Risk", value: data.bandDistribution.high, color: BAND_COLORS.high },
        { name: "Critical Risk", value: data.bandDistribution.critical, color: BAND_COLORS.critical },
      ].filter((item) => item.value > 0)
    : [];

  const barData = data?.attendanceDeficitDistribution || [];
  const totalAtRisk = data ? data.bandDistribution.high + data.bandDistribution.critical : 0;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem", color: "#1B2A33" }}>
      {/* Header and section selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.5rem", fontWeight: 700, color: "#1B2A33" }}>Section {sectionId}</h1>
          <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.875rem" }}>Monitor student risk distribution and upload course performance data.</p>
        </div>

        {assignedSections.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.8125rem", color: "#5B6B75", fontWeight: 500 }}>Assigned section</span>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              style={{ background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "4px", padding: "0.4rem 0.75rem", fontSize: "0.875rem", fontWeight: 600, color: "#1B2A33", cursor: "pointer" }}
            >
              {assignedSections.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
        )}
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
              <p style={{ margin: "0.15rem 0 0", color: "#5B6B75", fontSize: "0.8125rem" }}>Submit attendance or assessment marks to update risk scoring and alerts.</p>
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

        {/* Live Feedback Banner */}
        {feedback && (
          <div
            style={{
              background: "#FFFFFF",
              border: `1px solid ${feedback.status === "success" ? "#2E8B7A" : "#8A4A7B"}`,
              color: feedback.status === "success" ? "#2E8B7A" : "#8A4A7B",
              padding: "0.875rem 1.25rem",
              borderRadius: "4px",
              marginBottom: "1.25rem",
              fontSize: "0.875rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, marginBottom: feedback.insertedCount !== undefined ? "0.4rem" : 0 }}>
              {feedback.status === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {feedback.message}
            </div>
            {feedback.insertedCount !== undefined && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.8125rem", marginTop: "0.25rem", color: "#5B6B75" }}>
                <span>Valid rows: <strong style={{ color: "#1B2A33" }}>{feedback.insertedCount}</strong></span>
                <span>Quarantined rows: <strong style={{ color: feedback.quarantinedCount ? "#8A4A7B" : "#1B2A33" }}>{feedback.quarantinedCount}</strong></span>
                <span>Students affected: <strong style={{ color: "#1B2A33" }}>{feedback.affectedStudents}</strong></span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmitData}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1B2A33" }}>Data source:</span>
              <div style={{ display: "inline-flex", background: "#F2F4F3", padding: "0.2rem", borderRadius: "4px", border: "1px solid #D9DFDD" }}>
                <button
                  type="button"
                  onClick={() => handleSourceChange("attendance")}
                  style={{
                    background: importSource === "attendance" ? "#FFFFFF" : "transparent",
                    color: importSource === "attendance" ? "#1B2A33" : "#5B6B75",
                    border: importSource === "attendance" ? "1px solid #D9DFDD" : "1px solid transparent",
                    borderRadius: "4px",
                    padding: "0.35rem 0.85rem",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Attendance
                </button>
                <button
                  type="button"
                  onClick={() => handleSourceChange("assessment")}
                  style={{
                    background: importSource === "assessment" ? "#FFFFFF" : "transparent",
                    color: importSource === "assessment" ? "#1B2A33" : "#5B6B75",
                    border: importSource === "assessment" ? "1px solid #D9DFDD" : "1px solid transparent",
                    borderRadius: "4px",
                    padding: "0.35rem 0.85rem",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Assessment
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }}>
              <span style={{ fontSize: "0.8125rem", color: "#5B6B75" }}>Or upload file</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ fontSize: "0.8125rem", color: "#5B6B75" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
              <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1B2A33" }}>
                CSV content preview or direct entry
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setCsvContent(importSource === "attendance" ? SAMPLE_CSV.attendance : SAMPLE_CSV.assessment)}
                  style={{ background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "4px", padding: "0.2rem 0.5rem", fontSize: "0.75rem", color: "#2D5BA3", cursor: "pointer" }}
                >
                  Load CS101 ({importSource})
                </button>
                <button
                  type="button"
                  onClick={() => setCsvContent(importSource === "attendance" ? SAMPLE_CSV.attendance_cs102 : SAMPLE_CSV.assessment_cs102)}
                  style={{ background: "#FFFFFF", border: "1px solid #D9DFDD", borderRadius: "4px", padding: "0.2rem 0.5rem", fontSize: "0.75rem", color: "#2D5BA3", cursor: "pointer" }}
                >
                  Load CS102 ({importSource})
                </button>
              </div>
            </div>
            <textarea
              rows={4}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="Paste comma-separated data here..."
              style={{
                width: "100%",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: "0.8125rem",
                padding: "0.75rem",
                border: "1px solid #D9DFDD",
                borderRadius: "4px",
                background: "#F2F4F3",
                color: "#1B2A33",
                boxSizing: "border-box",
              }}
            />
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.75rem", color: "#5B6B75" }}>
              Overall attendance is automatically calculated as the average across both instructors (CS101 + CS102). Previous assessments are permanently preserved.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={uploading}
              style={{
                background: "#2D5BA3",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "4px",
                padding: "0.6rem 1.4rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: uploading ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {uploading ? (
                <>
                  <RefreshCw size={16} /> Saving data...
                </>
              ) : (
                <>
                  <UploadCloud size={16} /> Submit and recalculate risk
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* KPI metrics cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div style={{ background: "#FFFFFF", padding: "1.25rem", borderRadius: "8px", border: "1px solid #D9DFDD", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#F2F4F3", padding: "0.75rem", borderRadius: "4px", color: "#2D5BA3" }}>
            <Users size={20} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.8125rem", fontWeight: 500 }}>Total section students</p>
            <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.5rem", fontWeight: 700, color: "#1B2A33", fontVariantNumeric: "tabular-nums" }}>{data?.totalStudents ?? 0}</h3>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "1.25rem", borderRadius: "8px", border: "1px solid #D9DFDD", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#F2F4F3", padding: "0.75rem", borderRadius: "4px", color: "#8A4A7B" }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.8125rem", fontWeight: 500 }}>Students needing support</p>
            <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.5rem", fontWeight: 700, color: "#8A4A7B", fontVariantNumeric: "tabular-nums" }}>{totalAtRisk}</h3>
          </div>
        </div>
      </div>

      {/* Charts row */}
      {loading ? (
        <div style={{ padding: "4rem", textAlign: "center", color: "#5B6B75" }}>Loading analytics...</div>
      ) : error ? (
        <div style={{ background: "#FFFFFF", color: "#8A4A7B", padding: "1rem", borderRadius: "8px", border: "1px solid #8A4A7B" }}>
          {error}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.5rem" }}>
          {/* Risk Breakdown Pie Chart */}
          <div style={{ background: "#FFFFFF", padding: "1.5rem", borderRadius: "8px", border: "1px solid #D9DFDD" }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600, color: "#1B2A33" }}>Section risk breakdown</h3>
            <div style={{ height: "280px" }}>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Students`, "Count"]} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#5B6B75" }}>
                  No student risk data available
                </div>
              )}
            </div>
          </div>

          {/* Attendance Deficit Distribution Bar Chart */}
          <div style={{ background: "#FFFFFF", padding: "1.5rem", borderRadius: "8px", border: "1px solid #D9DFDD" }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600, color: "#1B2A33" }}>Attendance deficit distribution</h3>
            <div style={{ height: "280px" }}>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D9DFDD" />
                    <XAxis dataKey="bucket" stroke="#5B6B75" fontSize={12} />
                    <YAxis stroke="#5B6B75" fontSize={12} allowDecimals={false} />
                    <Tooltip cursor={{ fill: "#F2F4F3" }} />
                    <Bar dataKey="count" fill="#2D5BA3" radius={[4, 4, 0, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#5B6B75" }}>
                  No attendance records found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
