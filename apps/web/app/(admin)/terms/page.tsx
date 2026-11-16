"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TermList } from "./components/TermList";
import { EmptyTermState } from "./components/EmptyTermState";
import { NewTermForm } from "./components/NewTermForm";

interface Term {
  _id: string;
  termId: number;
  label: string;
  status: "active" | "archived";
  createdAt: string;
}

export default function TermsPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadTerms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/terms", { credentials: "include" });
      const data = await res.json();
      setTerms(Array.isArray(data) ? data : []);
    } catch {
      setTerms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTerms();
  }, [loadTerms]);

  function handleSuccess() {
    setShowForm(false);
    setFeedback("Term created. Faculty and students are now active.");
    loadTerms();
  }

  if (loading) {
    return (
      <p style={{ color: "#5B6B75", fontSize: "0.875rem", padding: "1.5rem 0" }}>
        Loading terms…
      </p>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: "0 0 0.3rem", fontSize: "1.5rem", fontWeight: 700, color: "#1B2A33" }}>
            Academic terms
          </h1>
          <p style={{ margin: 0, color: "#5B6B75", fontSize: "0.875rem", maxWidth: "520px" }}>
            Each term loads faculty, student accounts, and section mappings in one step.
          </p>
        </div>
        {terms.length > 0 && !showForm && (
          <button
            onClick={() => { setFeedback(null); setShowForm(true); }}
            style={{
              padding: "0.55rem 1.1rem",
              borderRadius: "4px",
              border: "1px solid #2D5BA3",
              background: "#2D5BA3",
              color: "#FFFFFF",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Add new term
          </button>
        )}
      </div>

      {feedback && (
        <div
          style={{
            padding: "0.65rem 1rem",
            borderRadius: "4px",
            marginBottom: "1.25rem",
            fontSize: "0.8125rem",
            background: "#E8F5F1",
            color: "#2E8B7A",
            border: "1px solid #2E8B7A",
          }}
        >
          {feedback}
        </div>
      )}

      {showForm && (
        <NewTermForm
          onCancel={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      )}

      {terms.length === 0 && !showForm && (
        <EmptyTermState onAdd={() => setShowForm(true)} />
      )}

      {terms.length > 0 && (
        <TermList terms={terms} />
      )}
    </div>
  );
}

