"use client";

import React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export interface TabItem {
  id?: string;
  label: string;
  href?: string;
  active?: boolean;
  count?: number | string;
  icon?: LucideIcon | React.ComponentType<{ size?: number | string }>;
  title?: string;
  onClick?: () => void;
}

interface TabsProps {
  items: TabItem[];
  ariaLabel?: string;
}

/**
 * Universal Underline Tab Navigation Component
 * - 2px primary underline on active
 * - Muted text for inactive
 * - Hover background var(--surface-2)
 * - Count badge support
 * - Horizontally scrollable on mobile
 */
export function Tabs({ items, ariaLabel = "Navigation tabs" }: TabsProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className="tabs-scroll-container"
      style={{
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid var(--border)",
        gap: "0.25rem",
        overflowX: "auto",
        whiteSpace: "nowrap",
        marginBottom: "1.5rem",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const key = item.href || item.id || `${item.label}-${index}`;
        const content = (
          <>
            {Icon && <Icon size={15} />}
            <span>{item.label}</span>
            {item.count !== undefined && item.count !== null && (
              <span
                style={{
                  display: "inline-block",
                  marginLeft: "0.35rem",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  padding: "0.1rem 0.45rem",
                  borderRadius: "10px",
                  background: "var(--surface-2)",
                  color: item.active ? "var(--text)" : "var(--text-muted)",
                  border: item.active ? "1px solid var(--primary)" : "1px solid var(--border)",
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1.3,
                }}
              >
                {item.count}
              </span>
            )}
          </>
        );

        const commonStyle: React.CSSProperties = {
          display: "inline-flex",
          alignItems: "center",
          gap: "0.45rem",
          padding: "0.625rem 0.875rem",
          fontSize: "0.875rem",
          fontWeight: item.active ? 600 : 500,
          color: item.active ? "var(--text)" : "var(--text-muted)",
          background: "transparent",
          border: "none",
          borderBottom: item.active ? "2px solid var(--primary)" : "2px solid transparent",
          marginBottom: "-1px",
          cursor: "pointer",
          textDecoration: "none",
          borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
          transition: "color 0.15s ease, background 0.15s ease, border-color 0.15s ease",
          outline: "none",
          flexShrink: 0,
        };

        if (item.href) {
          return (
            <Link
              key={key}
              href={item.href}
              className="tab-item-link"
              title={item.title}
              style={commonStyle}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={key}
            type="button"
            onClick={item.onClick}
            className="tab-item-button"
            title={item.title}
            style={commonStyle}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}
