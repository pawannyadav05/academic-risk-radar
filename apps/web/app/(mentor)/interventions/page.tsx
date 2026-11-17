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
    <div style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto", color: "var(--text)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: "0 0 0.4rem", fontSize: "var(--text-page-title)", lineHeight: "var(--line-page-title)", fontWeight: 700 }}>Mentor Interventions</h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "var(--text-body)" }}>Track mentoring actions and outcome progression for assigned students.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ background: "var(--primary)", border: "none", color: "var(--primary-contrast)", padding: "0.6rem 1.1rem", borderRadius: "var(--radius-sm)", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem", transition: "background 0.15s ease" }}
        >
          <Plus size={16} /> New Intervention
        </button>
      </div>

      {successMsg && <div style={{ background: "var(--surface)", border: "1px solid var(--success)", color: "var(--success)", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", marginBottom: "1rem", fontSize: "0.85rem" }}>{successMsg}</div>}
      {error && <div style={{ background: "var(--surface)", border: "1px solid var(--danger)", color: "var(--danger)", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", marginBottom: "1rem", fontSize: "0.85rem" }}>{error}</div>}

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading interventions...</div>
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
