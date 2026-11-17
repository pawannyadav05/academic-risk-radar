import React from "react";
import { Eye, Clock } from "lucide-react";
import { TermItem } from "./TermDetailModal";

interface TermListProps {
  terms: TermItem[];
  onView: (term: TermItem) => void;
}

export function TermList({ terms, onView }: TermListProps) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        background: "var(--surface)",
        marginBottom: "2rem",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontVariantNumeric: "tabular-nums" }}>
          <thead>
            <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              <th style={TH}>Term</th>
              <th style={TH}>Dates</th>
              <th style={TH}>Status</th>
              <th style={TH}>Faculty</th>
              <th style={TH}>Students</th>
              <th style={TH}>Sections</th>
              <th style={{ ...TH, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {terms.map((term, index) => {
              // Primary term is the active one or first one
              const isCurrent = term.status === "active" && index === 0;
              const isUpcoming = false;
              const isPast = term.status === "archived" || (!isCurrent && !isUpcoming);

              let chipBg = "var(--surface-2)";
              let chipColor = "var(--text-muted)";
              let chipLabel = "Past";

              if (isCurrent) {
                chipBg = "var(--accent-subtle)";
                chipColor = "var(--accent)";
                chipLabel = "Current";
              } else if (isUpcoming) {
                chipBg = "var(--surface-2)";
                chipColor = "var(--text)";
                chipLabel = "Upcoming";
              }

              return (
                <tr
                  key={term._id || term.termId}
                  style={{
                    borderBottom: index < terms.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <td style={TD}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 600, color: "var(--text)" }}>
                        {term.label || `Term ${term.termId}`}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                        ID: {term.termId}
                      </span>
                    </div>
                  </td>

                  <td style={{ ...TD, color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                    {term.startDate && term.endDate ? (
                      `${term.startDate} – ${term.endDate}`
                    ) : (
                      <span>
                        Created{" "}
                        {new Date(term.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </td>

                  <td style={TD}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: chipBg,
                        color: chipColor,
                      }}
                    >
                      {chipLabel}
                    </span>
                  </td>

                  <td style={{ ...TD, color: "var(--text-muted)" }}>
                    {term.facultyCount !== undefined ? term.facultyCount : "—"}
                  </td>

                  <td style={{ ...TD, color: "var(--text-muted)" }}>
                    {term.studentsCount !== undefined ? term.studentsCount : "—"}
                  </td>

                  <td style={{ ...TD, color: "var(--text-muted)" }}>
                    {term.sectionsCount !== undefined ? term.sectionsCount : "—"}
                  </td>

                  <td style={{ ...TD, textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        disabled
                        title="API support pending"
                        style={{
                          padding: "0.3rem 0.6rem",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border)",
                          background: "var(--surface-2)",
                          color: "var(--text-muted)",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          cursor: "not-allowed",
                          opacity: 0.6,
                        }}
                      >
                        Set as current
                      </button>

                      <button
                        onClick={() => onView(term)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: "0.3rem 0.6rem",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border)",
                          background: "var(--surface)",
                          color: "var(--text)",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TH: React.CSSProperties = {
  textAlign: "left",
  padding: "0.65rem 1rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--text-muted)",
  letterSpacing: "0.02em",
  whiteSpace: "nowrap",
};

const TD: React.CSSProperties = {
  padding: "0.75rem 1rem",
  fontSize: "0.875rem",
  color: "var(--text)",
  verticalAlign: "middle",
};
