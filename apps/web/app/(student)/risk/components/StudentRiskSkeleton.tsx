import React from "react";

export function StudentRiskSkeleton() {
  return (
    <div
      style={{
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        color: "#e2e8f0",
        minHeight: "calc(100vh - 60px)",
        background: "#090e1a",
        margin: "-2rem",
        padding: "1.5rem",
      }}
    >
      {/* Header Skeleton */}
      <div
        style={{
          background: "#0f172a",
          borderRadius: "16px",
          height: "240px",
          marginBottom: "1.25rem",
          border: "1px solid #1e293b",
          animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />

      {/* Overview Cards Skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "1.25rem",
        }}
      >
        <div
          style={{
            background: "#0f172a",
            borderRadius: "16px",
            height: "360px",
            border: "1px solid #1e293b",
            animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "#0f172a",
                borderRadius: "16px",
                height: "280px",
                border: "1px solid #1e293b",
                animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
