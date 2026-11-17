"use client";

import React, { useState, useMemo } from "react";
import { Intervention } from "@academic-risk-radar/shared-types";
import { FileText } from "lucide-react";
import { HodInterventionRow } from "./HodInterventionRow";

interface HodInterventionLogsTabProps {
  interventions: Intervention[];
  loading: boolean;
}

const MENTOR_NAMES: Record<string, string> = {
  "HOD-001": "Dr. Amit Verma (HoD)",
  "INS-001": "Prof. Rajesh Iyer",
  "MTR-001": "Dr. Sanjay Roy",
};

const STUDENT_NAMES: Record<string, string> = {
  "12409921": "Aarav Patel",
  "12409922": "Rahul Sharma",
  "12409923": "Priya Nair",
  "12409924": "Rohan Gupta",
  "12409925": "Ananya Sen",
};

export function HodInterventionLogsTab({ interventions, loading }: HodInterventionLogsTabProps) {
  const [mentorFilter, setMentorFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");

  const filteredInterventions = useMemo(() => {
    return interventions.filter((i) => {
      if (mentorFilter !== "all" && i.mentorId !== mentorFilter) return false;
      if (outcomeFilter !== "all") {
        if (outcomeFilter === "improved" && i.outcome !== "improved") return false;
        if (outcomeFilter === "stable" && i.outcome !== "stable" && i.outcome !== "no_change") return false;
        if (outcomeFilter === "action_needed" && i.outcome !== "worsened" && i.outcome !== "needs_further_action") return false;
        if (outcomeFilter === "pending" && i.outcome !== null && i.outcome !== undefined) return false;
      }
      return true;
    });
  }, [interventions, mentorFilter, outcomeFilter]);

  if (loading) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
        Loading mentor intervention logs...
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <label htmlFor="mentor-filter-select" className="sr-only">Filter by mentor</label>
          <select
            id="mentor-filter-select"
            value={mentorFilter}
            onChange={(e) => setMentorFilter(e.target.value)}
            style={{ fontSize: "0.8125rem", padding: "0.45rem 0.75rem" }}
          >
            <option value="all">All Mentors</option>
            <option value="HOD-001">Dr. Amit Verma (HoD)</option>
            <option value="INS-001">Prof. Rajesh Iyer</option>
            <option value="MTR-001">Dr. Sanjay Roy</option>
          </select>
        </div>

        <div>
          <label htmlFor="outcome-filter-select" className="sr-only">Filter by outcome</label>
          <select
            id="outcome-filter-select"
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            style={{ fontSize: "0.8125rem", padding: "0.45rem 0.75rem" }}
          >
            <option value="all">All Outcomes</option>
            <option value="improved">Improved</option>
            <option value="stable">No change</option>
            <option value="action_needed">Needs further action</option>
            <option value="pending">Pending evaluation</option>
          </select>
        </div>
      </div>

      {filteredInterventions.length === 0 ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "3rem 1.5rem", textAlign: "center" }}>
          <div style={{ color: "var(--text-muted)", display: "inline-flex", marginBottom: "0.5rem" }}>
            <FileText size={28} />
          </div>
          <p style={{ margin: 0, fontWeight: 600, color: "var(--text)" }}>No mentor interventions recorded yet.</p>
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Date</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Mentor</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Student</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Action type</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Outcome</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredInterventions.map((i) => {
                const sId = i.alertId?.replace("ALT-", "").split("-")[0] || "";
                return (
                  <HodInterventionRow
                    key={i._id}
                    intervention={i}
                    mentorName={MENTOR_NAMES[i.mentorId] || i.mentorId}
                    studentName={STUDENT_NAMES[sId] || "Enrolled Student"}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
