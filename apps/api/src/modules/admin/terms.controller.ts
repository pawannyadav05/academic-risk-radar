/**
 * Module M8 — Admin Terms Controller
 * Manages academic terms: listing and creating new terms with bulk CSV ingestion.
 *
 * POST /api/v1/admin/terms  — create a new term with 5 CSV files in JSON body
 * GET  /api/v1/admin/terms  — list all terms (newest first)
 *
 * CSV processing order (preserves referential integrity):
 *   1. Faculty CSV       → create/update User records (instructor/mentor/hod/dean)
 *   2. Student creds CSV → create Student User records
 *   3. Faculty creds CSV → set passwordHash on faculty Users
 *   4. Student-Mentor mapping CSV → upsert MentorAssignment records
 *   5. Instructor-Section mapping CSV → update sectionIds on faculty Users
 */

import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";
import { UserModel, MentorAssignmentModel, AuditEntryModel } from "../../db/schemas.js";
import { SectionModel, TeachingAssignmentModel } from "../../db/schemas.js";
import { parseRawCsvRows } from "../ingestion/csv-importers.js";

// ─── Term Schema (local — not exported from shared-types to avoid cross-package churn) ───

interface Term {
  _id: string;
  termId: number;
  label: string;
  status: "active" | "archived";
  createdAt: string;
  createdBy: string;
}

const TermSchema = new Schema<Term>({
  _id: { type: String, required: true },
  termId: { type: Number, required: true, unique: true },
  label: { type: String, required: true },
  status: { type: String, enum: ["active", "archived"], default: "active" },
  createdAt: { type: String, required: true },
  createdBy: { type: String, required: true },
});

const TermModel = mongoose.model<Term>("Term", TermSchema);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DESIGNATION_TO_ROLE: Record<string, string> = {
  assistant_professor: "instructor",
  hod: "hod",
  dean: "dean",
};

/** Derive a deterministic email from a uid and term so re-runs are idempotent. */
function facultyEmail(uid: string, termId: number): string {
  return `${uid.toLowerCase().replace(/[^a-z0-9]/g, "")}@term${termId}.radar.edu`;
}

function studentEmail(studentId: string, termId: number): string {
  return `s${studentId}@term${termId}.radar.edu`;
}

// ─── CSV Parsers ──────────────────────────────────────────────────────────────

interface FacultyRow {
  uid: string;
  name: string;
  department: string;
  designation: string;
  hodUid?: string;
  deanUid?: string;
}

function parseFacultyCsv(csv: string): FacultyRow[] {
  const rows = parseRawCsvRows(csv);
  if (rows.length < 2) return [];
  const [header, ...data] = rows;
  const h = new Map(header.map((c, i) => [c.toLowerCase().replace(/[^a-z]/g, ""), i]));
  return data
    .filter((r) => r.length > 1)
    .map((r) => ({
      uid: r[h.get("uid") ?? 0] ?? "",
      name: r[h.get("name") ?? 1] ?? "",
      department: r[h.get("department") ?? 2] ?? "",
      designation: r[h.get("designation") ?? 3]?.toLowerCase().replace(/\s+/g, "_") ?? "",
      hodUid: h.has("hoduid") ? (r[h.get("hoduid")!] ?? "") : undefined,
      deanUid: h.has("deanuid") ? (r[h.get("deanuid")!] ?? "") : undefined,
    }))
    .filter((r) => r.uid && r.designation);
}

interface CredRow {
  id: string;
  password: string;
}

function parseCredsCsv(csv: string): CredRow[] {
  const rows = parseRawCsvRows(csv);
  if (rows.length < 2) return [];
  const [header, ...data] = rows;
  const h = new Map(header.map((c, i) => [c.toLowerCase().replace(/[^a-z]/g, ""), i]));
  const idCol = h.get("uid") ?? h.get("studentid") ?? h.get("id") ?? 0;
  const pwCol = h.get("password") ?? 1;
  return data
    .filter((r) => r.length > 1)
    .map((r) => ({ id: r[idCol] ?? "", password: r[pwCol] ?? "" }))
    .filter((r) => r.id && r.password);
}

interface MappingRow {
  studentId: string;
  section: string;
  mentorUid: string;
}

function parseStudentMentorCsv(csv: string): MappingRow[] {
  const rows = parseRawCsvRows(csv);
  if (rows.length < 2) return [];
  const [header, ...data] = rows;
  const h = new Map(header.map((c, i) => [c.toLowerCase().replace(/[^a-z]/g, ""), i]));
  return data
    .filter((r) => r.length > 1)
    .map((r) => ({
      studentId: r[h.get("studentid") ?? 0] ?? "",
      section: r[h.get("section") ?? 1] ?? "",
      mentorUid: r[h.get("mentoruid") ?? h.get("mentor") ?? 2] ?? "",
    }))
    .filter((r) => r.studentId && r.mentorUid);
}

interface InstructorSectionRow {
  uid: string;
  section: string;
  subjectCode: string;
}

function parseInstructorSectionCsv(csv: string): InstructorSectionRow[] {
  const rows = parseRawCsvRows(csv);
  if (rows.length < 2) return [];
  const [header, ...data] = rows;
  const h = new Map(header.map((c, i) => [c.toLowerCase().replace(/[^a-z]/g, ""), i]));
  return data
    .filter((r) => r.length > 1)
    .map((r) => ({
      uid: r[h.get("uid") ?? 0] ?? "",
      section: r[h.get("section") ?? 1] ?? "",
      subjectCode: r[h.get("subjectcode") ?? h.get("subject") ?? 2] ?? "",
    }))
    .filter((r) => r.uid && r.section);
}

// ─── Section details CSV ─────────────────────────────────────────────────────
// Format: sectionname,subjectcode1,subjectcode2,...
// Example: k24p2of,cse101,cse202,cse203

interface SectionDetailRow {
  sectionId: string;
  subjectCodes: string[];
}

function parseSectionDetailsCsv(csv: string): SectionDetailRow[] {
  const rows = parseRawCsvRows(csv);
  if (rows.length < 2) return [];
  const [, ...data] = rows; // skip header row (sectionname,subjectcode,...)
  return data
    .filter((r) => r.length >= 1 && r[0].trim())
    .map((r) => ({
      sectionId: r[0].trim(),
      subjectCodes: r.slice(1).map((c) => c.trim()).filter(Boolean),
    }));
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

/** GET /api/v1/admin/terms */
export async function listTerms(req: Request, res: Response) {
  try {
    const terms = await TermModel.find({}).sort({ termId: -1 }).lean();
    return res.json(terms);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: "Failed to list terms", details: msg });
  }
}

/** POST /api/v1/admin/terms */
export async function createTerm(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const {
      termId,
      facultyCsv,
      studentCredsCsv,
      facultyCredsCsv,
      studentMentorCsv,
      instructorSectionCsv,
      sectionDetailsCsv,
    } = req.body ?? {};

    // ── Validate termId ──
    const numericTermId = Number(termId);
    if (!Number.isInteger(numericTermId) || numericTermId <= 0) {
      return res.status(400).json({ error: "termId must be a positive integer" });
    }

    const existing = await TermModel.findOne({ termId: numericTermId });
    if (existing) {
      return res.status(409).json({ error: `Term ${numericTermId} already exists` });
    }

    if (
      !facultyCsv ||
      !studentCredsCsv ||
      !facultyCredsCsv ||
      !studentMentorCsv ||
      !instructorSectionCsv ||
      !sectionDetailsCsv
    ) {
      return res.status(400).json({ error: "All 6 CSV files are required" });
    }

    const summary: Record<string, number> = {
      sectionsConfigured: 0,
      facultyCreated: 0,
      studentsCreated: 0,
      mentorAssignments: 0,
      sectionAssignments: 0,
    };
    const errors: string[] = [];

    // ── 1. Section Details CSV → upsert Section records ──
    const sectionRows = parseSectionDetailsCsv(String(sectionDetailsCsv));
    for (const row of sectionRows) {
      await SectionModel.updateOne(
        { _id: row.sectionId, termId: numericTermId },
        {
          $set: {
            _id: row.sectionId,
            termId: numericTermId,
            subjectCodes: row.subjectCodes,
          },
        },
        { upsert: true }
      );
      summary.sectionsConfigured++;
    }

    // ── 2. Faculty CSV → create/update User records ──
    const facultyRows = parseFacultyCsv(String(facultyCsv));
    for (const row of facultyRows) {
      const role = DESIGNATION_TO_ROLE[row.designation];
      if (!role) {
        errors.push(`Unknown designation '${row.designation}' for uid ${row.uid}`);
        continue;
      }
      const email = facultyEmail(row.uid, numericTermId);
      await UserModel.updateOne(
        { _id: row.uid },
        {
          $set: {
            _id: row.uid,
            role,
            name: row.name,
            email,
            passwordHash: await bcrypt.hash("ChangeMe@1", 10),
            departmentId: row.department || null,
            sectionIds: [],
            hodUid: row.hodUid || null,
            deanUid: row.deanUid || null,
          },
        },
        { upsert: true }
      );
      summary.facultyCreated++;
    }

    // ── 2. Student credentials CSV → create Student User records ──
    const studentCreds = parseCredsCsv(String(studentCredsCsv));
    for (const row of studentCreds) {
      const email = studentEmail(row.id, numericTermId);
      const hash = await bcrypt.hash(row.password, 10);
      await UserModel.updateOne(
        { _id: row.id },
        { $set: { _id: row.id, role: "student", name: row.id, email, passwordHash: hash, sectionIds: [] } },
        { upsert: true }
      );
      summary.studentsCreated++;
    }

    // ── 3. Faculty credentials CSV → update passwordHash on faculty Users ──
    const facultyCreds = parseCredsCsv(String(facultyCredsCsv));
    for (const row of facultyCreds) {
      const hash = await bcrypt.hash(row.password, 10);
      await UserModel.updateOne({ _id: row.id }, { $set: { passwordHash: hash } });
    }

    // ── 4. Student-Mentor mapping CSV → upsert MentorAssignment records ──
    const mentorRows = parseStudentMentorCsv(String(studentMentorCsv));
    const now = new Date().toISOString();
    for (const row of mentorRows) {
      await MentorAssignmentModel.updateOne(
        { studentId: row.studentId, mentorId: row.mentorUid },
        {
          $set: {
            studentId: row.studentId,
            mentorId: row.mentorUid,
            assignedFrom: now,
            assignedTo: null,
          },
        },
        { upsert: true }
      );
      // Also add section to student's sectionIds
      await UserModel.updateOne(
        { _id: row.studentId },
        { $addToSet: { sectionIds: row.section } }
      );
      summary.mentorAssignments++;
    }

    // ── 5. Instructor-Section mapping CSV → update sectionIds and TeachingAssignment ──
    const instrRows = parseInstructorSectionCsv(String(instructorSectionCsv));
    for (const row of instrRows) {
      await UserModel.updateOne({ _id: row.uid }, { $addToSet: { sectionIds: row.section } });
      await TeachingAssignmentModel.updateOne(
        { instructorId: row.uid, sectionId: row.section, subjectCode: row.subjectCode },
        {
          $set: {
            instructorId: row.uid,
            sectionId: row.section,
            subjectCode: row.subjectCode,
            termId: numericTermId,
          },
        },
        { upsert: true }
      );
      summary.sectionAssignments++;
    }

    // ── Create Term document ──
    const termDoc: Term = {
      _id: crypto.randomUUID(),
      termId: numericTermId,
      label: `Term ${numericTermId}`,
      status: "active",
      createdAt: now,
      createdBy: user.id,
    };
    await TermModel.create(termDoc);

    // ── Audit ──
    await AuditEntryModel.create({
      actorId: user.id,
      action: "TERM_CREATED",
      entityType: "Term",
      entityId: String(numericTermId),
      before: null,
      after: termDoc,
      timestamp: now,
    });

    return res.status(201).json({
      termId: numericTermId,
      label: termDoc.label,
      summary,
      warnings: errors.length > 0 ? errors : undefined,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Terms] createTerm error:", err);
    return res.status(500).json({ error: "Failed to create term", details: msg });
  }
}

