import React from "react";
import Link from "next/link";
import { LogOut, UserCircle } from "lucide-react";
import { getSession, ROLE_HOME_ROUTES } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { ThemeToggle } from "./components/ThemeToggle";

export const metadata = {
  title: "Academic Risk Radar",
  description: "Academic Early-Warning and Mentoring Intervention Platform",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const homeRoute = session?.role ? ROLE_HOME_ROUTES[session.role] || "/risk" : "/login";

  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('arr_theme');if(t){document.documentElement.setAttribute('data-theme',t);}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-theme="dark"] {
                color-scheme: dark;
              }
              [data-theme="dark"] body {
                background: #090e1a !important;
                color: #f1f5f9 !important;
              }
              [data-theme="dark"] header {
                background: #0b1222 !important;
                color: #f1f5f9 !important;
                border-bottom: 1px solid #1e293b !important;
              }
              [data-theme="dark"] header h1 {
                color: #f1f5f9 !important;
              }
              [data-theme="dark"] div[style*="background: #FFFFFF"],
              [data-theme="dark"] div[style*="background:#FFFFFF"],
              [data-theme="dark"] div[style*="background: rgb(255, 255, 255)"],
              [data-theme="dark"] section[style*="background: #FFFFFF"],
              [data-theme="dark"] main[style*="background: #FFFFFF"],
              [data-theme="dark"] a[style*="background: #FFFFFF"] {
                background: #0f172a !important;
              }
              [data-theme="dark"] div[style*="background: #FFFDF9"],
              [data-theme="dark"] div[style*="background:#FFFDF9"] {
                background: #0f172a !important;
              }
              [data-theme="dark"] div[style*="background: #F2F4F3"],
              [data-theme="dark"] div[style*="background:#F2F4F3"],
              [data-theme="dark"] div[style*="background: rgb(242, 244, 243)"],
              [data-theme="dark"] span[style*="background: #F2F4F3"],
              [data-theme="dark"] button[style*="background: #F2F4F3"] {
                background: #162032 !important;
              }
              [data-theme="dark"] *[style*="border: 1px solid #D9DFDD"],
              [data-theme="dark"] *[style*="border:1px solid #D9DFDD"],
              [data-theme="dark"] *[style*="border-color: #D9DFDD"],
              [data-theme="dark"] *[style*="border: 1px solid #E6DFD5"],
              [data-theme="dark"] *[style*="border-bottom: 1px solid #D9DFDD"],
              [data-theme="dark"] *[style*="border-top: 1px solid #D9DFDD"] {
                border-color: #1e293b !important;
              }
              [data-theme="dark"] *[style*="color: #1B2A33"],
              [data-theme="dark"] *[style*="color:#1B2A33"],
              [data-theme="dark"] *[style*="color: #2B2623"],
              [data-theme="dark"] *[style*="color:#2B2623"] {
                color: #f1f5f9 !important;
              }
              [data-theme="dark"] *[style*="color: #5B6B75"],
              [data-theme="dark"] *[style*="color:#5B6B75"],
              [data-theme="dark"] *[style*="color: #64748b"],
              [data-theme="dark"] *[style*="color:#64748b"] {
                color: #94a3b8 !important;
              }
              [data-theme="dark"] input,
              [data-theme="dark"] textarea,
              [data-theme="dark"] select {
                background: #0b1222 !important;
                color: #f1f5f9 !important;
                border-color: #334155 !important;
              }
              [data-theme="dark"] table thead tr {
                background: #0b1222 !important;
              }
              [data-theme="dark"] table tr {
                border-bottom-color: #1e293b !important;
              }
            `,
          }}
        />
      </head>
      <body style={{ fontFamily: "var(--font-atkinson, system-ui, sans-serif)", margin: 0, padding: 0, background: "#F2F4F3", color: "#1B2A33" }}>
        <header
          style={{
            background: "#FFFFFF",
            color: "#1B2A33",
            padding: "0.875rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #D9DFDD",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#2D5BA3", marginRight: "0.5rem" }}>■</span>
            <Link href={homeRoute} style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center" }}>
              <h1 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#1B2A33", letterSpacing: "0.02em" }}>Academic Risk Radar</h1>
              <span style={{ marginLeft: "0.6rem", fontSize: "0.62rem", color: "#5B6B75", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>Early Warning Platform</span>
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {session ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "#F2F4F3",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "4px",
                    border: "1px solid #D9DFDD",
                    fontSize: "0.8125rem",
                  }}
                >
                  <UserCircle size={16} strokeWidth={1.75} style={{ color: "#5B6B75" }} />
                  <span style={{ fontWeight: 600, color: "#1B2A33" }}>{session.name}</span>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      textTransform: "none",
                      letterSpacing: "0",
                      background: "#1B2A33",
                      color: "#FFFFFF",
                      padding: "0.15rem 0.4rem",
                      borderRadius: "4px",
                      fontWeight: 600,
                    }}
                  >
                    {session.role}
                  </span>
                </div>

                <ThemeToggle />

                <form action={logoutAction} style={{ margin: 0 }}>
                  <button
                    type="submit"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      background: "transparent",
                      border: "none",
                      color: "#8A4A7B",
                      cursor: "pointer",
                      fontSize: "0.8125rem",
                      padding: "0.35rem 0.5rem",
                    }}
                  >
                    <LogOut size={14} strokeWidth={1.75} />
                    <span>Sign Out</span>
                  </button>
                </form>
              </>
            ) : (
              <ThemeToggle />
            )}
          </div>
        </header>
        <main style={{ padding: "2rem", maxWidth: "1280px", margin: "0 auto" }}>{children}</main>
      </body>
    </html>
  );
}
