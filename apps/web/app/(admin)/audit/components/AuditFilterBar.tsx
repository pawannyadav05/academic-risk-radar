import React from "react";
import { X, Filter } from "lucide-react";

interface AuditFilterBarProps {
  entityType: string;
  setEntityType: (v: string) => void;
  actorId: string;
  setActorId: (v: string) => void;
  fromDate: string;
  setFromDate: (v: string) => void;
  toDate: string;
  setToDate: (v: string) => void;
  onApply: () => void;
  onReset: () => void;
  onRemoveFilter: (key: "entityType" | "actorId" | "from" | "to") => void;
}

const ENTITY_OPTIONS = [
  { value: "", label: "All entity types" },
  { value: "RiskModelVersion", label: "Risk model versions" },
  { value: "Alert", label: "Mentor alerts" },
  { value: "Intervention", label: "Interventions" },
  { value: "User", label: "User accounts" },
  { value: "Student", label: "Students" },
  { value: "Term", label: "Academic terms" },
];

export function AuditFilterBar({
  entityType,
  setEntityType,
  actorId,
  setActorId,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onApply,
  onReset,
  onRemoveFilter,
}: AuditFilterBarProps) {
  const hasActiveFilters = Boolean(entityType || actorId || fromDate || toDate);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end" }}>
        <div>
          <label htmlFor="audit-entity-type" style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem" }}>
            Entity type
          </label>
          <select
            id="audit-entity-type"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            style={{
              padding: "0.4rem 0.65rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              fontSize: "0.8125rem",
              background: "var(--surface)",
              color: "var(--text)",
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
          <label htmlFor="audit-actor-id" style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem" }}>
            Actor ID / Email
          </label>
          <input
            id="audit-actor-id"
            type="text"
            value={actorId}
            onChange={(e) => setActorId(e.target.value)}
            placeholder="e.g. admin@radar.edu"
            style={{
              padding: "0.4rem 0.65rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              fontSize: "0.8125rem",
              background: "var(--surface)",
              color: "var(--text)",
              minWidth: "180px",
            }}
          />
        </div>

        <div>
          <label htmlFor="audit-from-date" style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem" }}>
            From date
          </label>
          <input
            id="audit-from-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              padding: "0.35rem 0.5rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              fontSize: "0.8125rem",
              background: "var(--surface)",
              color: "var(--text)",
            }}
          />
        </div>

        <div>
          <label htmlFor="audit-to-date" style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem" }}>
            To date
          </label>
          <input
            id="audit-to-date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{
              padding: "0.35rem 0.5rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              fontSize: "0.8125rem",
              background: "var(--surface)",
              color: "var(--text)",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={onApply}
            style={{
              background: "var(--primary)",
              color: "var(--primary-contrast)",
              border: "1px solid var(--primary)",
              borderRadius: "var(--radius-sm)",
              padding: "0.45rem 0.95rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <Filter size={13} />
            <span>Apply</span>
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              style={{
                background: "var(--surface-2)",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "0.45rem 0.85rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.85rem", paddingTop: "0.75rem", borderTop: "1px solid var(--surface-2)" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", alignSelf: "center", fontWeight: 500 }}>Active filters:</span>
          {entityType && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: "var(--surface-2)", border: "1px solid var(--border)", padding: "0.15rem 0.45rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", color: "var(--text)" }}>
              Entity: {entityType}
              <button type="button" onClick={() => onRemoveFilter("entityType")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--text-muted)", display: "inline-flex" }}><X size={12} /></button>
            </span>
          )}
          {actorId && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: "var(--surface-2)", border: "1px solid var(--border)", padding: "0.15rem 0.45rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", color: "var(--text)" }}>
              Actor: {actorId}
              <button type="button" onClick={() => onRemoveFilter("actorId")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--text-muted)", display: "inline-flex" }}><X size={12} /></button>
            </span>
          )}
          {fromDate && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: "var(--surface-2)", border: "1px solid var(--border)", padding: "0.15rem 0.45rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", color: "var(--text)" }}>
              From: {fromDate}
              <button type="button" onClick={() => onRemoveFilter("from")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--text-muted)", display: "inline-flex" }}><X size={12} /></button>
            </span>
          )}
          {toDate && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: "var(--surface-2)", border: "1px solid var(--border)", padding: "0.15rem 0.45rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", color: "var(--text)" }}>
              To: {toDate}
              <button type="button" onClick={() => onRemoveFilter("to")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--text-muted)", display: "inline-flex" }}><X size={12} /></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
