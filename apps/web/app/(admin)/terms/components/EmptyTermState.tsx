import React from "react";

interface Props {
  onAdd: () => void;
}

export function EmptyTermState({ onAdd }: Props) {
  return (
    <div
      style={{
        border: "1px solid #D9DFDD",
        borderRadius: "8px",
        padding: "3rem 2rem",
        textAlign: "center",
        background: "#FFFFFF",
      }}
    >
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.9375rem", fontWeight: 600, color: "#1B2A33" }}>
        No terms have been set up yet
      </p>
      <p style={{ margin: "0 0 1.5rem", fontSize: "0.875rem", color: "#5B6B75", maxWidth: "360px", display: "inline-block" }}>
        Create the first academic term to load faculty, students, and section mappings.
      </p>
      <div>
        <button
          onClick={onAdd}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.55rem 1.1rem",
            borderRadius: "4px",
            border: "1px solid #2D5BA3",
            background: "#2D5BA3",
            color: "#FFFFFF",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Add new term
        </button>
      </div>
    </div>
  );
}

