"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Intervention } from "@academic-risk-radar/shared-types";
import { Plus } from "lucide-react";
import InterventionList from "./components/InterventionList";
import InterventionForm from "./components/InterventionForm";
import OutcomeModal from "./components/OutcomeModal";
import WithdrawModal from "./components/WithdrawModal";

const API_BASE = "/api/v1";

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


  return (
    <div style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto", color: "#1B2A33" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: "0 0 0.4rem", fontSize: "1.6rem", fontWeight: 700 }}>Mentor Interventions</h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>Track mentoring actions and outcome progression for assigned students.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ background: "#2D5BA3", border: "none", color: "#fff", padding: "0.6rem 1.1rem", borderRadius: "4px", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Plus size={16} /> New Intervention
        </button>
      </div>

      {successMsg && <div style={{ background: "#FFFFFF", border: "1px solid #2E8B7A", color: "#2E8B7A", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>{successMsg}</div>}
      {error && <div style={{ background: "#FFFFFF", border: "1px solid #8A4A7B", color: "#8A4A7B", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>{error}</div>}


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

      <InterventionForm isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmitSuccess={() => { fetchInterventions(); showNotification("Intervention saved."); }} apiBase={API_BASE} />
      <OutcomeModal intervention={outcomeTarget} onClose={() => setOutcomeTarget(null)} onSubmitSuccess={() => { fetchInterventions(); showNotification("Outcome updated."); }} apiBase={API_BASE} />
      <WithdrawModal intervention={withdrawTarget} onClose={() => setWithdrawTarget(null)} onSubmitSuccess={() => { fetchInterventions(); showNotification("Intervention withdrawn."); }} apiBase={API_BASE} />
    </div>
  );
}
