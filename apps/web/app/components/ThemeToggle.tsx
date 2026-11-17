"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  iconOnly?: boolean;
}

export function ThemeToggle({ iconOnly = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const currentAttr = document.documentElement.getAttribute("data-theme") as "light" | "dark" | null;
    if (currentAttr === "dark" || currentAttr === "light") {
      setTheme(currentAttr);
      return;
    }
    const stored = localStorage.getItem("arr_theme") as "light" | "dark" | null;
    const initial = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("arr_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const isDark = mounted && theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Light theme" : "Dark theme"}
      aria-label={isDark ? "Light theme" : "Dark theme"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.4rem",
        background: "var(--surface-2)",
        color: "var(--text)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        width: iconOnly ? "38px" : "auto",
        height: iconOnly ? "38px" : "auto",
        padding: iconOnly ? "0" : "0.35rem 0.65rem",
        fontSize: "0.8125rem",
        fontWeight: 500,
        cursor: "pointer",
        lineHeight: 1,
        transition: "background 0.15s ease, border-color 0.15s ease",
      }}
    >
      {isDark ? (
        <>
          <Sun size={16} strokeWidth={1.75} style={{ color: "var(--warning)" }} />
          {!iconOnly && <span>Light theme</span>}
        </>
      ) : (
        <>
          <Moon size={16} strokeWidth={1.75} style={{ color: "var(--text-muted)" }} />
          {!iconOnly && <span>Dark theme</span>}
        </>
      )}
    </button>
  );
}
