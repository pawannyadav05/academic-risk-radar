import React from "react";
import { Plus } from "lucide-react";

interface EmptyTermStateProps {
  onAdd: () => void;
}

export function EmptyTermState({ onAdd }: EmptyTermStateProps) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "4rem 2rem",
        textAlign: "center",
        background: "var(--surface)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Calm inline SVG line illustration of a semester calendar milestone */}
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: "1.25rem", color: "var(--accent)" }}
        aria-hidden="true"
      >
        <rect
          x="10"
          y="14"
          width="44"
          height="40"
          rx="4"
          stroke="var(--text-muted)"
          strokeWidth="2"
        />
        <line x1="10" y1="24" x2="54" y2="24" stroke="var(--border)" strokeWidth="2" />
        <line x1="20" y1="10" x2="20" y2="16" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="44" y1="10" x2="44" y2="16" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="22" cy="32" r="2.5" fill="var(--text-muted)" />
        <circle cx="32" cy="32" r="2.5" fill="var(--text-muted)" />
        <circle cx="42" cy="32" r="2.5" fill="var(--text-muted)" />
        <circle cx="22" cy="42" r="2.5" fill="var(--text-muted)" />
        <circle cx="32" cy="42" r="2.5" fill="var(--accent)" />
        <circle cx="42" cy="42" r="2.5" fill="var(--text-muted)" />
      </svg>

      <h2
        style={{
          margin: "0 0 0.5rem",
          fontSize: "1.125rem",
          fontWeight: 700,
          color: "var(--text)",
        }}
      >
        No academic terms yet
      </h2>

      <p
        style={{
          margin: "0 0 1.5rem",
          fontSize: "0.875rem",
          color: "var(--text-muted)",
          maxWidth: "420px",
          lineHeight: 1.5,
        }}
      >
        Create your first term to load faculty, students and section mappings.
      </p>

      <button
        onClick={onAdd}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.55rem 1.1rem",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--accent)",
          background: "var(--accent)",
          color: "var(--accent-contrast)",
          fontSize: "0.875rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <Plus size={16} />
        Add new term
      </button>
    </div>
  );
}
