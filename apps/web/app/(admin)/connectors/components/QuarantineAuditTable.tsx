import React, { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, ShieldAlert } from "lucide-react";

export interface QuarantineItem {
  _id?: string;
  originalCollection: string;
  rawRecord: unknown;
  reason: string;
  ingestedAt: string;
}

interface QuarantineAuditTableProps {
  items: QuarantineItem[];
}

export function QuarantineAuditTable({ items }: QuarantineAuditTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const toggleExpand = (idx: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const filteredItems = items.filter((item) => {
    if (sourceFilter === "all") return true;
    return item.originalCollection.toLowerCase().includes(sourceFilter.toLowerCase());
  });

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "2rem" }}>
      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldAlert size={16} style={{ color: items.length > 0 ? "var(--danger)" : "var(--text-muted)" }} />
            <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)" }}>
              Quarantine audit registry
            </h3>
          </div>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Fault-isolated records rejected by schema or referential integrity rules.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label htmlFor="quarantine-source-filter" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Source:</label>
          <select
            id="quarantine-source-filter"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            style={{
              padding: "0.3rem 0.6rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              fontSize: "0.75rem",
              background: "var(--surface)",
              color: "var(--text)",
            }}
          >
            <option value="all">All sources</option>
            <option value="attendance">Attendance</option>
            <option value="assessment">Assessments</option>
            <option value="assignment">Assignments</option>
            <option value="lms">LMS</option>
          </select>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          <CheckCircle2 size={24} style={{ color: "var(--steady)", marginBottom: "0.4rem" }} />
          <p style={{ margin: 0, fontWeight: 500, color: "var(--text)" }}>No quarantined rows. Ingestion is clean.</p>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>All imported batches passed validation without isolation.</span>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                <th style={{ padding: "0.6rem 0.85rem", width: "40px" }} />
                <th style={{ padding: "0.6rem 0.85rem", width: "50px" }}>Row</th>
                <th style={{ padding: "0.6rem 0.85rem" }}>Source</th>
                <th style={{ padding: "0.6rem 0.85rem" }}>Error reason</th>
                <th style={{ padding: "0.6rem 0.85rem" }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => {
                const isExpanded = expandedIds.has(idx);
                return (
                  <React.Fragment key={item._id || idx}>
                    <tr
                      onClick={() => toggleExpand(idx)}
                      style={{ borderBottom: "1px solid var(--border)", cursor: "pointer", background: isExpanded ? "var(--surface-2)" : "transparent" }}
                    >
                      <td style={{ padding: "0.6rem 0.85rem", color: "var(--text-muted)" }}>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </td>
                      <td style={{ padding: "0.6rem 0.85rem", fontVariantNumeric: "tabular-nums", color: "var(--text-muted)" }}>{idx + 1}</td>
                      <td style={{ padding: "0.6rem 0.85rem", fontWeight: 600, color: "var(--text)" }}>{item.originalCollection}</td>
                      <td style={{ padding: "0.6rem 0.85rem", color: "var(--danger)" }}>{item.reason}</td>
                      <td style={{ padding: "0.6rem 0.85rem", fontVariantNumeric: "tabular-nums", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {new Date(item.ingestedAt).toLocaleString()}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                        <td colSpan={5} style={{ padding: "0.75rem 1.25rem" }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "0.3rem" }}>
                            Raw Record Payload
                          </span>
                          <pre style={{ margin: 0, padding: "0.6rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontFamily: "ui-monospace, monospace", overflowX: "auto" }}>
                            {typeof item.rawRecord === "object" ? JSON.stringify(item.rawRecord, null, 2) : String(item.rawRecord)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
