"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Tabs, TabItem } from "@/app/components/Tabs";
import { Sliders, ShieldCheck, Database, Calendar } from "lucide-react";

export function AdminTabs() {
  const pathname = usePathname();

  const items: TabItem[] = [
    {
      id: "model-versions",
      label: "Model versions",
      href: "/model-versions",
      active: pathname === "/model-versions" || pathname.startsWith("/model-versions/"),
      icon: Sliders,
    },
    {
      id: "audit",
      label: "Audit log",
      href: "/audit",
      active: pathname === "/audit" || pathname.startsWith("/audit/"),
      icon: ShieldCheck,
    },
    {
      id: "connectors",
      label: "Data connectors",
      href: "/connectors",
      active: pathname === "/connectors" || pathname.startsWith("/connectors/"),
      icon: Database,
    },
    {
      id: "terms",
      label: "Academic terms",
      href: "/terms",
      active: pathname === "/terms" || pathname.startsWith("/terms/"),
      icon: Calendar,
    },
  ];

  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <Tabs items={items} ariaLabel="Admin navigation tabs" />
    </div>
  );
}
