import React from "react";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign In · Academic Risk Radar",
  description: "Institutional authentication for Academic Risk Radar",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { returnUrl?: string };
}) {
  const returnUrl = searchParams?.returnUrl;

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          maxWidth: "460px",
          width: "100%",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              margin: "0 0 0.5rem",
              fontSize: "2rem",
              fontWeight: 600,
              color: "#1B2A33",
              fontFamily: "var(--font-atkinson, system-ui, sans-serif)",
              letterSpacing: "-0.01em",
            }}
          >
            Academic Risk Radar
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "0.9375rem",
              color: "#5B6B75",
              lineHeight: 1.5,
            }}
          >
            Sign in with your verified institutional credentials to access your academic role dashboard.
          </p>
        </div>

        {/* Credentials Form Card */}
        <div
          style={{
            background: "#FFFDF9",
            border: "1px solid #E6DFD5",
            borderRadius: "8px",
            padding: "2.25rem 2rem",
          }}
        >
          <div style={{ marginBottom: "1.5rem" }}>
            <h2
              style={{
                margin: "0.25rem 0 0",
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#2B2623",
              }}
            >
              Sign in
            </h2>
          </div>

          <LoginForm returnUrl={returnUrl} />

          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid #EFE8DE",
              textAlign: "center",
              fontSize: "0.8125rem",
              color: "#8C827A",
              lineHeight: 1.4,
            }}
          >
            Access is limited to registered institutional accounts. Contact your administrator if you cannot sign in.
          </div>
        </div>
      </div>
    </div>
  );
}
