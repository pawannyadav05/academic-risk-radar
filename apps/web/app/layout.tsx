import React from "react";

export const metadata = {
  title: "Academic Risk Radar",
  description: "Academic Early-Warning and Mentoring Intervention Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, sans-serif", margin: 0, padding: 0, background: "#090e1a" }}>
        <header style={{ background: "#0b1222", color: "#ffffff", padding: "0.875rem 2rem", display: "flex", alignItems: "center", borderBottom: "1px solid #1e293b" }}>
          <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#f97316", marginRight: "0.5rem" }}>■</span>
          <h1 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#f1f5f9", letterSpacing: "0.02em" }}>Academic Risk Radar</h1>
          <span style={{ marginLeft: "0.6rem", fontSize: "0.62rem", color: "#334155", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>Early Warning Platform</span>
        </header>
        <main style={{ padding: "2rem", maxWidth: "1280px", margin: "0 auto" }}>{children}</main>
      </body>
    </html>
  );
}
