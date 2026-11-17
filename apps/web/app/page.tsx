import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ background: "var(--surface)", padding: "2rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
      <h2 style={{ margin: "0 0 0.5rem", fontSize: "var(--text-page-title)", lineHeight: "var(--line-page-title)", fontWeight: 700, color: "var(--text)" }}>
        Academic Risk Radar
      </h2>
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "var(--text-body)", maxWidth: "70ch" }}>
        An academic early-warning system that consolidates attendance, assessment, assignment, and LMS engagement signals to help mentors identify student needs early.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem", marginTop: "1.75rem" }}>
        <Link href="/risk" style={{ padding: "1.25rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", textDecoration: "none", color: "var(--text)", background: "var(--surface-2)" }}>
          <h3 style={{ margin: "0 0 0.35rem", fontSize: "1rem", fontWeight: 600, color: "var(--primary)" }}>Student standing</h3>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8125rem", lineHeight: 1.5 }}>View attendance, grades, and contributing factors in a clear view.</p>
        </Link>
        <Link href="/inbox" style={{ padding: "1.25rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", textDecoration: "none", color: "var(--text)", background: "var(--surface-2)" }}>
          <h3 style={{ margin: "0 0 0.35rem", fontSize: "1rem", fontWeight: 600, color: "var(--primary)" }}>Mentor alerts</h3>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8125rem", lineHeight: 1.5 }}>Review assigned mentee alerts, acknowledge items, and log mentoring sessions.</p>
        </Link>
        <Link href="/connectors" style={{ padding: "1.25rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", textDecoration: "none", color: "var(--text)", background: "var(--surface-2)" }}>
          <h3 style={{ margin: "0 0 0.35rem", fontSize: "1rem", fontWeight: 600, color: "var(--primary)" }}>Data connectors</h3>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8125rem", lineHeight: 1.5 }}>Manage institutional data feeds, trigger CSV imports, and inspect quarantine records.</p>
        </Link>
        <Link href="/model-versions" style={{ padding: "1.25rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", textDecoration: "none", color: "var(--text)", background: "var(--surface-2)" }}>
          <h3 style={{ margin: "0 0 0.35rem", fontSize: "1rem", fontWeight: 600, color: "var(--primary)" }}>Risk model versions</h3>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8125rem", lineHeight: 1.5 }}>Configure factor weights, preview band thresholds, and view model versions.</p>
        </Link>
      </div>
    </div>
  );
}
