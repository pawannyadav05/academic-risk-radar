import React from "react";
import Link from "next/link";
import { SessionUser, ROLE_HOME_ROUTES } from "@/lib/auth";
import { LogoMark } from "./LogoMark";
import { UserMenu } from "./UserMenu";

interface GlobalHeaderProps {
  session: SessionUser;
}

export function GlobalHeader({ session }: GlobalHeaderProps) {
  const homeRoute = session.role ? ROLE_HOME_ROUTES[session.role] || "/risk" : "/login";

  return (
    <header
      style={{
        height: "64px",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 40,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left: Logo mark + Academic Risk Radar + Desktop Subtitle */}
        <Link
          href={homeRoute}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.75rem",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <LogoMark size={32} />
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--text)",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
              }}
            >
              Academic Risk Radar
            </span>
            <span
              className="header-subtitle"
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                fontWeight: 400,
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              Early warning platform
            </span>
          </div>
        </Link>

        {/* Right: ONE user menu button */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <UserMenu session={session} />
        </div>
      </div>
    </header>
  );
}
