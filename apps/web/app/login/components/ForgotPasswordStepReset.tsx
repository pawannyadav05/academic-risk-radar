"use client";

import React, { useState } from "react";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { resetPasswordAction } from "@/actions/auth";

interface ForgotPasswordStepResetProps {
  userId: string;
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "42px",
  padding: "0 0.75rem",
  borderRadius: "4px",
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
};

export function ForgotPasswordStepReset({
  userId,
  email,
  onSuccess,
  onBack,
}: ForgotPasswordStepResetProps) {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp.trim()) return setError("Enter the 6-digit verification code.");
    if (newPassword.length < 8) return setError("New password must be at least 8 characters long.");
    if (newPassword !== confirmPassword) return setError("Password confirmation does not match.");

    setIsSubmitting(true);
    try {
      const res = await resetPasswordAction(userId, otp.trim(), newPassword);
      if (res.success) onSuccess();
      else setError(res.error || "Unable to reset password. Please check the code.");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
        Verification code sent to <strong style={{ color: "var(--text)" }}>{email}</strong>.
      </p>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.75rem", borderRadius: "4px", background: "var(--surface-2)", border: "1px solid var(--danger)", color: "var(--danger)", fontSize: "0.8125rem" }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="fp-otp" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.25rem" }}>
          6-digit verification code
        </label>
        <input id="fp-otp" type="text" maxLength={6} required autoFocus value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))} placeholder="583921" style={{ ...inputStyle, fontSize: "1.125rem", letterSpacing: "3px", fontFamily: "monospace" }} />
      </div>

      <div>
        <label htmlFor="fp-newPassword" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.25rem" }}>
          New password (min 8 chars)
        </label>
        <div style={{ position: "relative" }}>
          <input id="fp-newPassword" type={showPassword ? "text" : "password"} required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ ...inputStyle, paddingRight: "2.5rem" }} />
          <button type="button" onClick={() => setShowPassword((p) => !p)} style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="fp-confirmPassword" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.25rem" }}>
          Confirm new password
        </label>
        <input id="fp-confirmPassword" type={showPassword ? "text" : "password"} required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem" }}>
        <button type="button" onClick={onBack} disabled={isSubmitting} style={{ border: "none", background: "transparent", color: "var(--accent)", fontSize: "0.8125rem", cursor: "pointer", padding: 0 }}>
          Request new code
        </button>
        <button type="submit" disabled={isSubmitting} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: "4px", border: "1px solid var(--accent)", background: isSubmitting ? "var(--text-muted)" : "var(--accent)", color: "#FFFFFF", fontSize: "0.875rem", fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer" }}>
          {isSubmitting ? <><Loader2 size={15} className="animate-spin" /><span>Resetting...</span></> : "Reset password"}
        </button>
      </div>
    </form>
  );
}
