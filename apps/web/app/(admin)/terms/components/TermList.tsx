import React from "react";

interface Term {
  _id: string;
  termId: number;
  label: string;
  status: "active" | "archived";
  createdAt: string;
}

interface Props {
  terms: Term[];
}

export function TermList({ terms }: Props) {
  return (
    <div
      style={{
        border: "1px solid #D9DFDD",
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "2rem",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontVariantNumeric: "tabular-nums" }}>
        <thead>
          <tr style={{ background: "#F2F4F3", borderBottom: "1px solid #D9DFDD" }}>
            <th style={TH}>Term ID</th>
            <th style={TH}>Label</th>
            <th style={TH}>Status</th>
            <th style={TH}>Created</th>
          </tr>
        </thead>
        <tbody>
          {terms.map((t) => (
            <tr key={t._id} style={{ borderBottom: "1px solid #D9DFDD" }}>
              <td style={TD}>{t.termId}</td>
              <td style={TD}>{t.label}</td>
              <td style={TD}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: t.status === "active" ? "#2E8B7A" : "#5B6B75",
                  }}
                >
                  {t.status === "active" ? "● Active" : "○ Archived"}
                </span>
              </td>
              <td style={{ ...TD, color: "#5B6B75" }}>
                {new Date(t.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TH: React.CSSProperties = {
  textAlign: "left",
  padding: "0.6rem 1rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#5B6B75",
  letterSpacing: "0.02em",
};

const TD: React.CSSProperties = {
  padding: "0.75rem 1rem",
  fontSize: "0.875rem",
  color: "#1B2A33",
};

