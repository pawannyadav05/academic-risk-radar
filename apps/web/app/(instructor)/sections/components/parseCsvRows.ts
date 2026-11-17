export interface ParsedCsvRow {
  index: number;
  raw: Record<string, string>;
  error?: string;
}

export interface CsvParseResult {
  headers: string[];
  previewRows: ParsedCsvRow[];
  totalRows: number;
  validCount: number;
  issueCount: number;
}

export function parseCsvRows(
  csvContent: string,
  selectedSubject: string,
  importSource: "attendance" | "assessment"
): CsvParseResult {
  const rawLines = csvContent
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (rawLines.length === 0) {
    return { headers: [], previewRows: [], totalRows: 0, validCount: 0, issueCount: 0 };
  }

  const headerCols = rawLines[0].split(",").map((c) => c.trim());
  const dataLines = rawLines.slice(1);
  const seenStudentIds = new Set<string>();

  let valid = 0;
  let issues = 0;
  const parsed: ParsedCsvRow[] = [];

  dataLines.forEach((line, idx) => {
    const cols = line.split(",").map((c) => c.trim());
    const rowObj: Record<string, string> = {};
    headerCols.forEach((h, colIdx) => {
      rowObj[h] = cols[colIdx] ?? "";
    });

    const studentId = rowObj.studentId || rowObj.student_id;
    const courseId = rowObj.courseId || rowObj.course_id;
    const pctStr = rowObj.percentage || rowObj.attendance;
    const scoreStr = rowObj.score;
    const maxScoreStr = rowObj.maxScore || rowObj.max_score;

    let error: string | undefined;

    if (!studentId) {
      error = "Missing student ID";
    } else if (seenStudentIds.has(studentId)) {
      error = `Duplicate student ID ${studentId}`;
    } else if (courseId && selectedSubject && courseId.toLowerCase() !== selectedSubject.toLowerCase()) {
      error = `Course ${courseId} does not match selected ${selectedSubject}`;
    } else if (importSource === "attendance") {
      const pctNum = parseFloat(pctStr);
      if (isNaN(pctNum) || pctNum < 0 || pctNum > 100) {
        error = "Percentage must be a number between 0 and 100";
      }
    } else if (importSource === "assessment") {
      const scNum = parseFloat(scoreStr);
      const maxNum = parseFloat(maxScoreStr);
      if (isNaN(scNum) || isNaN(maxNum) || scNum < 0 || maxNum <= 0 || scNum > maxNum) {
        error = "Score must be a positive number ≤ max score";
      }
    }

    if (studentId) seenStudentIds.add(studentId);

    if (error) {
      issues++;
    } else {
      valid++;
    }

    parsed.push({ index: idx + 1, raw: rowObj, error });
  });

  return {
    headers: headerCols,
    previewRows: parsed.slice(0, 10),
    totalRows: dataLines.length,
    validCount: valid,
    issueCount: issues,
  };
}
