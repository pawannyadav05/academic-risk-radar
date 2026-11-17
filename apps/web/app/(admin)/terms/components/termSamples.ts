export interface TermCsvFileConfig {
  key: string;
  label: string;
  columnsHint: string;
  sampleContent: string;
}

export const TERM_CSV_CONFIGS: TermCsvFileConfig[] = [
  {
    key: "sectionDetailsCsv",
    label: "Section details",
    columnsHint: "sectionname, subjectcode1, subjectcode2, ...",
    sampleContent: `sectionname,subjectcode1,subjectcode2
SEC-CSE-101,CS101,CS102
SEC-CSE-102,CS101,CS103`,
  },
  {
    key: "facultyCsv",
    label: "Faculty roster",
    columnsHint: "uid, name, department, designation, hod_uid, dean_uid",
    sampleContent: `uid,name,department,designation,hod_uid,dean_uid
FAC-001,Dr. Amit Verma,DEP-CSE,hod,,
FAC-002,Prof. Sarah Jenkins,DEP-CSE,assistant_professor,FAC-001,
FAC-003,Prof. Rajesh Kumar,DEP-CSE,assistant_professor,FAC-001,`,
  },
  {
    key: "studentCredsCsv",
    label: "Student credentials",
    columnsHint: "student_id, password",
    sampleContent: `student_id,password
12409921,RadarPass2026!
12409922,RadarPass2026!
12409923,RadarPass2026!`,
  },
  {
    key: "facultyCredsCsv",
    label: "Faculty credentials",
    columnsHint: "uid, password",
    sampleContent: `uid,password
FAC-001,FacultySecure2026!
FAC-002,FacultySecure2026!
FAC-003,FacultySecure2026!`,
  },
  {
    key: "studentMentorCsv",
    label: "Student–mentor mapping",
    columnsHint: "student_id, section, mentor_uid",
    sampleContent: `student_id,section,mentor_uid
12409921,SEC-CSE-101,FAC-001
12409922,SEC-CSE-101,FAC-001
12409923,SEC-CSE-102,FAC-002`,
  },
  {
    key: "instructorSectionCsv",
    label: "Instructor–section mapping",
    columnsHint: "uid, section, subject_code",
    sampleContent: `uid,section,subject_code
FAC-002,SEC-CSE-101,CS101
FAC-003,SEC-CSE-102,CS102`,
  },
];

export function countCsvRows(csv: string): number {
  if (!csv.trim()) return 0;
  const lines = csv.split("\n").map((l) => l.trim()).filter(Boolean);
  return Math.max(0, lines.length - 1);
}
