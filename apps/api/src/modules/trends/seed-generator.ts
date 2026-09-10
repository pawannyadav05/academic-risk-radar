import {
  AssessmentRecord,
  AssignmentSubmission,
  AttendanceRecord,
  LmsActivity,
  MentorAssignment,
  Student,
} from "@academic-risk-radar/shared-types";
import {
  AssessmentRecordModel,
  AssignmentSubmissionModel,
  AttendanceRecordModel,
  LmsActivityModel,
  MentorAssignmentModel,
  StudentModel,
} from "../../db/schemas.js";

export interface SeedGeneratorOptions {
  studentCount?: number;
  deteriorationRatio?: number; // Target ratio of students showing downward trend (e.g. 0.18 = 18%)
  weeksHistory?: number;
  seed?: number;
}

export interface SyntheticSeedData {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  assessmentRecords: AssessmentRecord[];
  assignmentSubmissions: AssignmentSubmission[];
  lmsActivities: LmsActivity[];
  mentorAssignments: MentorAssignment[];
  deterioratedStudentIds: string[];
}

/**
 * Simple pseudo-random number generator for deterministic reproducible seeding
 */
function createPrng(seedVal: number = 42) {
  let s = seedVal;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const FIRST_NAMES = ["Aarav", "Ananya", "Rohan", "Priya", "Vikram", "Isha", "Kabir", "Neha", "Aditya", "Riya", "Dev", "Sanya", "Arjun", "Diya", "Karan", "Meera"];
const LAST_NAMES = ["Sharma", "Verma", "Gupta", "Patel", "Singh", "Kumar", "Rao", "Joshi", "Mehta", "Nair", "Das", "Chopra"];
const PROGRAMMES = ["B.Tech CS", "B.Tech ECE", "BCA", "B.Sc Data Science"];
const SECTION_IDS = ["SEC-A1", "SEC-A2", "SEC-B1", "SEC-B2"];
const COURSE_IDS = ["CS101", "CS102", "MATH201", "DS105"];
const MENTOR_IDS = ["MTR-001", "MTR-002", "MTR-003", "MTR-004"];

/**
 * Generate synthetic academic records with 15-20% engineered downward trend deterioration
 */
export function generateSyntheticSeedData(options: SeedGeneratorOptions = {}): SyntheticSeedData {
  const count = options.studentCount ?? 50;
  const ratio = options.deteriorationRatio ?? 0.18;
  const weeks = options.weeksHistory ?? 6;
  const rand = createPrng(options.seed ?? 42);

  const deterioratedCount = Math.max(1, Math.round(count * ratio));
  const students: Student[] = [];
  const attendanceRecords: AttendanceRecord[] = [];
  const assessmentRecords: AssessmentRecord[] = [];
  const assignmentSubmissions: AssignmentSubmission[] = [];
  const lmsActivities: LmsActivity[] = [];
  const mentorAssignments: MentorAssignment[] = [];
  const deterioratedStudentIds: string[] = [];

  // Generate Students & Mentor Assignments
  for (let i = 1; i <= count; i++) {
    const studentId = `STD-${1000 + i}`;
    const name = `${FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]}`;
    const enrolmentId = `ENR2026${String(i).padStart(4, "0")}`;
    const section = SECTION_IDS[i % SECTION_IDS.length];
    const programme = PROGRAMMES[i % PROGRAMMES.length];
    const mentorId = MENTOR_IDS[i % MENTOR_IDS.length];

    students.push({
      _id: studentId,
      name,
      enrolmentId,
      sectionIds: [section],
      programme,
    });

    mentorAssignments.push({
      studentId,
      mentorId,
      assignedFrom: "2026-08-01T00:00:00.000Z",
      assignedTo: null,
    });
  }

  // Select 15-20% of students for downward trend deterioration
  for (let i = 0; i < deterioratedCount; i++) {
    deterioratedStudentIds.push(students[i]._id);
  }

  const baseDate = new Date("2026-08-01T09:00:00.000Z");

  // Generate weekly timeline data
  for (let w = 1; w <= weeks; w++) {
    const weekStartDate = new Date(baseDate.getTime() + (w - 1) * 7 * 24 * 60 * 60 * 1000);
    const progressRatio = w / weeks; // 0.16 to 1.0

    for (const student of students) {
      const isDeteriorating = deterioratedStudentIds.includes(student._id);
      const section = student.sectionIds[0];

      // 1. Attendance Records (3 sessions per week)
      for (let day = 0; day < 3; day++) {
        const sessionDate = new Date(weekStartDate.getTime() + day * 2 * 24 * 60 * 60 * 1000);
        const isoDate = sessionDate.toISOString();

        let status: "present" | "absent" | "late" = "present";
        if (isDeteriorating) {
          // Attendance drops severely in recent weeks (e.g. from 90% -> 30%)
          const failProb = 0.10 + 0.70 * Math.pow(progressRatio, 2);
          const draw = rand();
          if (draw < failProb * 0.8) {
            status = "absent";
          } else if (draw < failProb) {
            status = "late";
          }
        } else {
          // Healthy student: ~92% attendance
          const draw = rand();
          if (draw < 0.05) status = "absent";
          else if (draw < 0.08) status = "late";
        }

        attendanceRecords.push({
          studentId: student._id,
          sectionId: section,
          date: isoDate,
          status,
          sourceRef: `ERP-ATT-W${w}-D${day + 1}`,
        });
      }

      // 2. Assessment Records (1 assessment per week across courses)
      const courseId = COURSE_IDS[(w - 1) % COURSE_IDS.length];
      const maxScore = 100;
      let score = 85;

      if (isDeteriorating) {
        // Assessment score drops from ~85 to ~35 over weeks
        const baseScore = 85 - (50 * Math.pow(progressRatio, 1.5));
        const noise = (rand() - 0.5) * 10;
        score = Math.max(25, Math.min(100, Math.round(baseScore + noise)));
      } else {
        // Healthy student score ~80-95
        const noise = (rand() - 0.5) * 15;
        score = Math.max(65, Math.min(100, Math.round(85 + noise)));
      }

      assessmentRecords.push({
        studentId: student._id,
        courseId,
        type: w % 2 === 0 ? "quiz" : "midterm",
        score,
        maxScore,
        date: weekStartDate.toISOString(),
        sourceRef: `LMS-ASSESS-W${w}`,
      });

      // 3. Assignment Submissions (1 assignment per week)
      const assignmentId = `ASG-W${w}-${courseId}`;
      let assignStatus: "submitted" | "missing" | "late" = "submitted";
      let submittedAt: string | null = weekStartDate.toISOString();

      if (isDeteriorating) {
        const missingProb = 0.10 + 0.65 * progressRatio;
        const draw = rand();
        if (draw < missingProb * 0.7) {
          assignStatus = "missing";
          submittedAt = null;
        } else if (draw < missingProb) {
          assignStatus = "late";
          submittedAt = new Date(weekStartDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
        }
      } else {
        const draw = rand();
        if (draw < 0.04) {
          assignStatus = "missing";
          submittedAt = null;
        } else if (draw < 0.08) {
          assignStatus = "late";
          submittedAt = new Date(weekStartDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString();
        }
      }

      assignmentSubmissions.push({
        studentId: student._id,
        courseId,
        assignmentId,
        submittedAt,
        status: assignStatus,
      });

      // 4. LMS Activity (Weekly engagement duration)
      let durationSec = 3600; // 1 hour baseline
      if (isDeteriorating) {
        // LMS engagement drops from 3600s -> ~300s
        const targetDuration = 3600 * (1 - 0.85 * progressRatio);
        durationSec = Math.max(120, Math.round(targetDuration + (rand() - 0.5) * 300));
      } else {
        durationSec = Math.round(3600 + (rand() - 0.5) * 1200);
      }

      lmsActivities.push({
        studentId: student._id,
        courseId,
        date: weekStartDate.toISOString(),
        activityType: "video_lecture_watch",
        durationSec,
      });
    }
  }

  return {
    students,
    attendanceRecords,
    assessmentRecords,
    assignmentSubmissions,
    lmsActivities,
    mentorAssignments,
    deterioratedStudentIds,
  };
}

/**
 * Persist generated seed data to MongoDB
 */
export async function seedDatabase(data?: SyntheticSeedData): Promise<{ seeded: boolean; counts: Record<string, number> }> {
  const seedData = data ?? generateSyntheticSeedData();

  await Promise.all([
    StudentModel.deleteMany({}),
    AttendanceRecordModel.deleteMany({}),
    AssessmentRecordModel.deleteMany({}),
    AssignmentSubmissionModel.deleteMany({}),
    LmsActivityModel.deleteMany({}),
    MentorAssignmentModel.deleteMany({}),
  ]);

  await StudentModel.insertMany(seedData.students);
  await AttendanceRecordModel.insertMany(seedData.attendanceRecords);
  await AssessmentRecordModel.insertMany(seedData.assessmentRecords);
  await AssignmentSubmissionModel.insertMany(seedData.assignmentSubmissions);
  await LmsActivityModel.insertMany(seedData.lmsActivities);
  await MentorAssignmentModel.insertMany(seedData.mentorAssignments);

  const counts = {
    students: seedData.students.length,
    attendanceRecords: seedData.attendanceRecords.length,
    assessmentRecords: seedData.assessmentRecords.length,
    assignmentSubmissions: seedData.assignmentSubmissions.length,
    lmsActivities: seedData.lmsActivities.length,
    mentorAssignments: seedData.mentorAssignments.length,
    deterioratedStudents: seedData.deterioratedStudentIds.length,
  };

  return { seeded: true, counts };
}

// Direct CLI Execution
if (process.argv[1] && process.argv[1].endsWith("seed-generator.js")) {
  const seedData = generateSyntheticSeedData({ studentCount: 50, deteriorationRatio: 0.18 });
  console.log("==========================================");
  console.log("Academic Risk Radar — Synthetic Seed Data");
  console.log("==========================================");
  console.log(`Generated Students: ${seedData.students.length}`);
  console.log(`Deteriorated Students (18%): ${seedData.deterioratedStudentIds.length} [${seedData.deterioratedStudentIds.join(", ")}]`);
  console.log(`Attendance Records: ${seedData.attendanceRecords.length}`);
  console.log(`Assessment Records: ${seedData.assessmentRecords.length}`);
  console.log(`Assignment Submissions: ${seedData.assignmentSubmissions.length}`);
  console.log(`LMS Activities: ${seedData.lmsActivities.length}`);
  console.log(`Mentor Assignments: ${seedData.mentorAssignments.length}`);
  console.log("==========================================");
}
