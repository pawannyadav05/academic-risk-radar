import React from "react";

interface AuditFilterBarProps {
  entityType: string;
  setEntityType: (v: string) => void;
  actorId: string;
  setActorId: (v: string) => void;
  onApply: () => void;
  onReset: () => void;
}

const ENTITY_OPTIONS = [
  { value: "", label: "All entity types" },
  { value: "RiskModelVersion", label: "Risk model versions" },
  { value: "Alert", label: "Mentor alerts" },
  { value: "Intervention", label: "Interventions" },
  { value: "User", label: "User accounts" },
];

export function AuditFilterBar({
  entityType,
  setEntityType,
  actorId,
  setActorId,
  onApply,
  onReset,
}: AuditFilterBarProps) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #D9DFDD",
        borderRadius: "8px",
        padding: "1rem 1.25rem",
        marginBottom: "1.25rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        alignItems: "flex-end",
      }}
    >
      <div>
        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#5B6B75", marginBottom: "0.3rem" }}>
          Entity type
        </label>
        <select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          style={{
            padding: "0.4rem 0.65rem",
            borderRadius: "4px",
            border: "1px solid #D9DFDD",
            fontSize: "0.8125rem",
            background: "#FFFFFF",
            color: "#1B2A33",
            minWidth: "160px",
          }}
        >
          {ENTITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#5B6B75", marginBottom: "0.3rem" }}>
          Actor ID or email
        </label>
        <input
          type="text"
          value={actorId}
          onChange={(e) => setActorId(e.target.value)}
          placeholder="e.g. admin@radar.edu"
          style={{
            padding: "0.4rem 0.65rem",
            borderRadius: "4px",
            border: "1px solid #D9DFDD",
            fontSize: "0.8125rem",
            minWidth: "200px",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          type="button"
          onClick={onApply}
          style={{
            background: "#2D5BA3",
            color: "#FFFFFF",
            border: "1px solid #2D5BA3",
            borderRadius: "4px",
            padding: "0.45rem 0.9rem",
            fontSize: "0.8125rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={onReset}
          style={{
            background: "#FFFFFF",
            color: "#5B6B75",
            border: "1px solid #D9DFDD",
            borderRadius: "4px",
            padding: "0.45rem 0.9rem",
            fontSize: "0.8125rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

