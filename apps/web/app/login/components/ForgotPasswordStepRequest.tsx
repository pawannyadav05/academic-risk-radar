"use client";

import React, { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { requestOtpAction } from "@/actions/auth";

interface ForgotPasswordStepRequestProps {
  onOtpSent: (userId: string, email: string) => void;
  onCancel: () => void;
}

export function ForgotPasswordStepRequest({
  onOtpSent,
  onCancel,
}: ForgotPasswordStepRequestProps) {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userId.trim() || !email.trim()) {
      setError("Enter both your User ID and registered email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestOtpAction(userId.trim(), email.trim());
      if (res.success) {
        onOtpSent(userId.trim(), email.trim());
      } else {
        setError(res.error || "Unable to send verification code. Please check your details.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
        Enter your User ID and registered institutional email. A 6-digit verification code will be sent to your inbox.
      </p>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 0.85rem", borderRadius: "4px", background: "var(--surface-2)", border: "1px solid var(--danger)", color: "var(--danger)", fontSize: "0.8125rem" }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="fp-userId" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.3rem" }}>
          User ID (Student ID or Faculty UID)
        </label>
        <input
          id="fp-userId"
          type="text"
          required
          autoFocus
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="e.g. 12409922 or FAC-001"
          style={{ width: "100%", height: "42px", padding: "0 0.75rem", borderRadius: "4px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      <div>
        <label htmlFor="fp-email" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.3rem" }}>
          Registered institutional email
        </label>
        <input
          id="fp-email"
          type="text"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. user@radar.edu or username"
          style={{ width: "100%", height: "42px", padding: "0 0.75rem", borderRadius: "4px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
        />
        <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Limit: maximum 10 requests per day.
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "0.5rem" }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          style={{ padding: "0.55rem 1rem", borderRadius: "4px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: "0.875rem", cursor: "pointer" }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.55rem 1.1rem", borderRadius: "4px", border: "1px solid var(--accent)", background: isSubmitting ? "var(--text-muted)" : "var(--accent)", color: "#FFFFFF", fontSize: "0.875rem", fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer" }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            "Send verification code"
          )}
        </button>
      </div>
    </form>
  );
}
