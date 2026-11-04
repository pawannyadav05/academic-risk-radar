"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sliders, History, Database } from "lucide-react";

const NAV_ITEMS = [
  { href: "/model-versions", label: "Model versions", icon: Sliders },
  { href: "/audit", label: "Audit log", icon: History },
  { href: "/connectors", label: "Data connectors", icon: Database },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: "flex",
        gap: "0.5rem",
        borderBottom: "1px solid #D9DFDD",
        marginBottom: "1.5rem",
        paddingBottom: "0.5rem",
      }}
      aria-label="Admin navigation"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/model-versions" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.5rem 0.85rem",
              borderRadius: "4px",
              fontSize: "0.875rem",
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "#2D5BA3" : "#5B6B75",
              background: isActive ? "#FFFFFF" : "transparent",
              border: isActive ? "1px solid #D9DFDD" : "1px solid transparent",
              borderBottom: isActive ? "2px solid #2D5BA3" : "1px solid transparent",
              textDecoration: "none",
            }}
          >
            <Icon size={15} strokeWidth={isActive ? 2 : 1.75} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

