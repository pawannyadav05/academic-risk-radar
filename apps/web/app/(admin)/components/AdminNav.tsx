"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sliders, History, Database, CalendarRange } from "lucide-react";
import { Tabs } from "@/app/components/Tabs";

const NAV_ITEMS = [
  { href: "/model-versions", label: "Model versions", icon: Sliders },
  { href: "/audit", label: "Audit log", icon: History },
  { href: "/connectors", label: "Data connectors", icon: Database },
  { href: "/terms", label: "Terms", icon: CalendarRange },
];

export function AdminNav() {
  const pathname = usePathname();

  const tabItems = NAV_ITEMS.map((item) => ({
    href: item.href,
    label: item.label,
    icon: item.icon,
    active: pathname === item.href || (item.href !== "/model-versions" && pathname.startsWith(item.href)),
  }));

  return <Tabs items={tabItems} ariaLabel="Admin navigation" />;
}
