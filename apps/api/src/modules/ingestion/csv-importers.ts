import {
  AssessmentRecord,
  AssignmentSubmission,
  AttendanceRecord,
  LmsActivity,
  QuarantineRecord,
} from "@academic-risk-radar/shared-types";
import {
  AssessmentRecordModel,
  AssignmentSubmissionModel,
  AttendanceRecordModel,
  LmsActivityModel,
  QuarantineModel,
} from "../../db/schemas.js";

export interface ImportResult<T> {
  valid: T[];
  quarantined: QuarantineRecord[];
  totalRows: number;
}

export interface PersistenceResult {
  insertedCount: number;
  quarantinedCount: number;
  totalRows: number;
}

/**
 * Splits a CSV string into rows and trims whitespace.
 * Handles CRLF and LF line endings and ignores empty lines.
 */
export function parseRawCsvRows(csvContent: string): string[][] {
  const lines = csvContent.split(/\r?\n/).map((line) => line.trim());
  const rows: string[][] = [];

  for (const line of lines) {
    if (!line) continue;
    // Basic comma-separated value split with cell trimming
    const cells = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    rows.push(cells);
  }

  return rows;
}

/**
 * Helper to validate ISO date string
 */
function isValidDateString(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== "string") return false;
  const timestamp = Date.parse(dateStr);
  return !Number.isNaN(timestamp);
}

// ----------------------------------------------------------------------
// 1. ATTENDANCE CSV IMPORTER
// ----------------------------------------------------------------------
// Expected Header:
//   - Percentage format: studentId,courseId,percentage (or attendancePercentage)
//   - Legacy format:     studentId,sectionId,date,status,sourceRef
export function parseAttendanceCsv(
  csvContent: string,
  ingestedAt: string = new Date().toISOString()
): ImportResult<AttendanceRecord> {
  const rows = parseRawCsvRows(csvContent);
  const valid: AttendanceRecord[] = [];
  const quarantined: QuarantineRecord[] = [];

  if (rows.length === 0) {
    return { valid, quarantined, totalRows: 0 };
  }

  const [header, ...dataRows] = rows;
  const headerMap = new Map<string, number>();
  header.forEach((col, idx) => headerMap.set(col.toLowerCase().replace(/[^a-z0-9]/g, ""), idx));

  // Determine format: is it percentage-based or status-based?
  const hasPercentageCol = headerMap.has("percentage") || headerMap.has("attendancepercentage") || headerMap.has("attendance");
  const hasStatusCol = headerMap.has("status");

  if (!headerMap.has("studentid")) {
    quarantined.push({
      originalCollection: "attendanceRecords",
      rawRecord: header,
      reason: "Missing required header column: studentId",
      ingestedAt,
    });
    return { valid, quarantined, totalRows: rows.length };
  }

  if (!hasPercentageCol && !headerMap.has("sectionid")) {
    quarantined.push({
      originalCollection: "attendanceRecords",
      rawRecord: header,
      reason: "Missing required header column: sectionId",
      ingestedAt,
    });
    return { valid, quarantined, totalRows: rows.length };
  }

  if (!hasPercentageCol && !hasStatusCol) {
    quarantined.push({
      originalCollection: "attendanceRecords",
      rawRecord: header,
      reason: "Missing attendance column: requires either 'percentage' or 'status'",
      ingestedAt,
    });
    return { valid, quarantined, totalRows: rows.length };
  }

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const studentId = row[headerMap.get("studentid")!] || "";

    if (!studentId) {
      quarantined.push({
        originalCollection: "attendanceRecords",
        rawRecord: row,
        reason: "studentId is required and cannot be empty",
        ingestedAt,
      });
      continue;
    }

    if (hasPercentageCol) {
      const pctIdx = headerMap.has("percentage")
        ? headerMap.get("percentage")!
        : headerMap.has("attendancepercentage")
        ? headerMap.get("attendancepercentage")!
        : headerMap.get("attendance")!;
      const rawPctStr = row[pctIdx] || "";
      const parsedPct = parseFloat(rawPctStr.replace(/%/g, ""));

      if (Number.isNaN(parsedPct) || parsedPct < 0 || parsedPct > 100) {
        quarantined.push({
          originalCollection: "attendanceRecords",
          rawRecord: row,
          reason: `Invalid attendance percentage '${rawPctStr}'. Must be a number between 0 and 100.`,
          ingestedAt,
        });
        continue;
      }

      const courseId =
        (headerMap.has("courseid") ? row[headerMap.get("courseid")!] : null) ||
        (headerMap.has("course") ? row[headerMap.get("course")!] : null) ||
        "CS101";

      const sectionId =
        (headerMap.has("sectionid") ? row[headerMap.get("sectionid")!] : null) ||
        "SEC-CSE-101";

      const dateStr = headerMap.has("date") ? row[headerMap.get("date")!] : null;
      const date = dateStr && isValidDateString(dateStr) ? new Date(dateStr).toISOString() : new Date().toISOString();

      valid.push({
        studentId,
        sectionId,
        courseId,
        date,
        percentage: parsedPct,
        status: parsedPct < 75 ? "absent" : "present",
        sourceRef: (headerMap.has("sourceref") ? row[headerMap.get("sourceref")!] : null) || "instructor-upload",
      });
    } else {
      // Legacy status format
      const sectionId = (headerMap.has("sectionid") ? row[headerMap.get("sectionid")!] : null) || "";
      const dateStr = (headerMap.has("date") ? row[headerMap.get("date")!] : null) || "";
      const status = (headerMap.has("status") ? row[headerMap.get("status")!] : null) || "";
      const sourceRef = (headerMap.has("sourceref") ? row[headerMap.get("sourceref")!] : null) || "csv-import";

      if (!sectionId) {
        quarantined.push({
          originalCollection: "attendanceRecords",
          rawRecord: row,
          reason: "sectionId is required for session-based attendance",
          ingestedAt,
        });
        continue;
      }

      if (!isValidDateString(dateStr)) {
        quarantined.push({
          originalCollection: "attendanceRecords",
          rawRecord: row,
          reason: `Invalid ISO date format: '${dateStr}'`,
          ingestedAt,
        });
        continue;
      }

      const validStatuses = ["present", "absent", "late"] as const;
      if (!validStatuses.includes(status as any)) {
        quarantined.push({
          originalCollection: "attendanceRecords",
          rawRecord: row,
          reason: `Invalid status '${status}'. Must be one of: present, absent, late`,
          ingestedAt,
        });
        continue;
      }

      valid.push({
        studentId,
        sectionId,
        date: new Date(dateStr).toISOString(),
        status: status as "present" | "absent" | "late",
        sourceRef,
      });
    }
  }

  return { valid, quarantined, totalRows: dataRows.length };
}

// ----------------------------------------------------------------------
// 2. ASSESSMENT CSV IMPORTER
// ----------------------------------------------------------------------
// Expected Header: studentId,courseId,type,score,maxScore[,date][,sourceRef]
export function parseAssessmentCsv(
  csvContent: string,
  ingestedAt: string = new Date().toISOString()
): ImportResult<AssessmentRecord> {
  const rows = parseRawCsvRows(csvContent);
  const valid: AssessmentRecord[] = [];
  const quarantined: QuarantineRecord[] = [];

  if (rows.length === 0) {
    return { valid, quarantined, totalRows: 0 };
  }

  const [header, ...dataRows] = rows;
  const headerMap = new Map<string, number>();
  header.forEach((col, idx) => headerMap.set(col.toLowerCase().replace(/[^a-z0-9]/g, ""), idx));

  const requiredCols = ["studentid", "courseid", "type", "score", "maxscore"];
  const missingCols = requiredCols.filter((col) => !headerMap.has(col));

  if (missingCols.length > 0) {
    quarantined.push({
      originalCollection: "assessmentRecords",
      rawRecord: header,
      reason: `Missing required header column(s): ${missingCols.join(", ")}`,
      ingestedAt,
    });
    return { valid, quarantined, totalRows: rows.length };
  }

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rawObj = {
      studentId: row[headerMap.get("studentid")!] || "",
      courseId: row[headerMap.get("courseid")!] || "",
      type: row[headerMap.get("type")!] || "",
      scoreStr: row[headerMap.get("score")!] || "",
      maxScoreStr: row[headerMap.get("maxscore")!] || "",
      date: (headerMap.has("date") ? row[headerMap.get("date")!] : "") || "",
      sourceRef: (headerMap.has("sourceref") ? row[headerMap.get("sourceref")!] : "") || "",
    };

    if (!rawObj.studentId) {
      quarantined.push({
        originalCollection: "assessmentRecords",
        rawRecord: rawObj,
        reason: "studentId is required and cannot be empty",
        ingestedAt,
      });
      continue;
    }

    if (!rawObj.courseId) {
      quarantined.push({
        originalCollection: "assessmentRecords",
        rawRecord: rawObj,
        reason: "courseId is required and cannot be empty",
        ingestedAt,
      });
      continue;
    }

    let finalDate = new Date().toISOString();
    if (rawObj.date) {
      if (!isValidDateString(rawObj.date)) {
        quarantined.push({
          originalCollection: "assessmentRecords",
          rawRecord: rawObj,
          reason: `Invalid ISO date format: '${rawObj.date}'`,
          ingestedAt,
        });
        continue;
      }
      finalDate = new Date(rawObj.date).toISOString();
    }

    const score = Number(rawObj.scoreStr);
    const maxScore = Number(rawObj.maxScoreStr);

    if (Number.isNaN(score) || Number.isNaN(maxScore)) {
      quarantined.push({
        originalCollection: "assessmentRecords",
        rawRecord: rawObj,
        reason: "Score and maxScore must be valid numbers",
        ingestedAt,
      });
      continue;
    }

    if (maxScore <= 0) {
      quarantined.push({
        originalCollection: "assessmentRecords",
        rawRecord: rawObj,
        reason: "maxScore must be strictly greater than 0",
        ingestedAt,
      });
      continue;
    }

    if (score < 0 || score > maxScore) {
      quarantined.push({
        originalCollection: "assessmentRecords",
        rawRecord: rawObj,
        reason: `score (${score}) must be between 0 and maxScore (${maxScore})`,
        ingestedAt,
      });
      continue;
    }

    valid.push({
      studentId: rawObj.studentId,
      courseId: rawObj.courseId,
      type: rawObj.type || "quiz",
      score,
      maxScore,
      date: finalDate,
      sourceRef: rawObj.sourceRef || "instructor-upload",
    });
  }

  return { valid, quarantined, totalRows: dataRows.length };
}

// ----------------------------------------------------------------------
// 3. ASSIGNMENT SUBMISSION CSV IMPORTER
// ----------------------------------------------------------------------
// Expected Header: studentId,courseId,assignmentId,submittedAt,status
export function parseAssignmentCsv(
  csvContent: string,
  ingestedAt: string = new Date().toISOString()
): ImportResult<AssignmentSubmission> {
  const rows = parseRawCsvRows(csvContent);
  const valid: AssignmentSubmission[] = [];
  const quarantined: QuarantineRecord[] = [];

  if (rows.length === 0) {
    return { valid, quarantined, totalRows: 0 };
  }

  const [header, ...dataRows] = rows;
  const headerMap = new Map<string, number>();
  header.forEach((col, idx) => headerMap.set(col.toLowerCase(), idx));

  const requiredCols = ["studentid", "courseid", "assignmentid", "status"];
  const missingCols = requiredCols.filter((col) => !headerMap.has(col));

  if (missingCols.length > 0) {
    quarantined.push({
      originalCollection: "assignmentSubmissions",
      rawRecord: header,
      reason: `Missing required header column(s): ${missingCols.join(", ")}`,
      ingestedAt,
    });
    return { valid, quarantined, totalRows: rows.length };
  }

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rawObj = {
      studentId: row[headerMap.get("studentid")!] || "",
      courseId: row[headerMap.get("courseid")!] || "",
      assignmentId: row[headerMap.get("assignmentid")!] || "",
      submittedAtStr: headerMap.has("submittedat") ? row[headerMap.get("submittedat")!] || "" : "",
      status: row[headerMap.get("status")!] || "",
    };

    if (!rawObj.studentId) {
      quarantined.push({
        originalCollection: "assignmentSubmissions",
        rawRecord: rawObj,
        reason: "studentId is required and cannot be empty",
        ingestedAt,
      });
      continue;
    }

    if (!rawObj.courseId || !rawObj.assignmentId) {
      quarantined.push({
        originalCollection: "assignmentSubmissions",
        rawRecord: rawObj,
        reason: "courseId and assignmentId are required",
        ingestedAt,
      });
      continue;
    }

    const validStatuses = ["submitted", "missing", "late"] as const;
    if (!validStatuses.includes(rawObj.status as (typeof validStatuses)[number])) {
      quarantined.push({
        originalCollection: "assignmentSubmissions",
        rawRecord: rawObj,
        reason: `Invalid status '${rawObj.status}'. Must be one of: submitted, missing, late`,
        ingestedAt,
      });
      continue;
    }

    let submittedAt: string | null = null;
    if (rawObj.submittedAtStr && rawObj.submittedAtStr.toLowerCase() !== "null") {
      if (!isValidDateString(rawObj.submittedAtStr)) {
        quarantined.push({
          originalCollection: "assignmentSubmissions",
          rawRecord: rawObj,
          reason: `Invalid ISO date for submittedAt: '${rawObj.submittedAtStr}'`,
          ingestedAt,
        });
        continue;
      }
      submittedAt = new Date(rawObj.submittedAtStr).toISOString();
    }

    valid.push({
      studentId: rawObj.studentId,
      courseId: rawObj.courseId,
      assignmentId: rawObj.assignmentId,
      submittedAt,
      status: rawObj.status as "submitted" | "missing" | "late",
    });
  }

  return { valid, quarantined, totalRows: dataRows.length };
}

// ----------------------------------------------------------------------
// 4. LMS ACTIVITY CSV IMPORTER
// ----------------------------------------------------------------------
// Expected Header: studentId,courseId,date,activityType,durationSec
export function parseLmsActivityCsv(
  csvContent: string,
  ingestedAt: string = new Date().toISOString()
): ImportResult<LmsActivity> {
  const rows = parseRawCsvRows(csvContent);
  const valid: LmsActivity[] = [];
  const quarantined: QuarantineRecord[] = [];

  if (rows.length === 0) {
    return { valid, quarantined, totalRows: 0 };
  }

  const [header, ...dataRows] = rows;
  const headerMap = new Map<string, number>();
  header.forEach((col, idx) => headerMap.set(col.toLowerCase(), idx));

  const requiredCols = ["studentid", "courseid", "date", "activitytype", "durationsec"];
  const missingCols = requiredCols.filter((col) => !headerMap.has(col));

  if (missingCols.length > 0) {
    quarantined.push({
      originalCollection: "lmsActivity",
      rawRecord: header,
      reason: `Missing required header column(s): ${missingCols.join(", ")}`,
      ingestedAt,
    });
    return { valid, quarantined, totalRows: rows.length };
  }

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rawObj = {
      studentId: row[headerMap.get("studentid")!] || "",
      courseId: row[headerMap.get("courseid")!] || "",
      date: row[headerMap.get("date")!] || "",
      activityType: row[headerMap.get("activitytype")!] || "",
      durationSecStr: row[headerMap.get("durationsec")!] || "",
    };

    if (!rawObj.studentId) {
      quarantined.push({
        originalCollection: "lmsActivity",
        rawRecord: rawObj,
        reason: "studentId is required and cannot be empty",
        ingestedAt,
      });
      continue;
    }

    if (!rawObj.courseId) {
      quarantined.push({
        originalCollection: "lmsActivity",
        rawRecord: rawObj,
        reason: "courseId is required and cannot be empty",
        ingestedAt,
      });
      continue;
    }

    if (!isValidDateString(rawObj.date)) {
      quarantined.push({
        originalCollection: "lmsActivity",
        rawRecord: rawObj,
        reason: `Invalid ISO date format: '${rawObj.date}'`,
        ingestedAt,
      });
      continue;
    }

    const durationSec = Number(rawObj.durationSecStr);
    if (Number.isNaN(durationSec) || durationSec < 0) {
      quarantined.push({
        originalCollection: "lmsActivity",
        rawRecord: rawObj,
        reason: `durationSec must be a non-negative number, got '${rawObj.durationSecStr}'`,
        ingestedAt,
      });
      continue;
    }

    valid.push({
      studentId: rawObj.studentId,
      courseId: rawObj.courseId,
      date: new Date(rawObj.date).toISOString(),
      activityType: rawObj.activityType || "page_view",
      durationSec,
    });
  }

  return { valid, quarantined, totalRows: dataRows.length };
}

// ----------------------------------------------------------------------
// PERSISTENCE HELPERS (With Idempotent Upserts)
// ----------------------------------------------------------------------

export async function importAttendanceFromCsv(csvContent: string): Promise<PersistenceResult> {
  const result = parseAttendanceCsv(csvContent);

  if (result.quarantined.length > 0) {
    await QuarantineModel.insertMany(result.quarantined);
  }

  if (result.valid.length > 0) {
    const ops = result.valid.map((record) => {
      // If courseId and percentage are present, upsert for that student & course
      if (record.courseId && typeof record.percentage === "number") {
        return {
          updateOne: {
            filter: { studentId: record.studentId, courseId: record.courseId },
            update: { $set: record },
            upsert: true,
          },
        };
      }
      return {
        updateOne: {
          filter: { studentId: record.studentId, sectionId: record.sectionId, date: record.date },
          update: { $set: record },
          upsert: true,
        },
      };
    });
    await AttendanceRecordModel.bulkWrite(ops);
  }

  return {
    insertedCount: result.valid.length,
    quarantinedCount: result.quarantined.length,
    totalRows: result.totalRows,
  };
}

export async function importAssessmentFromCsv(csvContent: string): Promise<PersistenceResult> {
  const result = parseAssessmentCsv(csvContent);

  if (result.quarantined.length > 0) {
    await QuarantineModel.insertMany(result.quarantined);
  }

  if (result.valid.length > 0) {
    const ops = result.valid.map((record) => ({
      updateOne: {
        filter: {
          studentId: record.studentId,
          courseId: record.courseId,
          type: record.type,
          date: record.date,
        },
        update: { $set: record },
        upsert: true,
      },
    }));
    await AssessmentRecordModel.bulkWrite(ops);
  }

  return {
    insertedCount: result.valid.length,
    quarantinedCount: result.quarantined.length,
    totalRows: result.totalRows,
  };
}

export async function importAssignmentFromCsv(csvContent: string): Promise<PersistenceResult> {
  const result = parseAssignmentCsv(csvContent);

  if (result.quarantined.length > 0) {
    await QuarantineModel.insertMany(result.quarantined);
  }

  if (result.valid.length > 0) {
    const ops = result.valid.map((record) => ({
      updateOne: {
        filter: { studentId: record.studentId, assignmentId: record.assignmentId },
        update: { $set: record },
        upsert: true,
      },
    }));
    await AssignmentSubmissionModel.bulkWrite(ops);
  }

  return {
    insertedCount: result.valid.length,
    quarantinedCount: result.quarantined.length,
    totalRows: result.totalRows,
  };
}

export async function importLmsActivityFromCsv(csvContent: string): Promise<PersistenceResult> {
  const result = parseLmsActivityCsv(csvContent);

  if (result.quarantined.length > 0) {
    await QuarantineModel.insertMany(result.quarantined);
  }

  if (result.valid.length > 0) {
    // Idempotent upsert: same student + course + date + activityType -> update instead of duplicate
    const ops = result.valid.map((record) => ({
      updateOne: {
        filter: {
          studentId: record.studentId,
          courseId: record.courseId,
          date: record.date,
          activityType: record.activityType,
        },
        update: { $set: record },
        upsert: true,
      },
    }));
    await LmsActivityModel.bulkWrite(ops);
  }

  return {
    insertedCount: result.valid.length,
    quarantinedCount: result.quarantined.length,
    totalRows: result.totalRows,
  };
}
