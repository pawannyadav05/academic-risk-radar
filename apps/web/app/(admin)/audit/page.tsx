import React from "react";

export default function AuditLogsPage() {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #D9DFDD",
        borderRadius: "8px",
        padding: "2rem",
      }}
    >
      <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", fontWeight: 600, color: "#1B2A33" }}>
        System audit log
      </h2>
      <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.9375rem" }}>
        Audit entries are generated automatically when mentors acknowledge alerts, record interventions, or when the scoring engine recalculates risk scores. No entries have been recorded yet.
      </p>
    </div>
  );
}
