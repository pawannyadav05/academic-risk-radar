import React from "react";
import { Bell, UserCheck, Compass } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { LogoMark } from "@/app/components/LogoMark";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export const metadata = {
  title: "Sign In · Academic Risk Radar",
  description: "Institutional authentication for Academic Risk Radar",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { returnUrl?: string; reason?: string };
}) {
  const returnUrl = searchParams?.returnUrl;
  const reason = searchParams?.reason;

  let reasonMessage: string | null = null;
  if (reason === "signed-out") {
    reasonMessage = "You have been signed out.";
  } else if (reason === "session-expired") {
    reasonMessage = "Your session expired. Please sign in again.";
  } else if (reason === "unauthorized") {
    reasonMessage = "Please sign in with an authorized institutional account.";
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Absolute Theme Toggle in top-right corner */}
      <div
        style={{
          position: "fixed",
          top: "1.25rem",
          right: "1.25rem",
          zIndex: 50,
        }}
      >
        <ThemeToggle iconOnly />
      </div>

      {/* Left Panel: Desktop >= 1024px only */}
      <div
        className="login-left-panel"
        style={{
          width: "50%",
          background: "var(--primary)",
          color: "var(--primary-contrast)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "3.5rem 4rem",
          position: "relative",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Subtle geometric line pattern in lighter orange via SVG */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            opacity: 0.14,
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="login-geo-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="30" cy="30" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-geo-grid)" />
          {/* Subtle concentric decorative radar arcs */}
          <circle cx="90%" cy="15%" r="180" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 4" />
          <circle cx="90%" cy="15%" r="300" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10%" cy="85%" r="220" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 6" />
        </svg>

        {/* Brand header */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <LogoMark size={36} variant="inverted" />
          <div>
            <div style={{ fontSize: "1.125rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
              Academic Risk Radar
            </div>
            <div style={{ fontSize: "0.75rem", opacity: 0.85, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Early warning platform
            </div>
          </div>
        </div>

        {/* Main headline and feature bullets */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: "480px", margin: "auto 0" }}>
          <h1
            style={{
              fontSize: "2.25rem",
              lineHeight: 1.25,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: "0 0 2rem",
              color: "var(--primary-contrast)",
            }}
          >
            Spot academic risk early. Support every student in time.
          </h1>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
              <div
                style={{
                  background: "var(--primary-contrast-subtle)",
                  padding: "0.45rem",
                  borderRadius: "var(--radius-sm)",
                  display: "inline-flex",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                <Bell size={18} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Early alerts</div>
                <div style={{ fontSize: "0.8125rem", opacity: 0.88, lineHeight: 1.4 }}>
                  Automatic attendance & assessment risk triage before mid-term evaluations.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
              <div
                style={{
                  background: "var(--primary-contrast-subtle)",
                  padding: "0.45rem",
                  borderRadius: "var(--radius-sm)",
                  display: "inline-flex",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                <UserCheck size={18} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Mentor follow-ups</div>
                <div style={{ fontSize: "0.8125rem", opacity: 0.88, lineHeight: 1.4 }}>
                  Structured intervention logs and 48-hour SLA escalation monitoring.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
              <div
                style={{
                  background: "var(--primary-contrast-subtle)",
                  padding: "0.45rem",
                  borderRadius: "var(--radius-sm)",
                  display: "inline-flex",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                <Compass size={18} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Clear progress view</div>
                <div style={{ fontSize: "0.8125rem", opacity: 0.88, lineHeight: 1.4 }}>
                  Transparent, calm academic standing and progress tracking for students.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info in left panel */}
        <div style={{ position: "relative", zIndex: 2, fontSize: "0.75rem", opacity: 0.75 }}>
          Institutional Early-Warning & Mentoring Platform · Academic Year 2025–26
        </div>
      </div>

      {/* Right Panel: Form */}
      <div
        className="login-right-panel"
        style={{
          width: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2.5rem 1.5rem",
          background: "var(--bg)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "400px",
            width: "100%",
          }}
        >
          {/* Mobile compact header: visible only on mobile/tablet */}
          <div className="login-mobile-brand" style={{ marginBottom: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
              <LogoMark size={32} />
              <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
                Academic Risk Radar
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
              Spot academic risk early. Support every student in time.
            </p>
          </div>

          {/* Form Card */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "2rem",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {reasonMessage && (
              <div
                style={{
                  marginBottom: "1.25rem",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  fontSize: "0.8125rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span>{reasonMessage}</span>
              </div>
            )}

            <div style={{ marginBottom: "1.5rem" }}>
              <h2
                style={{
                  margin: "0 0 0.35rem",
                  fontSize: "var(--text-page-title)",
                  lineHeight: "var(--line-page-title)",
                  fontWeight: 700,
                  color: "var(--text)",
                }}
              >
                Sign in
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--text-body)",
                  lineHeight: "var(--line-body)",
                  color: "var(--text-muted)",
                }}
              >
                Use your institutional credentials to access the early warning platform.
              </p>
            </div>

            <LoginForm returnUrl={returnUrl} />

            {/* Footer text */}
            <div
              style={{
                marginTop: "1.5rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid var(--border)",
                textAlign: "center",
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
              }}
            >
              Can&apos;t sign in? Contact your administrator.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
