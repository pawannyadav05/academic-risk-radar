import { PreviewRow } from "./ConnectorPreviewTable";

export const CONNECTOR_SAMPLES: Record<string, string> = {
  attendance: `studentId,sectionId,date,status,sourceRef
12409921,SEC-CSE-101,2026-03-01T09:00:00Z,present,RFID_GATE_1
12409922,SEC-CSE-101,2026-03-01T09:00:00Z,absent,RFID_GATE_1
12409923,SEC-CSE-101,2026-03-01T09:00:00Z,late,RFID_GATE_1
,SEC-CSE-101,2026-03-01T09:00:00Z,present,RFID_GATE_1`, // row 4 empty studentId demo

  assessment: `studentId,courseId,type,score,maxScore,date,sourceRef
12409921,CS101,Midterm,85,100,2026-03-15T10:00:00Z,ERP_SYSTEM
12409922,CS101,Midterm,72,100,2026-03-15T10:00:00Z,ERP_SYSTEM
12409923,CS101,Midterm,110,100,2026-03-15T10:00:00Z,ERP_SYSTEM`, // row 3 score > maxScore demo

  assignment: `studentId,courseId,assignmentId,submittedAt,status
12409921,CS101,HW1,2026-02-10T18:00:00Z,submitted
12409922,CS101,HW1,null,missing
12409923,CS101,HW1,2026-02-11T02:00:00Z,late`,

  lms: `studentId,courseId,date,activityType,durationSec
12409921,CS101,2026-02-15T14:30:00Z,video_lecture,1800
12409922,CS101,2026-02-15T15:00:00Z,quiz_attempt,600
12409923,CS101,2026-02-15T16:00:00Z,forum_post,300`,
};

export const REQUIRED_HEADERS: Record<string, string[]> = {
  attendance: ["studentId", "sectionId", "date", "status"],
  assessment: ["studentId", "courseId", "type", "score", "maxScore"],
  assignment: ["studentId", "courseId", "assignmentId", "status"],
  lms: ["studentId", "courseId", "date", "activityType"],
};

export function validateCsvPreview(source: string, csv: string): {
  headers: string[];
  previewRows: PreviewRow[];
  totalRows: number;
  invalidCount: number;
  headerError?: string;
} {
  const lines = csv.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { headers: [], previewRows: [], totalRows: 0, invalidCount: 0 };
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  const expected = REQUIRED_HEADERS[source] || [];
  const missingHeaders = expected.filter((exp) => !headers.some((h) => h.toLowerCase() === exp.toLowerCase()));

  const headerError =
    missingHeaders.length > 0
      ? `Missing required column${missingHeaders.length > 1 ? "s" : ""}: ${missingHeaders.join(", ")}`
      : undefined;

  const dataLines = lines.slice(1);
  let invalidCount = 0;

  const previewRows: PreviewRow[] = dataLines.slice(0, 10).map((line, idx) => {
    const cols = line.split(",").map((c) => c.trim());
    const rowObj: Record<string, string> = {};
    headers.forEach((h, colIdx) => {
      rowObj[h] = cols[colIdx] ?? "";
    });

    let error: string | undefined;
    const studentId = rowObj.studentId || rowObj.student_id;
    const dateVal = rowObj.date || rowObj.submittedAt;

    if (!studentId) {
      error = "Missing studentId";
    } else if (dateVal && dateVal !== "null" && isNaN(Date.parse(dateVal))) {
      error = `Invalid date format: '${dateVal}'`;
    }

    if (error) invalidCount++;

    return {
      index: idx,
      data: rowObj,
      error,
    };
  });

  return {
    headers,
    previewRows,
    totalRows: dataLines.length,
    invalidCount,
    headerError,
  };
}
