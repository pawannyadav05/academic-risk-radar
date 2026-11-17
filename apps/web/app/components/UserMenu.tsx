"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Check,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Building2,
  BookOpen,
  UserCheck,
  LucideIcon,
} from "lucide-react";
import { SessionUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";

interface UserMenuProps {
  session: SessionUser;
}

export function UserMenu({ session }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("system");
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLElement | null)[]>([]);

  // Initialize theme mode
  useEffect(() => {
    const stored = localStorage.getItem("arr_theme");
    if (stored === "light" || stored === "dark" || stored === "system") {
      setThemeMode(stored);
    } else {
      setThemeMode("system");
    }
  }, []);

  const applyTheme = (mode: "light" | "dark" | "system") => {
    setThemeMode(mode);
    localStorage.setItem("arr_theme", mode);
    if (mode === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    } else {
      document.documentElement.setAttribute("data-theme", mode);
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  // Focus navigation
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && menuItemsRef.current[focusedIndex]) {
      menuItemsRef.current[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsOpen(true);
          setFocusedIndex(0);
        }
        return;
      }

      const totalItems = menuItemsRef.current.filter(Boolean).length;

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % totalItems);
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + totalItems) % totalItems);
          break;
        case "Home":
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          e.preventDefault();
          setFocusedIndex(totalItems - 1);
          break;
        case "Tab":
          setIsOpen(false);
          break;
      }
    },
    [isOpen]
  );

  // Generate initials
  const rawParts = (session.name || session.email || "User").replace(/^(Prof\.|Dr\.|Mr\.|Ms\.)\s*/i, "").trim().split(/\s+/);
  const initials =
    rawParts.length >= 2
      ? `${rawParts[0][0]}${rawParts[rawParts.length - 1][0]}`.toUpperCase()
      : (session.name || "U").slice(0, 2).toUpperCase();

  // Role views list
  const hasMultipleRoles = session.role === "hod" || session.role === "instructor" || session.role === "mentor";

  let roleItems: Array<{ label: string; href: string; active: boolean; icon: LucideIcon }> = [];
  if (session.role === "hod") {
    roleItems = [
      {
        label: "HoD view",
        href: "/hod-dashboard",
        active: pathname.startsWith("/hod-dashboard"),
        icon: Building2,
      },
      {
        label: "Instructor view",
        href: "/sections",
        active: pathname.startsWith("/sections"),
        icon: BookOpen,
      },
      {
        label: "Mentor view",
        href: "/inbox",
        active: pathname.startsWith("/inbox") || pathname.startsWith("/interventions"),
        icon: UserCheck,
      },
    ];
  } else if (session.role === "instructor" || session.role === "mentor") {
    roleItems = [
      {
        label: "Instructor view",
        href: "/sections",
        active: pathname.startsWith("/sections"),
        icon: BookOpen,
      },
      {
        label: "Mentor view",
        href: "/inbox",
        active: pathname.startsWith("/inbox") || pathname.startsWith("/interventions"),
        icon: UserCheck,
      },
    ];
  }

  // Helper to register menu item ref
  let itemCounter = 0;
  const registerItem = (el: HTMLElement | null) => {
    if (el) {
      menuItemsRef.current[itemCounter++] = el;
    }
  };
  // Reset refs before rendering menu items
  if (isOpen) {
    menuItemsRef.current = [];
    itemCounter = 0;
  }

  const roleDisplay = session.role?.toLowerCase() === "hod" ? "HoD" : session.role;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Trigger Button: avatar circle + name + role chip + chevron */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setFocusedIndex(0);
        }}
        onKeyDown={handleKeyDown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="user-menu-trigger"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.625rem",
          background: isOpen ? "var(--surface-2)" : "transparent",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          padding: "0.35rem 0.65rem",
          cursor: "pointer",
          color: "var(--text)",
          transition: "background 0.15s ease",
          outline: "none",
        }}
      >
        {/* Avatar circle with initials */}
        <svg
          aria-hidden="true"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          style={{ flexShrink: 0 }}
        >
          <circle cx="16" cy="16" r="15" fill="var(--surface-2)" stroke="var(--border)" strokeWidth="1" />
          <text
            x="16"
            y="20"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="var(--text)"
            fontFamily="var(--font-family)"
            letterSpacing="0.02em"
          >
            {initials}
          </text>
        </svg>

        {/* Screen-reader only accessible label for mobile when text spans are hidden */}
        <span
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          {session.name || session.email} {roleDisplay}
        </span>

        {/* User name - hidden on mobile */}
        <span
          className="user-menu-name"
          style={{
            fontWeight: 600,
            fontSize: "0.875rem",
            color: "var(--text)",
            maxWidth: "140px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {session.name || session.email}
        </span>

        {/* Role chip - hidden on mobile */}
        <span
          className="user-menu-role"
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            background: "var(--surface-2)",
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
            padding: "0.15rem 0.45rem",
            borderRadius: "var(--radius-sm)",
            textTransform: session.role?.toLowerCase() === "hod" ? "none" : "capitalize",
          }}
        >
          {session.role?.toLowerCase() === "hod" ? "HoD" : session.role}
        </span>

        {/* Chevron - hidden on mobile */}
        <ChevronDown
          size={14}
          className="user-menu-chevron"
          style={{
            color: "var(--text-muted)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-label="User navigation options"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            width: "240px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            boxShadow: "var(--shadow-md)",
            padding: "0.375rem 0",
            zIndex: 100,
            animation: "fadeIn 0.12s ease",
          }}
        >
          {/* Identity info */}
          <div
            style={{
              padding: "0.5rem 0.85rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", lineHeight: 1.3 }}>
              {session.name || "Academic User"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem", wordBreak: "break-all" }}>
              {session.email}
            </div>
          </div>

          {/* Section: Role Views (only for multi-role faculty/hod) */}
          {hasMultipleRoles && (
            <>
              <div style={{ padding: "0.4rem 0.85rem 0.2rem", fontSize: "0.6875rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Role views
              </div>
              {roleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    ref={registerItem}
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.5rem 0.85rem",
                      fontSize: "0.8125rem",
                      fontWeight: item.active ? 600 : 400,
                      color: item.active ? "var(--primary)" : "var(--text)",
                      background: item.active ? "var(--surface-2)" : "transparent",
                      textDecoration: "none",
                      outline: "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Icon size={14} />
                      <span>{item.label}</span>
                    </div>
                    {item.active && <Check size={14} strokeWidth={2.5} style={{ color: "var(--primary)" }} />}
                  </Link>
                );
              })}
              <div style={{ height: "1px", background: "var(--border)", margin: "0.35rem 0" }} />
            </>
          )}

          {/* Section: Theme Selection */}
          <div style={{ padding: "0.4rem 0.85rem 0.2rem", fontSize: "0.6875rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Theme
          </div>
          {(
            [
              { mode: "light", label: "Light", icon: Sun },
              { mode: "dark", label: "Dark", icon: Moon },
              { mode: "system", label: "System", icon: Monitor },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const isSelected = themeMode === item.mode;
            return (
              <button
                key={item.mode}
                ref={registerItem}
                role="menuitem"
                type="button"
                onClick={() => applyTheme(item.mode)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.45rem 0.85rem",
                  fontSize: "0.8125rem",
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? "var(--primary)" : "var(--text)",
                  background: isSelected ? "var(--surface-2)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  outline: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Icon size={14} />
                  <span>{item.label}</span>
                </div>
                {isSelected && <Check size={14} strokeWidth={2.5} style={{ color: "var(--primary)" }} />}
              </button>
            );
          })}

          <div style={{ height: "1px", background: "var(--border)", margin: "0.35rem 0" }} />

          {/* Section: Sign Out */}
          <form action={logoutAction} style={{ margin: 0 }}>
            <button
              ref={registerItem}
              role="menuitem"
              type="submit"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.85rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--danger)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                outline: "none",
              }}
            >
              <LogOut size={14} strokeWidth={2} />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
