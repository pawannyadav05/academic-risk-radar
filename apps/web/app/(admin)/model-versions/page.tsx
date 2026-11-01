import React from "react";

export default function ModelVersionsPage() {
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
        Risk model versions
      </h2>
      <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.9375rem" }}>
        This page shows published scoring model versions, their weight configurations, and a preview of how band thresholds affect the current student population. No versions have been published yet.
      </p>
    </div>
  );
}
