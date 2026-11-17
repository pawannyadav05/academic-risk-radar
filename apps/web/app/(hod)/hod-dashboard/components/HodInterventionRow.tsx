import React, { useState } from "react";
import { Intervention } from "@academic-risk-radar/shared-types";
import { ChevronDown, ChevronUp } from "lucide-react";

interface HodInterventionRowProps {
  intervention: Intervention;
  mentorName: string;
  studentName: string;
}

export function HodInterventionRow({ intervention, mentorName, studentName }: HodInterventionRowProps) {
  const [expanded, setExpanded] = useState(false);

  const dateFormatted = new Date(intervention.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  let outcomeLabel = "Pending evaluation";
  let outcomeColor = "var(--text-muted)";
  if (intervention.outcome === "improved") {
    outcomeLabel = "Improved";
    outcomeColor = "var(--success)";
  } else if (intervention.outcome === "stable" || intervention.outcome === "no_change") {
    outcomeLabel = "No change";
    outcomeColor = "var(--warning)";
  } else if (intervention.outcome === "worsened" || intervention.outcome === "needs_further_action") {
    outcomeLabel = "Needs further action";
    outcomeColor = "var(--danger)";
  }

  const actionDisplay = intervention.action
    ? intervention.action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Mentoring action";

  return (
    <tr style={{ borderBottom: "1px solid var(--border)", fontSize: "0.8125rem", color: "var(--text)" }}>
      <td style={{ padding: "0.75rem 1rem", fontVariantNumeric: "tabular-nums", color: "var(--text-muted)" }}>
        {dateFormatted}
      </td>
      <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{mentorName}</td>
      <td style={{ padding: "0.75rem 1rem" }}>
        <div>{studentName}</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>ID: {intervention.alertId?.replace("ALT-", "").split("-")[0] || "—"}</div>
      </td>
      <td style={{ padding: "0.75rem 1rem" }}>
        <span style={{ background: "var(--surface-2)", padding: "0.2rem 0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          {actionDisplay}
        </span>
      </td>
      <td style={{ padding: "0.75rem 1rem" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "0.2rem 0.55rem",
            borderRadius: "var(--radius-sm)",
            fontWeight: 600,
            fontSize: "0.75rem",
            color: outcomeColor,
            border: `1px solid ${outcomeColor}`,
            background: "var(--surface-2)",
          }}
        >
          {outcomeLabel}
        </span>
      </td>
      <td style={{ padding: "0.75rem 1rem", maxWidth: "260px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem" }}>
          <span style={{ overflow: "hidden", textOverflow: expanded ? "clip" : "ellipsis", whiteSpace: expanded ? "normal" : "nowrap" }}>
            {intervention.notes || "No notes recorded"}
          </span>
          {intervention.notes && intervention.notes.length > 35 && (
            <button
              type="button"
              onClick={() => setExpanded((p) => !p)}
              style={{ background: "transparent", border: "none", color: "var(--primary)", cursor: "pointer", padding: 0, display: "inline-flex" }}
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
