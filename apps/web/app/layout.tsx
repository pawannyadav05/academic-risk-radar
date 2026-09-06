import React from "react";

export const metadata = {
  title: "Academic Risk Radar",
  description: "Academic Early-Warning and Mentoring Intervention Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, sans-serif", margin: 0, padding: 0, background: "#f8fafc" }}>
        <header style={{ background: "#1e293b", color: "#ffffff", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Academic Risk Radar</h1>
          <nav style={{ display: "flex", gap: "1rem" }}>
            <a href="/risk" style={{ color: "#cbd5e1", textDecoration: "none" }}>Student View</a>
            <a href="/model-versions" style={{ color: "#cbd5e1", textDecoration: "none" }}>Model Versions (Admin)</a>
            <a href="/audit" style={{ color: "#cbd5e1", textDecoration: "none" }}>Audit Logs (Admin)</a>
          </nav>
        </header>
        <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>{children}</main>
      </body>
    </html>
  );
}
