"use client";

import React, { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { LogIn, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginAction, LoginState } from "@/actions/auth";
import { ForgotPasswordModal } from "./components/ForgotPasswordModal";

const DEMO_ROLES = [
  { label: "Admin", email: "admin@radar.edu" },
  { label: "Dean", email: "dean@radar.edu" },
  { label: "HoD", email: "hod@radar.edu" },
  { label: "Mentor", email: "mentor@radar.edu" },
  { label: "Instructor", email: "instructor@radar.edu" },
  { label: "Student", email: "12409922" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        width: "100%",
        height: "48px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        background: pending ? "var(--text-muted)" : "var(--primary)",
        color: "var(--primary-contrast)",
        borderRadius: "var(--radius-md)",
        fontSize: "0.9375rem",
        fontWeight: 600,
        border: "none",
        cursor: pending ? "not-allowed" : "pointer",
        transition: "background 0.15s ease",
      }}
    >
      {pending ? (
        <>
          <Loader2 size={18} className="animate-spin" strokeWidth={2} />
          <span>Signing in...</span>
        </>
      ) : (
        <>
          <LogIn size={18} strokeWidth={2} />
          <span>Sign in</span>
        </>
      )}
    </button>
  );
}

export function LoginForm({ returnUrl }: { returnUrl?: string }) {
  const [state, formAction] = useFormState<LoginState, FormData>(loginAction, null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {returnUrl && <input type="hidden" name="returnUrl" value={returnUrl} />}

      {/* Demo Quick Select */}
      <div>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>
          Demo accounts (password: Password123!)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
          {DEMO_ROLES.map((role) => (
            <button
              key={role.label}
              type="button"
              onClick={() => {
                setEmail(role.email);
                setPassword("Password123!");
              }}
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                padding: "0.25rem 0.625rem",
                borderRadius: "var(--radius-sm)",
                border: email === role.email ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: email === role.email ? "var(--surface-3)" : "var(--surface)",
                color: email === role.email ? "var(--accent)" : "var(--text)",
                cursor: "pointer",
              }}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      {/* Field 1: Identifier */}
      <div>
        <label htmlFor="email" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.375rem" }}>
          Student ID or institutional email
        </label>
        <input
          id="email"
          name="email"
          type="text"
          required
          autoFocus
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="12409922 or user@radar.edu"
          style={{
            width: "100%",
            height: "48px",
            boxSizing: "border-box",
            padding: "0 0.875rem",
            borderRadius: "var(--radius-md)",
            border: state?.fieldErrors?.email ? "1px solid var(--danger)" : "1px solid var(--border)",
            background: "var(--surface-2)",
            color: "var(--text)",
            fontSize: "0.9375rem",
            outline: "none",
          }}
        />
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
          Students use their ID, staff use their @radar.edu email.
        </div>
        {state?.fieldErrors?.email && (
          <span style={{ display: "block", fontSize: "0.75rem", color: "var(--danger)", marginTop: "0.25rem" }}>
            {state.fieldErrors.email[0]}
          </span>
        )}
      </div>

      {/* Field 2: Password */}
      <div>
        <label htmlFor="password" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.375rem" }}>
          Password
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            style={{
              width: "100%",
              height: "48px",
              boxSizing: "border-box",
              padding: "0 2.75rem 0 0.875rem",
              borderRadius: "var(--radius-md)",
              border: state?.fieldErrors?.password ? "1px solid var(--danger)" : "1px solid var(--border)",
              background: "var(--surface-2)",
              color: "var(--text)",
              fontSize: "0.9375rem",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            title={showPassword ? "Hide password" : "Show password"}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: "0.5rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "0.5rem",
              display: "inline-flex",
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {state?.fieldErrors?.password && (
          <span style={{ display: "block", fontSize: "0.75rem", color: "var(--danger)", marginTop: "0.25rem" }}>
            {state.fieldErrors.password[0]}
          </span>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-0.5rem" }}>
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--accent)",
            fontSize: "0.8125rem",
            cursor: "pointer",
            padding: 0,
            fontWeight: 500,
          }}
        >
          Forgot password?
        </button>
      </div>

      {/* Error Banner */}
      {state?.error && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.625rem",
            background: "var(--surface-2)",
            border: "1px solid var(--danger)",
            borderRadius: "var(--radius-md)",
            padding: "0.75rem 0.875rem",
            color: "var(--danger)",
            fontSize: "0.875rem",
          }}
        >
          <AlertCircle size={18} strokeWidth={1.75} style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>{state.error}</span>
        </div>
      )}

      <SubmitButton />

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </form>
  );
}
