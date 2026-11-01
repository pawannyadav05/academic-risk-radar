import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  Alert,
  AssessmentRecord,
  AssignmentSubmission,
  AttendanceRecord,
  AuditEntry,
  LmsActivity,
  MentorAssignment,
  RiskModelVersion,
  RiskSnapshot,
  Student,
  User,
} from "@academic-risk-radar/shared-types";
import {
  AlertModel,
  AssessmentRecordModel,
  AssignmentSubmissionModel,
  AttendanceRecordModel,
  AuditEntryModel,
  LmsActivityModel,
  MentorAssignmentModel,
  RiskModelVersionModel,
  RiskSnapshotModel,
  StudentModel,
  UserModel,
} from "../../db/schemas.js";
import { computeRiskSnapshot, DEFAULT_MODEL_VERSION } from "@academic-risk-radar/scoring-engine";

/**
 * Deterministic Database Demo Seeding Script
 *
 * Scope: Demonstration Ready (5 Numeric Students, 2 Instructors, Subject Attendance Averaging)
 *
 * Seeds:
 * 1. 2 Instructors:
 *    - instructor1@radar.edu (and instructor@radar.edu alias) -> Prof. Rajesh Iyer (CS101)
 *    - instructor2@radar.edu -> Dr. Meera Nambiar (CS102)
 * 2. 1 Mentor:
 *    - mentor@radar.edu -> Dr. Sunita Rao (MTR-001)
 * 3. 1 HoD, 1 Dean, 1 Admin:
 *    - hod@radar.edu, dean@radar.edu, admin@radar.edu
 * 4. 5 Students with 8-digit numeric IDs (12409921 to 12409925):
 *    - 12409921: Aarav Patel
 *    - 12409922: Rahul Sharma (Primary high-risk student, logs in via student@radar.edu or 12409922@radar.edu)
 *    - 12409923: Priya Sen
 *    - 12409924: Vikram Kumar
 *    - 12409925: Ananya Verma
 * 5. Subject Attendance percentages for CS101 and CS102 for all 5 students:
 *    - Overall student attendance is calculated as the average of both instructors' subject percentages.
 * 6. Historical Assessment Marks preserved for all students across CS101 and CS102.
 * 7. Real-time Risk Snapshots and Alerts.
 */

export interface SeedDemoSummary {
  seeded: boolean;
  usersCount: number;
  studentsCount: number;
  mentorAssignmentsCount: number;
  attendanceRecordsCount: number;
  assessmentRecordsCount: number;
  assignmentSubmissionsCount: number;
  lmsActivitiesCount: number;
  riskSnapshotsCount: number;
  alertsCount: number;
  modelVersionsCount: number;
}

export async function seedDemoDatabase(customMongoUri?: string): Promise<SeedDemoSummary> {
  const mongoUri =
    customMongoUri ||
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/academic_risk_radar";

  const shouldDisconnect = mongoose.connection.readyState === 0;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  // 1. Generate standard bcrypt hash for demo password: Password123!
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync("Password123!", salt);

  // 2. Define Institutional Accounts
  const demoUsers: User[] = [
    // Instructor 1 (CS101)
    {
      _id: "INS-001",
      name: "Prof. Rajesh Iyer",
      email: "instructor1@radar.edu",
      role: "instructor",
      passwordHash,
      departmentId: "DEP-CSE",
      sectionIds: ["SEC-CSE-101"],
      identityId: "INS-001",
    },
    // Instructor 1 Alias for convenience
    {
      _id: "INS-001-ALIAS",
      name: "Prof. Rajesh Iyer",
      email: "instructor@radar.edu",
      role: "instructor",
      passwordHash,
      departmentId: "DEP-CSE",
      sectionIds: ["SEC-CSE-101"],
      identityId: "INS-001",
    },
    // Instructor 2 (CS102)
    {
      _id: "INS-002",
      name: "Dr. Meera Nambiar",
      email: "instructor2@radar.edu",
      role: "instructor",
      passwordHash,
      departmentId: "DEP-CSE",
      sectionIds: ["SEC-CSE-101"],
      identityId: "INS-002",
    },
    // Mentor
    {
      _id: "MTR-001",
      name: "Dr. Sunita Rao",
      email: "mentor@radar.edu",
      role: "mentor",
      passwordHash,
      departmentId: "DEP-CSE",
      sectionIds: ["SEC-CSE-101"],
      identityId: "MTR-001",
    },
    // HoD
    {
      _id: "HOD-001",
      name: "Dr. Amit Verma",
      email: "hod@radar.edu",
      role: "hod",
      passwordHash,
      departmentId: "DEP-CSE",
      identityId: "HOD-001",
    },
    // Dean
    {
      _id: "DEAN-001",
      name: "Dr. Kavita Narang",
      email: "dean@radar.edu",
      role: "dean",
      passwordHash,
      identityId: "DEAN-001",
    },
    // Admin
    {
      _id: "ADM-001",
      name: "System Administrator",
      email: "admin@radar.edu",
      role: "admin",
      passwordHash,
      identityId: "ADM-001",
    },
    // 5 Student Accounts
    {
      _id: "12409921",
      name: "Aarav Patel",
      email: "12409921@radar.edu",
      role: "student",
      passwordHash,
      departmentId: "DEP-CSE",
      sectionIds: ["SEC-CSE-101"],
      identityId: "12409921",
    },
    {
      _id: "12409922",
      name: "Rahul Sharma",
      email: "12409922@radar.edu",
      role: "student",
      passwordHash,
      departmentId: "DEP-CSE",
      sectionIds: ["SEC-CSE-101"],
      identityId: "12409922",
    },
    {
      _id: "12409922-ALIAS",
      name: "Rahul Sharma",
      email: "student@radar.edu",
      role: "student",
      passwordHash,
      departmentId: "DEP-CSE",
      sectionIds: ["SEC-CSE-101"],
      identityId: "12409922",
    },
    {
      _id: "12409923",
      name: "Priya Sen",
      email: "12409923@radar.edu",
      role: "student",
      passwordHash,
      departmentId: "DEP-CSE",
      sectionIds: ["SEC-CSE-101"],
      identityId: "12409923",
    },
    {
      _id: "12409924",
      name: "Vikram Kumar",
      email: "12409924@radar.edu",
      role: "student",
      passwordHash,
      departmentId: "DEP-CSE",
      sectionIds: ["SEC-CSE-101"],
      identityId: "12409924",
    },
    {
      _id: "12409925",
      name: "Ananya Verma",
      email: "12409925@radar.edu",
      role: "student",
      passwordHash,
      departmentId: "DEP-CSE",
      sectionIds: ["SEC-CSE-101"],
      identityId: "12409925",
    },
  ];

  // 3. Define 5 Students in Section SEC-CSE-101
  const demoStudents: Student[] = [
    {
      _id: "12409921",
      name: "Aarav Patel",
      enrolmentId: "12409921",
      sectionIds: ["SEC-CSE-101"],
      programme: "B.Tech Computer Science & Engineering",
    },
    {
      _id: "12409922",
      name: "Rahul Sharma",
      enrolmentId: "12409922",
      sectionIds: ["SEC-CSE-101"],
      programme: "B.Tech Computer Science & Engineering",
    },
    {
      _id: "12409923",
      name: "Priya Sen",
      enrolmentId: "12409923",
      sectionIds: ["SEC-CSE-101"],
      programme: "B.Tech Computer Science & Engineering",
    },
    {
      _id: "12409924",
      name: "Vikram Kumar",
      enrolmentId: "12409924",
      sectionIds: ["SEC-CSE-101"],
      programme: "B.Tech Computer Science & Engineering",
    },
    {
      _id: "12409925",
      name: "Ananya Verma",
      enrolmentId: "12409925",
      sectionIds: ["SEC-CSE-101"],
      programme: "B.Tech Computer Science & Engineering",
    },
  ];

  // 4. Mentor Assignments (All 5 assigned to MTR-001 Dr. Sunita Rao)
  const demoMentorAssignments: MentorAssignment[] = demoStudents.map((s) => ({
    studentId: s._id,
    mentorId: "MTR-001",
    assignedFrom: "2026-08-01T00:00:00.000Z",
    assignedTo: null,
  }));

  // 5. Subject Attendance Records
  // Overall attendance is the average across both instructors (CS101 + CS102)
  // For 12409922: CS101 = 60%, CS102 = 70% -> Average = 65% (High Risk)
  // For cohort: CS101 and CS102 are 85% to 95% -> Average >= 87% (Healthy)
  const attendanceRecords: AttendanceRecord[] = [
    // 12409922 (Rahul Sharma)
    {
      studentId: "12409922",
      sectionId: "SEC-CSE-101",
      courseId: "CS101",
      date: "2026-10-20T09:00:00.000Z",
      percentage: 60,
      status: "absent",
      sourceRef: "INS-001-UPLOAD",
    },
    {
      studentId: "12409922",
      sectionId: "SEC-CSE-101",
      courseId: "CS102",
      date: "2026-10-20T11:00:00.000Z",
      percentage: 70,
      status: "absent",
      sourceRef: "INS-002-UPLOAD",
    },
    // 12409921
    {
      studentId: "12409921",
      sectionId: "SEC-CSE-101",
      courseId: "CS101",
      date: "2026-10-20T09:00:00.000Z",
      percentage: 90,
      status: "present",
      sourceRef: "INS-001-UPLOAD",
    },
    {
      studentId: "12409921",
      sectionId: "SEC-CSE-101",
      courseId: "CS102",
      date: "2026-10-20T11:00:00.000Z",
      percentage: 92,
      status: "present",
      sourceRef: "INS-002-UPLOAD",
    },
    // 12409923
    {
      studentId: "12409923",
      sectionId: "SEC-CSE-101",
      courseId: "CS101",
      date: "2026-10-20T09:00:00.000Z",
      percentage: 85,
      status: "present",
      sourceRef: "INS-001-UPLOAD",
    },
    {
      studentId: "12409923",
      sectionId: "SEC-CSE-101",
      courseId: "CS102",
      date: "2026-10-20T11:00:00.000Z",
      percentage: 88,
      status: "present",
      sourceRef: "INS-002-UPLOAD",
    },
    // 12409924
    {
      studentId: "12409924",
      sectionId: "SEC-CSE-101",
      courseId: "CS101",
      date: "2026-10-20T09:00:00.000Z",
      percentage: 94,
      status: "present",
      sourceRef: "INS-001-UPLOAD",
    },
    {
      studentId: "12409924",
      sectionId: "SEC-CSE-101",
      courseId: "CS102",
      date: "2026-10-20T11:00:00.000Z",
      percentage: 96,
      status: "present",
      sourceRef: "INS-002-UPLOAD",
    },
    // 12409925
    {
      studentId: "12409925",
      sectionId: "SEC-CSE-101",
      courseId: "CS101",
      date: "2026-10-20T09:00:00.000Z",
      percentage: 82,
      status: "present",
      sourceRef: "INS-001-UPLOAD",
    },
    {
      studentId: "12409925",
      sectionId: "SEC-CSE-101",
      courseId: "CS102",
      date: "2026-10-20T11:00:00.000Z",
      percentage: 86,
      status: "present",
      sourceRef: "INS-002-UPLOAD",
    },
  ];

  // 6. Historical Assessment Records (Stored and preserved across courses)
  const assessmentRecords: AssessmentRecord[] = [
    // 12409922 (Rahul Sharma): 4 assessments across both subjects (Average = ~53.5%)
    {
      studentId: "12409922",
      courseId: "CS101",
      type: "Quiz 1",
      score: 12,
      maxScore: 20, // 60%
      date: "2026-09-12T10:00:00.000Z",
      sourceRef: "INS-001-ASSESS",
    },
    {
      studentId: "12409922",
      courseId: "CS101",
      type: "Midterm Exam",
      score: 50,
      maxScore: 100, // 50%
      date: "2026-09-28T10:00:00.000Z",
      sourceRef: "INS-001-ASSESS",
    },
    {
      studentId: "12409922",
      courseId: "CS102",
      type: "Lab Assessment 1",
      score: 24,
      maxScore: 50, // 48%
      date: "2026-10-05T14:00:00.000Z",
      sourceRef: "INS-002-ASSESS",
    },
    {
      studentId: "12409922",
      courseId: "CS102",
      type: "Theory Test",
      score: 14,
      maxScore: 25, // 56%
      date: "2026-10-15T11:00:00.000Z",
      sourceRef: "INS-002-ASSESS",
    },

    // Cohort Student Assessments (STU 12409921, 12409923, 12409924, 12409925)
    {
      studentId: "12409921",
      courseId: "CS101",
      type: "Midterm Exam",
      score: 88,
      maxScore: 100,
      date: "2026-09-28T10:00:00.000Z",
      sourceRef: "INS-001-ASSESS",
    },
    {
      studentId: "12409921",
      courseId: "CS102",
      type: "Lab Assessment 1",
      score: 46,
      maxScore: 50,
      date: "2026-10-05T14:00:00.000Z",
      sourceRef: "INS-002-ASSESS",
    },
    {
      studentId: "12409923",
      courseId: "CS101",
      type: "Midterm Exam",
      score: 82,
      maxScore: 100,
      date: "2026-09-28T10:00:00.000Z",
      sourceRef: "INS-001-ASSESS",
    },
    {
      studentId: "12409924",
      courseId: "CS101",
      type: "Midterm Exam",
      score: 95,
      maxScore: 100,
      date: "2026-09-28T10:00:00.000Z",
      sourceRef: "INS-001-ASSESS",
    },
    {
      studentId: "12409925",
      courseId: "CS101",
      type: "Midterm Exam",
      score: 84,
      maxScore: 100,
      date: "2026-09-28T10:00:00.000Z",
      sourceRef: "INS-001-ASSESS",
    },
  ];

  // 7. Assignment Submissions
  const assignmentSubmissions: AssignmentSubmission[] = [
    {
      studentId: "12409922",
      courseId: "CS101",
      assignmentId: "ASG-001",
      submittedAt: "2026-09-10T18:00:00.000Z",
      status: "submitted",
    },
    {
      studentId: "12409922",
      courseId: "CS101",
      assignmentId: "ASG-002",
      submittedAt: "2026-09-24T22:00:00.000Z",
      status: "late",
    },
    {
      studentId: "12409922",
      courseId: "CS102",
      assignmentId: "ASG-003",
      submittedAt: null,
      status: "missing",
    },
    {
      studentId: "12409922",
      courseId: "CS102",
      assignmentId: "ASG-004",
      submittedAt: null,
      status: "missing",
    },
    // Cohort submissions
    ...["12409921", "12409923", "12409924", "12409925"].map((sid) => ({
      studentId: sid,
      courseId: "CS101",
      assignmentId: "ASG-001",
      submittedAt: "2026-09-10T15:00:00.000Z",
      status: "submitted" as const,
    })),
  ];

  // 8. LMS Activity Records
  const lmsActivities: LmsActivity[] = [
    {
      studentId: "12409922",
      courseId: "CS101",
      date: "2026-09-05T10:00:00.000Z",
      activityType: "video_lecture_watch",
      durationSec: 3200,
    },
    {
      studentId: "12409922",
      courseId: "CS102",
      date: "2026-09-20T11:00:00.000Z",
      activityType: "video_lecture_watch",
      durationSec: 1800,
    },
    {
      studentId: "12409922",
      courseId: "CS101",
      date: "2026-10-05T14:00:00.000Z",
      activityType: "forum_post",
      durationSec: 420,
    },
    // Cohort LMS engagement
    ...["12409921", "12409923", "12409924", "12409925"].map((sid) => ({
      studentId: sid,
      courseId: "CS101",
      date: "2026-10-05T14:00:00.000Z",
      activityType: "assignment_work",
      durationSec: 8400,
    })),
  ];

  // 9. Active Risk Model Version
  const demoModelVersion: RiskModelVersion = {
    version: "v1.0.0",
    effectiveFrom: "2026-08-01T00:00:00.000Z",
    weights: {
      attendance_deficit: 0.30,
      assessment_deficit: 0.25,
      missing_assignments: 0.20,
      lms_engagement_deficit: 0.10,
      trend_deterioration: 0.15,
    },
    thresholds: {
      low: 0.0,
      moderate: 0.25,
      high: 0.50,
      critical: 0.75,
    },
    createdBy: "ADM-001",
    previousVersion: null,
  };

  // 10. Calculate Deterministic Risk Snapshots for all 5 students
  const computedAt = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const demoRiskSnapshots: RiskSnapshot[] = [];

  // 12409922: High Risk
  demoRiskSnapshots.push(
    computeRiskSnapshot(
      "12409922",
      {
        attendanceRate: 0.65, // (60 + 70) / 2
        assessmentAvg: 0.535,
        missingAssignmentsRatio: 0.50,
        lmsEngagementRatio: 0.50,
        trendDeteriorationSignal: 0.20,
      },
      demoModelVersion,
      computedAt
    )
  );

  // Cohort Students: Low Risk
  for (const s of demoStudents) {
    if (s._id === "12409922") continue;
    demoRiskSnapshots.push(
      computeRiskSnapshot(
        s._id,
        {
          attendanceRate: 0.90,
          assessmentAvg: 0.88,
          missingAssignmentsRatio: 0.0,
          lmsEngagementRatio: 1.0,
          trendDeteriorationSignal: 0.02,
        },
        demoModelVersion,
        computedAt
      )
    );
  }

  // 11. Open Alert for 12409922 assigned to Mentor MTR-001 with 48h SLA
  const alertCreatedAt = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const alertSlaDeadline = new Date(Date.now() + 47.5 * 60 * 60 * 1000).toISOString();

  const demoAlert: Alert = {
    _id: "ALT-12409922-OPEN",
    studentId: "12409922",
    mentorId: "MTR-001",
    riskSnapshotId: demoRiskSnapshots[0]._id,
    status: "open",
    createdAt: alertCreatedAt,
    acknowledgedAt: null,
    escalatedAt: null,
    slaDeadline: alertSlaDeadline,
  };

  // 12. Idempotent Data Persistence
  await Promise.all([
    UserModel.deleteMany({ email: { $in: demoUsers.map((u) => u.email) } }),
    StudentModel.deleteMany({ _id: { $in: demoStudents.map((s) => s._id) } }),
    MentorAssignmentModel.deleteMany({ studentId: { $in: demoStudents.map((s) => s._id) } }),
    AttendanceRecordModel.deleteMany({ studentId: { $in: demoStudents.map((s) => s._id) } }),
    AssessmentRecordModel.deleteMany({ studentId: { $in: demoStudents.map((s) => s._id) } }),
    AssignmentSubmissionModel.deleteMany({ studentId: { $in: demoStudents.map((s) => s._id) } }),
    LmsActivityModel.deleteMany({ studentId: { $in: demoStudents.map((s) => s._id) } }),
    RiskSnapshotModel.deleteMany({ studentId: { $in: demoStudents.map((s) => s._id) } }),
    AlertModel.deleteMany({ studentId: "12409922" }),
    RiskModelVersionModel.deleteMany({ version: demoModelVersion.version }),
  ]);

  await UserModel.insertMany(demoUsers);
  await StudentModel.insertMany(demoStudents);
  await MentorAssignmentModel.insertMany(demoMentorAssignments);
  await AttendanceRecordModel.insertMany(attendanceRecords);
  await AssessmentRecordModel.insertMany(assessmentRecords);
  await AssignmentSubmissionModel.insertMany(assignmentSubmissions);
  await LmsActivityModel.insertMany(lmsActivities);
  await RiskSnapshotModel.insertMany(demoRiskSnapshots);
  await AlertModel.insertMany([demoAlert]);
  await RiskModelVersionModel.insertMany([demoModelVersion]);

  // Record Audit Log Entry for Seeding Event
  const auditEntry: AuditEntry = {
    actorId: "ADM-001",
    action: "DATABASE_DEMO_SEEDED",
    entityType: "System",
    entityId: "SYSTEM_DEMO_5STUDENTS_2INSTRUCTORS",
    before: null,
    after: {
      seededUsers: demoUsers.length,
      studentsCount: demoStudents.length,
      highRiskStudent: "12409922",
      section: "SEC-CSE-101",
      openAlertId: demoAlert._id,
    },
    timestamp: new Date().toISOString(),
  };
  await AuditEntryModel.create(auditEntry);

  if (shouldDisconnect) {
    await mongoose.disconnect();
  }

  return {
    seeded: true,
    usersCount: demoUsers.length,
    studentsCount: demoStudents.length,
    mentorAssignmentsCount: demoMentorAssignments.length,
    attendanceRecordsCount: attendanceRecords.length,
    assessmentRecordsCount: assessmentRecords.length,
    assignmentSubmissionsCount: assignmentSubmissions.length,
    lmsActivitiesCount: lmsActivities.length,
    riskSnapshotsCount: demoRiskSnapshots.length,
    alertsCount: 1,
    modelVersionsCount: 1,
  };
}

// Direct CLI Execution (npm run seed:demo)
if (process.argv[1] && process.argv[1].endsWith("seed-demo.js")) {
  seedDemoDatabase()
    .then((summary) => {
      console.log("================================================================================");
      console.log("✅ Academic Risk Radar — Database Seeding Complete");
      console.log("================================================================================");
      console.log("Seeded Accounts (Default Password: Password123!):");
      console.log("  • Instructor 1: instructor1@radar.edu (or instructor@radar.edu) | Prof. Rajesh Iyer (CS101)");
      console.log("  • Instructor 2: instructor2@radar.edu                           | Dr. Meera Nambiar (CS102)");
      console.log("  • Mentor:       mentor@radar.edu                                | Dr. Sunita Rao (MTR-001)");
      console.log("  • Students (5): 12409921, 12409922, 12409923, 12409924, 12409925");
      console.log("    Primary Demo: 12409922@radar.edu (or student@radar.edu)       | Rahul Sharma (High Risk)");
      console.log("  • HoD / Dean:   hod@radar.edu, dean@radar.edu, admin@radar.edu");
      console.log("--------------------------------------------------------------------------------");
      console.log(`Academic Section:       SEC-CSE-101 (${summary.studentsCount} students: 12409921..12409925)`);
      console.log(`Instructors:            2 (CS101 & CS102)`);
      console.log(`Attendance Rule:        Average across both subjects (12409922: 60% CS101 + 70% CS102 = 65%)`);
      console.log(`Calculated Snapshots:   ${summary.riskSnapshotsCount}`);
      console.log(`Active Open Alert:      ALT-12409922-OPEN (Assigned to MTR-001)`);
      console.log("================================================================================");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Fatal Demo Seeding Error:", err);
      process.exit(1);
    });
}
