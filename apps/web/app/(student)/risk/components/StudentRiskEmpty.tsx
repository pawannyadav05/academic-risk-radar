import React from "react";
import { Info, RefreshCw } from "lucide-react";

interface StudentRiskEmptyProps {
  onRefresh: () => void;
  studentName?: string;
  enrolmentId?: string;
}

export function StudentRiskEmpty({ onRefresh, studentName, enrolmentId }: StudentRiskEmptyProps) {
  return (
    <div
      style={{
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        color: "#e2e8f0",
        minHeight: "calc(100vh - 60px)",
        background: "#090e1a",
        margin: "-2rem",
        padding: "3rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: "16px",
          padding: "2.5rem 2rem",
          maxWidth: "540px",
          textAlign: "center",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.12)",
            color: "#3b82f6",
            marginBottom: "1.25rem",
          }}
        >
          <Info size={28} />
        </div>

        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#f8fafc", margin: "0 0 0.5rem" }}>
          Welcome, {studentName || "Student"}!
        </h2>
        {enrolmentId && (
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 1rem" }}>
            Student ID: {enrolmentId}
          </p>
        )}

        <p style={{ fontSize: "0.9rem", color: "#94a3b8", lineHeight: 1.6, margin: "0 0 1.75rem" }}>
          Your academic risk profile has not been calculated yet. Once your instructors record attendance, assessments, or assignment submissions for your section, your personalized standing will automatically appear here.
        </p>

        <button
          onClick={onRefresh}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.25rem",
            background: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background 0.15s ease",
          }}
        >
          <RefreshCw size={16} />
          Check For Updates
        </button>
      </div>
    </div>
  );
}
