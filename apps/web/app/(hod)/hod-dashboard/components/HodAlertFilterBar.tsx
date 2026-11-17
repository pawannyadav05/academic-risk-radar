import React from "react";
import { Search } from "lucide-react";

interface HodAlertFilterBarProps {
  filter: "all" | "escalated" | "open" | "resolved";
  counts: { all: number; escalated: number; open: number; resolved: number };
  search: string;
  onFilterChange: (tab: "all" | "escalated" | "open" | "resolved") => void;
  onSearchChange: (search: string) => void;
}

export function HodAlertFilterBar({
  filter,
  counts,
  search,
  onFilterChange,
  onSearchChange,
}: HodAlertFilterBarProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {(["all", "escalated", "open", "resolved"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onFilterChange(tab)}
            style={{
              background: filter === tab ? "var(--surface-2)" : "transparent",
              border: filter === tab ? "2px solid var(--primary)" : "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "0.4rem 0.75rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: filter === tab ? "var(--text)" : "var(--text-muted)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <span style={{ textTransform: "capitalize" }}>{tab}</span>
            <span style={{ fontSize: "0.75rem", opacity: 0.8, fontVariantNumeric: "tabular-nums" }}>({counts[tab]})</span>
          </button>
        ))}
      </div>

      <div style={{ position: "relative", minWidth: "220px" }}>
        <Search size={14} style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          type="text"
          placeholder="Search student or mentor..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ paddingLeft: "2rem", fontSize: "0.8125rem", width: "100%", boxSizing: "border-box" }}
        />
      </div>
    </div>
  );
}
