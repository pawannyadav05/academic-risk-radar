"use client";

import React, { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { ForgotPasswordStepRequest } from "./ForgotPasswordStepRequest";
import { ForgotPasswordStepReset } from "./ForgotPasswordStepReset";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<"request" | "reset" | "done">("request");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setStep("request");
    setUserId("");
    setEmail("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(27, 42, 51, 0.45)", padding: "1rem" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div style={{ width: "100%", maxWidth: "440px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "1.5rem", position: "relative", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
            {step === "done" ? "Password updated" : "Reset password"}
          </h3>
          <button type="button" onClick={handleClose} aria-label="Close dialog" style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "0.25rem" }}>
            <X size={18} />
          </button>
        </div>

        {step === "request" && (
          <ForgotPasswordStepRequest
            onOtpSent={(id, mail) => { setUserId(id); setEmail(mail); setStep("reset"); }}
            onCancel={handleClose}
          />
        )}

        {step === "reset" && (
          <ForgotPasswordStepReset
            userId={userId}
            email={email}
            onSuccess={() => setStep("done")}
            onBack={() => setStep("request")}
          />
        )}

        {step === "done" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "center", padding: "0.5rem 0" }}>
            <div style={{ color: "var(--steady)", display: "flex", justifyContent: "center" }}>
              <CheckCircle2 size={44} />
            </div>
            <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--text)", lineHeight: 1.5 }}>
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <button
              type="button"
              onClick={handleClose}
              style={{ marginTop: "0.5rem", width: "100%", height: "42px", borderRadius: "4px", border: "1px solid var(--accent)", background: "var(--accent)", color: "#FFFFFF", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}
            >
              Back to sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

