"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Intervention } from "@academic-risk-radar/shared-types";
import { Users, Clock, CheckCircle, Plus } from "lucide-react";
import InterventionList from "./components/InterventionList";
import InterventionForm from "./components/InterventionForm";
import OutcomeModal from "./components/OutcomeModal";
import WithdrawModal from "./components/WithdrawModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export default function MentorInterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "recorded">("all");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [outcomeTarget, setOutcomeTarget] = useState<Intervention | null>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<Intervention | null>(null);

  const fetchInterventions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/interventions`, { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to load interventions: HTTP ${res.status}`);
      const data = await res.json();
      setInterventions(data.interventions || []);
    } catch (err: any) {
      setError(err.message || "Failed to load interventions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterventions();
  }, [fetchInterventions]);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const pendingCount = interventions.filter((i) => !i.outcome).length;
  const improvedCount = interventions.filter((i) => i.outcome === "improved").length;

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto", color: "#f8fafc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <span style={{ fontSize: "0.75rem", color: "#f97316", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Module M6</span>
          <h1 style={{ margin: "0.2rem 0 0.4rem", fontSize: "1.6rem", fontWeight: 700 }}>Mentor Interventions</h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>Track mentoring actions and outcome progression for assigned students.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none", color: "#fff", padding: "0.6rem 1.1rem", borderRadius: "8px", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> New Intervention
        </button>
      </div>

      {successMsg && <div style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>{successMsg}</div>}
      {error && <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "1rem", borderRadius: "10px", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ background: "rgba(59,130,246,0.15)", color: "#38bdf8", padding: "0.6rem", borderRadius: "8px" }}><Users size={18} /></div>
          <div><div style={{ fontSize: "0.75rem", color: "#64748b" }}>Active Interventions</div><div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{interventions.length}</div></div>
        </div>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "1rem", borderRadius: "10px", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", padding: "0.6rem", borderRadius: "8px" }}><Clock size={18} /></div>
          <div><div style={{ fontSize: "0.75rem", color: "#64748b" }}>Pending Outcome</div><div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{pendingCount}</div></div>
        </div>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "1rem", borderRadius: "10px", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", padding: "0.6rem", borderRadius: "8px" }}><CheckCircle size={18} /></div>
          <div><div style={{ fontSize: "0.75rem", color: "#64748b" }}>Improved Outcome</div><div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{improvedCount}</div></div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>Loading interventions...</div>
      ) : (
        <InterventionList
          interventions={interventions}
          onOpenOutcomeModal={(item) => setOutcomeTarget(item)}
          onOpenWithdrawModal={(item) => setWithdrawTarget(item)}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      )}

      <InterventionForm isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmitSuccess={() => { fetchInterventions(); showNotification("Intervention created successfully!"); }} apiBase={API_BASE} />
      <OutcomeModal intervention={outcomeTarget} onClose={() => setOutcomeTarget(null)} onSubmitSuccess={() => { fetchInterventions(); showNotification("Outcome updated successfully!"); }} apiBase={API_BASE} />
      <WithdrawModal intervention={withdrawTarget} onClose={() => setWithdrawTarget(null)} onSubmitSuccess={() => { fetchInterventions(); showNotification("Intervention withdrawn successfully!"); }} apiBase={API_BASE} />
    </div>
  );
}
