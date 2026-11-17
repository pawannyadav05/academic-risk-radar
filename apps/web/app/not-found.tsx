import React from "react";
import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { getSession, ROLE_HOME_ROUTES } from "@/lib/auth";

export const metadata = {
  title: "Page Not Found · Academic Risk Radar",
};

export default async function NotFoundPage() {
  const session = await getSession();
  const homeRoute = session?.role ? ROLE_HOME_ROUTES[session.role] || "/risk" : "/login";

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "var(--font-family)",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "2.5rem 2rem",
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface-2)",
            color: "var(--accent)",
            marginBottom: "1.25rem",
          }}
        >
          <Compass size={24} strokeWidth={1.75} />
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
          Page not found
        </h1>

        <p
          style={{
            margin: "0 0 1.75rem",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            lineHeight: 1.5,
          }}
        >
          The page you requested does not exist or has been moved. Check the web address or return to your dashboard.
        </p>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link
            href={homeRoute}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.6rem 1.25rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--accent)",
              background: "var(--accent)",
              color: "var(--accent-contrast)",
              fontSize: "0.875rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={16} />
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
