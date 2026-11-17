import React from "react";
import Link from "next/link";
import { ShieldAlert, LogOut } from "lucide-react";
import { getSession, ROLE_HOME_ROUTES } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";

export const metadata = {
  title: "Access Restricted · Academic Risk Radar",
};

export default async function ForbiddenPage() {
  const session = await getSession();
  const homeRoute = session?.role ? ROLE_HOME_ROUTES[session.role] || "/risk" : "/login";

  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        fontFamily: "var(--font-family)",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "2rem",
          maxWidth: "480px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface-2)",
            color: "var(--danger)",
            marginBottom: "1rem",
          }}
        >
          <ShieldAlert size={20} strokeWidth={1.75} />
        </div>

        <h1
          style={{
            margin: "0 0 0.5rem",
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--text)",
            lineHeight: 1.3,
          }}
        >
          Access restricted
        </h1>

        <p
          style={{
            margin: "0 0 1.25rem",
            fontSize: "0.875rem",
            lineHeight: 1.5,
            color: "var(--text-muted)",
          }}
        >
          Your current account role does not have permission to view this page. Records and controls are separated by institutional role.
        </p>

        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "0.75rem 1rem",
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
            marginBottom: "1.5rem",
          }}
        >
          Signed in as <strong style={{ color: "var(--text)" }}>{session?.name || "Unknown"}</strong> ({session?.role || "guest"}).
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link
            href={homeRoute}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "var(--primary)",
              color: "var(--primary-contrast)",
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Go back home
          </Link>

          <form action={logoutAction} style={{ margin: 0 }}>
            <button
              type="submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "var(--surface-2)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <LogOut size={14} strokeWidth={1.75} />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
