import React from "react";
import { Info } from "lucide-react";

interface StudentsNeedingSupportNoticeProps {
  sectionId: string;
  totalAtRisk: number;
}

export function StudentsNeedingSupportNotice({
  sectionId,
  totalAtRisk,
}: StudentsNeedingSupportNoticeProps) {
  if (totalAtRisk === 0) return null;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem 1.5rem",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
      }}
    >
      <div style={{ color: "var(--info)", flexShrink: 0, marginTop: "2px" }}>
        <Info size={18} />
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, color: "var(--text)" }}>
          Section student roster notice
        </h3>
        <p style={{ margin: "0.3rem 0 0", fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.45 }}>
          {totalAtRisk} {totalAtRisk === 1 ? "student needs" : "students need"} academic support in section {sectionId}. Detailed per-student roster requires backend endpoint <code style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>GET /api/v1/sections/:id/students</code> (the current analytics endpoint returns aggregate distributions).
        </p>
      </div>
    </div>
  );
}
