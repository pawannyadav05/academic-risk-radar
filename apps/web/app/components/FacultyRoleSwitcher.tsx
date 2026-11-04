"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, UserCheck, Building2 } from "lucide-react";
import { UserRole } from "@academic-risk-radar/shared-types";

interface FacultyRoleSwitcherProps {
  role: UserRole;
}

export function FacultyRoleSwitcher({ role }: FacultyRoleSwitcherProps) {
  const pathname = usePathname();

  // Only render for faculty and HoD
  if (role !== "instructor" && role !== "mentor" && role !== "hod") {
    return null;
  }

  // If user is an HoD (who can also be an Instructor and a Mentor)
  if (role === "hod") {
    const isHod = pathname.startsWith("/hod-dashboard");
    const isInstructor = pathname.startsWith("/sections");
    const isMentor = pathname.startsWith("/inbox") || pathname.startsWith("/interventions");

    return (
      <div style={{ display: "inline-flex", gap: "0.25rem", background: "#F2F4F3", padding: "0.15rem", borderRadius: "4px", border: "1px solid #D9DFDD" }}>
        <Link
          href="/hod-dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            padding: "0.25rem 0.5rem",
            borderRadius: "3px",
            fontSize: "0.75rem",
            fontWeight: isHod ? 600 : 500,
            background: isHod ? "#FFFFFF" : "transparent",
            color: isHod ? "#2D5BA3" : "#5B6B75",
            textDecoration: "none",
          }}
          title="Head of Department Dashboard"
        >
          <Building2 size={12} />
          <span>HoD</span>
        </Link>
        <Link
          href="/sections"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            padding: "0.25rem 0.5rem",
            borderRadius: "3px",
            fontSize: "0.75rem",
            fontWeight: isInstructor ? 600 : 500,
            background: isInstructor ? "#FFFFFF" : "transparent",
            color: isInstructor ? "#2D5BA3" : "#5B6B75",
            textDecoration: "none",
          }}
          title="Teaching Section & Marks"
        >
          <BookOpen size={12} />
          <span>Teaching</span>
        </Link>
        <Link
          href="/inbox"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            padding: "0.25rem 0.5rem",
            borderRadius: "3px",
            fontSize: "0.75rem",
            fontWeight: isMentor ? 600 : 500,
            background: isMentor ? "#FFFFFF" : "transparent",
            color: isMentor ? "#2D5BA3" : "#5B6B75",
            textDecoration: "none",
          }}
          title="Mentee Alerts & Interventions"
        >
          <UserCheck size={12} />
          <span>Mentoring</span>
        </Link>
      </div>
    );
  }

  // Standard Faculty (Instructor + Mentor dual role)
  const isInstructorView = pathname.startsWith("/sections");
  const isMentorView = pathname.startsWith("/inbox") || pathname.startsWith("/interventions");

  if (isInstructorView) {
    return (
      <Link
        href="/inbox"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "#FFFFFF",
          border: "1px solid #2D5BA3",
          borderRadius: "4px",
          color: "#2D5BA3",
          padding: "0.3rem 0.65rem",
          fontSize: "0.8125rem",
          fontWeight: 600,
          textDecoration: "none",
        }}
        title="Switch to your assigned mentee alerts and interventions"
      >
        <UserCheck size={14} strokeWidth={2} />
        <span>Switch to mentor view</span>
      </Link>
    );
  }

  if (isMentorView) {
    return (
      <Link
        href="/sections"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "#FFFFFF",
          border: "1px solid #2D5BA3",
          borderRadius: "4px",
          color: "#2D5BA3",
          padding: "0.3rem 0.65rem",
          fontSize: "0.8125rem",
          fontWeight: 600,
          textDecoration: "none",
        }}
        title="Switch to your teaching section roster and marks upload"
      >
        <BookOpen size={14} strokeWidth={2} />
        <span>Switch to instructor view</span>
      </Link>
    );
  }

  return (
    <div style={{ display: "inline-flex", gap: "0.35rem" }}>
      <Link
        href="/sections"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
          background: "#FFFFFF",
          border: "1px solid #D9DFDD",
          borderRadius: "4px",
          color: "#1B2A33",
          padding: "0.25rem 0.5rem",
          fontSize: "0.75rem",
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        <BookOpen size={12} />
        <span>Instructor</span>
      </Link>
      <Link
        href="/inbox"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
          background: "#FFFFFF",
          border: "1px solid #D9DFDD",
          borderRadius: "4px",
          color: "#1B2A33",
          padding: "0.25rem 0.5rem",
          fontSize: "0.75rem",
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        <UserCheck size={12} />
        <span>Mentor</span>
      </Link>
    </div>
  );
}
