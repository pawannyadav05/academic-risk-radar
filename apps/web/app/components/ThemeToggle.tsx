"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        background: "transparent",
        color: "inherit",
        border: "1px solid #D9DFDD",
        borderRadius: "4px",
        padding: "0.35rem 0.65rem",
        fontSize: "0.8125rem",
        fontWeight: 500,
        cursor: "pointer",
        lineHeight: 1,
      }}
    >
      {mounted && theme === "dark" ? (
        <>
          <Sun size={14} strokeWidth={1.75} style={{ color: "#F59E0B" }} />
          <span>Light</span>
        </>
      ) : (
        <>
          <Moon size={14} strokeWidth={1.75} style={{ color: "#5B6B75" }} />
          <span>Dark</span>
        </>
      )}
    </button>
  );
}

