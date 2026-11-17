"use client";

import React, { useState, useMemo } from "react";
import { Alert } from "@academic-risk-radar/shared-types";
import { ShieldCheck } from "lucide-react";
import { HodAlertRow } from "./HodAlertRow";
import { HodAlertFilterBar } from "./HodAlertFilterBar";
import { InboxDrawer } from "@/app/(mentor)/inbox/components/InboxDrawer";

interface HodSupervisedAlertsTabProps {
  alerts: Alert[];
  loading: boolean;
  onRefresh: () => void;
}

const STUDENT_NAMES: Record<string, string> = {
  "12409921": "Aarav Patel",
  "12409922": "Rahul Sharma",
  "12409923": "Priya Nair",
  "12409924": "Rohan Gupta",
  "12409925": "Ananya Sen",
};

const MENTOR_NAMES: Record<string, string> = {
  "HOD-001": "Dr. Amit Verma (HoD)",
  "INS-001": "Prof. Rajesh Iyer",
  "MTR-001": "Dr. Sanjay Roy",
};

export function HodSupervisedAlertsTab({ alerts, loading, onRefresh }: HodSupervisedAlertsTabProps) {
  const [filter, setFilter] = useState<"all" | "escalated" | "open" | "resolved">("all");
  const [search, setSearch] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const counts = useMemo(() => {
    let escalated = 0;
    let open = 0;
    let resolved = 0;
    const now = Date.now();
    alerts.forEach((a) => {
      const isAck = a.status === "acknowledged" || a.status === "closed";
      const isBreached = new Date(a.slaDeadline).getTime() <= now && !isAck;
      if (isAck) resolved++;
      else if (isBreached || a.status === "escalated") escalated++;
      else open++;
    });
    return { all: alerts.length, escalated, open, resolved };
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    const now = Date.now();
    return alerts
      .filter((a) => {
        const isAck = a.status === "acknowledged" || a.status === "closed";
        const isBreached = new Date(a.slaDeadline).getTime() <= now && !isAck;
        if (filter === "resolved") return isAck;
        if (filter === "escalated") return isBreached || a.status === "escalated";
        if (filter === "open") return !isAck && !isBreached && a.status !== "escalated";
        return true;
      })
      .filter((a) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const sName = (STUDENT_NAMES[a.studentId] || "").toLowerCase();
        const mName = (MENTOR_NAMES[a.mentorId] || a.mentorId).toLowerCase();
        return a.studentId.includes(q) || a._id.toLowerCase().includes(q) || sName.includes(q) || mName.includes(q);
      })
      .sort((a, b) => {
        const aDiff = new Date(a.slaDeadline).getTime() - now;
        const bDiff = new Date(b.slaDeadline).getTime() - now;
        return aDiff - bDiff;
      });
  }, [alerts, filter, search]);

  if (loading) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
        Loading department alerts and escalations...
      </div>
    );
  }

  return (
    <div>
      <HodAlertFilterBar
        filter={filter}
        counts={counts}
        search={search}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
      />

      {filteredAlerts.length === 0 ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "3rem 1.5rem", textAlign: "center" }}>
          <div style={{ color: "var(--success)", display: "inline-flex", marginBottom: "0.5rem" }}>
            <ShieldCheck size={28} />
          </div>
          <p style={{ margin: 0, fontWeight: 600, color: "var(--text)" }}>No escalations. Your mentors are on track.</p>
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Student</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Alert ID</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Mentor</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>SLA Urgency</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Escalated at</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((a) => (
                <HodAlertRow
                  key={a._id}
                  alert={a}
                  studentName={STUDENT_NAMES[a.studentId] || "Enrolled Student"}
                  mentorName={MENTOR_NAMES[a.mentorId] || a.mentorId}
                  onView={(alt) => setSelectedAlert(alt)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedAlert && (
        <InboxDrawer
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onLogActionSuccess={() => {
            setSelectedAlert(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
