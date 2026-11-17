"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/app/components/PageHeader";
import { AdminErrorBanner } from "../components/AdminErrorBanner";
import { AdminToast } from "../components/AdminToast";
import { TermList } from "./components/TermList";
import { EmptyTermState } from "./components/EmptyTermState";
import { NewTermWizard } from "./components/NewTermWizard";
import { TermDetailModal, TermItem } from "./components/TermDetailModal";

export default function TermsPage() {
  const [terms, setTerms] = useState<TermItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [inspectTerm, setInspectTerm] = useState<TermItem | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadTerms = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStatusCode(null);
    try {
      const res = await fetch("/api/v1/admin/terms", { credentials: "include" });
      if (!res.ok) {
        setStatusCode(res.status);
        setError(`HTTP ${res.status}: Failed to load academic terms`);
        return;
      }
      const data = await res.json();
      setTerms(Array.isArray(data) ? data : []);
    } catch {
      setError("Network error: Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTerms();
  }, [loadTerms]);

  const handleWizardSuccess = () => {
    setIsWizardOpen(false);
    setToast({
      type: "success",
      message: "Academic term created successfully. Rosters and section mappings are active.",
    });
    loadTerms();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <PageHeader
          breadcrumb="Admin / Terms"
          title="Academic terms"
          description="Configure academic calendars, provision term rosters, and map course sections."
        />

        {terms.length > 0 && !loading && (
          <button
            onClick={() => setIsWizardOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.55rem 1.1rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--accent)",
              background: "var(--accent)",
              color: "var(--accent-contrast)",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              marginTop: "0.5rem",
            }}
          >
            <Plus size={16} />
            Add new term
          </button>
        )}
      </div>

      {error && (
        <div style={{ marginBottom: "1.5rem" }}>
          <AdminErrorBanner error={error} statusCode={statusCode} onRetry={loadTerms} />
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem 0" }}>
          <div
            style={{
              height: 240,
              borderRadius: "var(--radius-md)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              animation: "pulse 1.5s infinite ease-in-out",
            }}
          />
        </div>
      ) : terms.length === 0 ? (
        <EmptyTermState onAdd={() => setIsWizardOpen(true)} />
      ) : (
        <TermList terms={terms} onView={(t) => setInspectTerm(t)} />
      )}

      <NewTermWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={handleWizardSuccess}
      />

      <TermDetailModal
        term={inspectTerm}
        onClose={() => setInspectTerm(null)}
      />

      {toast && (
        <AdminToast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
