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
import { Users, AlertTriangle, UploadCloud, CheckCircle2, Download, RefreshCw, FileText } from "lucide-react";

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

interface ImportFeedback {
  status: "success" | "error";
  message: string;
  insertedCount?: number;
  quarantinedCount?: number;
  affectedStudents?: number;
  scoringRecalculation?: string;
}

const SAMPLE_CSV: Record<string, string> = {
  attendance: `studentId,sectionId,date,status,sourceRef
STU-001,SEC-CSE-101,2026-03-01T09:00:00Z,absent,RFID_01
STU-001,SEC-CSE-101,2026-03-02T09:00:00Z,absent,RFID_01
STU-002,SEC-CSE-101,2026-03-01T09:00:00Z,present,RFID_01`,
  assessment: `studentId,courseId,type,score,maxScore,date,sourceRef
STU-001,CSE101,Quiz,12,20,2026-03-01T10:00:00Z,ERP_MOCK
STU-001,CSE101,Midterm,48,100,2026-03-15T10:00:00Z,ERP_MOCK
STU-002,CSE101,Quiz,18,20,2026-03-01T10:00:00Z,ERP_MOCK`,
};

export default function InstructorSectionsPage() {
  const [assignedSections, setAssignedSections] = useState<string[]>(["SEC-CSE-101"]);
  const [sectionId, setSectionId] = useState<string>("SEC-CSE-101");
  const [data, setData] = useState<SectionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Academic Data Submission Panel state
  const [importSource, setImportSource] = useState<"attendance" | "assessment">("attendance");
  const [csvContent, setCsvContent] = useState<string>(SAMPLE_CSV.attendance);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<ImportFeedback | null>(null);

  // 1. Fetch authenticated instructor session & sections
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

  // 2. Fetch Section Analytics for selected section
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/analytics/section/${sectionId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load section analytics`);
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

  // Handle source switch and populate matching sample CSV template
  const handleSourceChange = (source: "attendance" | "assessment") => {
    setImportSource(source);
    setCsvContent(SAMPLE_CSV[source] || "");
    setFeedback(null);
  };

  // Handle CSV file upload
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

  // Download sample CSV template helper
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

  // Submit academic data to POST /api/v1/sections/:sectionId/imports/:source
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

      // Refresh section analytics to reflect newly imported data
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
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem", color: "#1e293b" }}>
      {/* ── HEADER & SECTION SELECTOR ─────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span style={{ fontSize: "0.75rem", color: "#3b82f6", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Instructor Portal</span>
          <h1 style={{ margin: "0.2rem 0 0", fontSize: "1.75rem", fontWeight: 700, color: "#0f172a" }}>Section: {sectionId}</h1>
          <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.875rem" }}>Monitor student risk distribution and upload course performance data.</p>
        </div>

        {assignedSections.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 500 }}>Assigned Section:</span>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0.4rem 0.75rem", fontSize: "0.875rem", fontWeight: 600, color: "#0f172a", cursor: "pointer" }}
            >
              {assignedSections.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── ACADEMIC DATA SUBMISSION PANEL (Week 9 Golden Demo Primary Action) ─ */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "1.5rem", marginBottom: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ background: "#eff6ff", color: "#3b82f6", padding: "0.6rem", borderRadius: "10px" }}>
              <UploadCloud size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>Academic Data Submission Panel</h2>
              <p style={{ margin: "0.15rem 0 0", color: "#64748b", fontSize: "0.8125rem" }}>Submit attendance or assessment marks to trigger automated scoring & alert generation.</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#475569", padding: "0.45rem 0.85rem", borderRadius: "8px", fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <Download size={14} /> Sample CSV Template
            </button>
          </div>
        </div>

        {/* Live Feedback Banner */}
        {feedback && (
          <div
            style={{
              background: feedback.status === "success" ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${feedback.status === "success" ? "#bbf7d0" : "#fecaca"}`,
              color: feedback.status === "success" ? "#166534" : "#991b1b",
              padding: "0.875rem 1.25rem",
              borderRadius: "10px",
              marginBottom: "1.25rem",
              fontSize: "0.875rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, marginBottom: feedback.insertedCount !== undefined ? "0.4rem" : 0 }}>
              {feedback.status === "success" ? <CheckCircle2 size={18} color="#16a34a" /> : <AlertTriangle size={18} color="#dc2626" />}
              {feedback.message}
            </div>
            {feedback.insertedCount !== undefined && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.8125rem", marginTop: "0.25rem" }}>
                <span>Valid Rows Imported: <strong>{feedback.insertedCount}</strong></span>
                <span>Quarantined Rows: <strong style={{ color: feedback.quarantinedCount ? "#dc2626" : "inherit" }}>{feedback.quarantinedCount}</strong></span>
                <span>Students Affected: <strong>{feedback.affectedStudents}</strong></span>
                <span>Scoring Trigger: <span style={{ background: "#dcfce7", color: "#15803d", padding: "0.15rem 0.5rem", borderRadius: "6px", fontWeight: 600 }}>BullMQ Enqueued</span></span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmitData}>
          {/* Source Selector & File Upload Row */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#475569" }}>Data Source:</span>
              <div style={{ display: "inline-flex", background: "#f1f5f9", padding: "0.2rem", borderRadius: "8px" }}>
                <button
                  type="button"
                  onClick={() => handleSourceChange("attendance")}
                  style={{
                    background: importSource === "attendance" ? "#fff" : "transparent",
                    color: importSource === "attendance" ? "#0f172a" : "#64748b",
                    boxShadow: importSource === "attendance" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    border: "none",
                    borderRadius: "6px",
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
                    background: importSource === "assessment" ? "#fff" : "transparent",
                    color: importSource === "assessment" ? "#0f172a" : "#64748b",
                    boxShadow: importSource === "assessment" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    border: "none",
                    borderRadius: "6px",
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
              <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>Or upload file:</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ fontSize: "0.8125rem", color: "#475569" }}
              />
            </div>
          </div>

          {/* Raw CSV Textarea */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.35rem", textTransform: "uppercase" }}>
              CSV Content Preview / Direct Input:
            </label>
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
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                background: "#f8fafc",
                color: "#0f172a",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Submit Action */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={uploading}
              style={{
                background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "0.6rem 1.4rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
              }}
            >
              {uploading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Ingesting & Recalculating...
                </>
              ) : (
                <>
                  <UploadCloud size={16} /> Submit & Recalculate Risk
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── KPI METRICS CARDS ────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#eff6ff", padding: "0.85rem", borderRadius: "50%", color: "#3b82f6" }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.8125rem", fontWeight: 500 }}>Total Section Students</p>
            <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "#0f172a" }}>{data?.totalStudents ?? 0}</h3>
          </div>
        </div>

        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "#fef2f2", padding: "0.85rem", borderRadius: "50%", color: "#dc2626" }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.8125rem", fontWeight: 500 }}>Students At Risk (High / Critical)</p>
            <h3 style={{ margin: "0.15rem 0 0", fontSize: "1.6rem", fontWeight: 700, color: "#dc2626" }}>{totalAtRisk}</h3>
          </div>
        </div>
      </div>

      {/* ── CHARTS ROW ───────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>Loading analytics...</div>
      ) : error ? (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "1rem", borderRadius: "8px", border: "1px solid #fecaca" }}>
          {error}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.5rem" }}>
          {/* Risk Breakdown Pie Chart */}
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600, color: "#0f172a" }}>Section Risk Breakdown</h3>
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
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#94a3b8" }}>
                  No student risk data available
                </div>
              )}
            </div>
          </div>

          {/* Attendance Deficit Distribution Bar Chart */}
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600, color: "#0f172a" }}>Attendance Deficit Distribution</h3>
            <div style={{ height: "280px" }}>
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
