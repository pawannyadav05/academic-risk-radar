import React from "react";

export function StudentRiskSkeleton() {
  return (
    <div
      style={{
        fontFamily: "var(--font-family)",
        color: "var(--text)",
        padding: "1.5rem",
      }}
    >
      {/* Header Skeleton */}
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-md)",
          height: "200px",
          marginBottom: "1.25rem",
          border: "1px solid var(--border)",
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
            background: "var(--surface)",
            borderRadius: "var(--radius-md)",
            height: "320px",
            border: "1px solid var(--border)",
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
                background: "var(--surface)",
                borderRadius: "var(--radius-md)",
                height: "280px",
                border: "1px solid var(--border)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
