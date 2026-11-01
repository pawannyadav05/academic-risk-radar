import React from "react";

export function StudentRiskSkeleton() {
  return (
    <div
      style={{
        fontFamily: "var(--font-atkinson, system-ui, sans-serif)",
        color: "#1B2A33",
        padding: "1.5rem",
      }}
    >
      {/* Header Skeleton */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "8px",
          height: "200px",
          marginBottom: "1.25rem",
          border: "1px solid #D9DFDD",
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
            background: "#FFFFFF",
            borderRadius: "8px",
            height: "320px",
            border: "1px solid #D9DFDD",
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
                background: "#FFFFFF",
                borderRadius: "8px",
                height: "280px",
                border: "1px solid #D9DFDD",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
