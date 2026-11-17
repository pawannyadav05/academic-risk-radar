import React from "react";

interface PageHeaderProps {
  breadcrumb: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * Standardized Page Header Row
 * Displays a small muted breadcrumb + H1 page title + optional description / action button.
 */
export function PageHeader({ breadcrumb, title, description, action }: PageHeaderProps) {
  return (
    <div
      style={{
        marginBottom: "1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      <div>
        <nav aria-label="Breadcrumb" style={{ marginBottom: "0.35rem" }}>
          <span
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              fontWeight: 500,
              letterSpacing: "0.01em",
            }}
          >
            {breadcrumb}
          </span>
        </nav>
        <h1
          style={{
            margin: "0 0 0.25rem",
            fontSize: "var(--text-page-title)",
            lineHeight: "var(--line-page-title)",
            fontWeight: 700,
            color: "var(--text)",
            letterSpacing: "-0.015em",
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              margin: 0,
              fontSize: "var(--text-body)",
              lineHeight: "var(--line-body)",
              color: "var(--text-muted)",
            }}
          >
            {description}
          </p>
        )}
      </div>

      {action && <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>{action}</div>}
    </div>
  );
}
