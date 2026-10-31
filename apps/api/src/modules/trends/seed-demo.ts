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

/**
 * Deterministic Database Demo Seeding Script (Team Member 2 — Vani Bhardwaj)
 *
 * Scope: Week 9 Functional System Review & Remediation (Stage 2)
 *
 * Seeds:
 * 1. 6 Verified Institutional Accounts with bcrypt-hashed passwords ("Password123!"):
 *    - Instructor: instructor@radar.edu (Assigned to Section SEC-CSE-101)
 *    - Mentor:     mentor@radar.edu     (Assigned to Student STU-001)
 *    - Student:    student@radar.edu    (Rahul Sharma, STU-001)
 *    - HoD:        hod@radar.edu        (Department Head DEP-CSE)
 *    - Dean:       dean@radar.edu       (Dean of Academics)
 *    - Admin:      admin@radar.edu      (System Administrator)
 * 2. Academic Section: SEC-CSE-101
 * 3. High-Risk Student Profile: Rahul Sharma (STU-001) in SEC-CSE-101
 * 4. Additional Cohort Students for Section SEC-CSE-101 (STU-002..STU-005)
 * 5. Mentor Assignment: STU-001 linked to MTR-001 (Dr. Sunita Rao)
 * 6. Historical Attendance: 65% attendance deficit for STU-001 over 6 weeks
 * 7. Assessment Scores: 52% average for STU-001 in CS101
 * 8. Missing Assignments & Reduced LMS Activity for STU-001
 * 9. Deterministic High-Risk RiskSnapshot for STU-001
 * 10. Initial Open Alert for STU-001 assigned to MTR-001 with 48h SLA deadline
 * 11. Active Risk Model Version (v1.0.0)
 *
 * Idempotency: Clears and resets demo state predictably so running multiple times
 * produces the identical state required for Week 9 golden demonstration review.
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

  // 2. Define 6 Institutional Accounts
  const demoUsers: User[] = [
    {
      _id: "INS-001",
      name: "Prof. Rajesh Iyer",
      email: "instructor@radar.edu",
      role: "instructor",
      passwordHash,
      departmentId: "DEP-CSE",
      sectionIds: ["SEC-CSE-101"],
      identityId: "INS-001",
    },
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
    {
      _id: "STU-001",
      name: "Rahul Sharma",
      email: "student@radar.edu",
      role: "student",
      passwordHash,
      departmentId: "DEP-CSE",
      sectionIds: ["SEC-CSE-101"],
      identityId: "STU-001",
    },
    {
      _id: "HOD-001",
      name: "Dr. Amit Verma",
      email: "hod@radar.edu",
      role: "hod",
      passwordHash,
      departmentId: "DEP-CSE",
      identityId: "HOD-001",
    },
    {
      _id: "DEAN-001",
      name: "Dr. Kavita Narang",
      email: "dean@radar.edu",
      role: "dean",
      passwordHash,
      identityId: "DEAN-001",
    },
    {
      _id: "ADM-001",
      name: "System Administrator",
      email: "admin@radar.edu",
      role: "admin",
      passwordHash,
      identityId: "ADM-001",
    },
  ];

  // 3. Define Students in Section SEC-CSE-101
  const demoStudents: Student[] = [
    {
      _id: "STU-001",
      name: "Rahul Sharma",
      enrolmentId: "ENR20260001",
      sectionIds: ["SEC-CSE-101"],
      programme: "B.Tech Computer Science & Engineering",
    },
    {
      _id: "STU-002",
      name: "Priya Patel",
      enrolmentId: "ENR20260002",
      sectionIds: ["SEC-CSE-101"],
      programme: "B.Tech Computer Science & Engineering",
    },
    {
      _id: "STU-003",
      name: "Arjun Kumar",
      enrolmentId: "ENR20260003",
      sectionIds: ["SEC-CSE-101"],
      programme: "B.Tech Computer Science & Engineering",
    },
    {
      _id: "STU-004",
      name: "Ananya Singh",
      enrolmentId: "ENR20260004",
      sectionIds: ["SEC-CSE-101"],
      programme: "B.Tech Computer Science & Engineering",
    },
    {
      _id: "STU-005",
      name: "Vikram Verma",
      enrolmentId: "ENR20260005",
      sectionIds: ["SEC-CSE-101"],
      programme: "B.Tech Computer Science & Engineering",
    },
  ];

  // 4. Mentor Assignments
  const demoMentorAssignments: MentorAssignment[] = [
    {
      studentId: "STU-001",
      mentorId: "MTR-001",
      assignedFrom: "2026-08-01T00:00:00.000Z",
      assignedTo: null,
    },
    {
      studentId: "STU-002",
      mentorId: "MTR-001",
      assignedFrom: "2026-08-01T00:00:00.000Z",
      assignedTo: null,
    },
    {
      studentId: "STU-003",
      mentorId: "MTR-001",
      assignedFrom: "2026-08-01T00:00:00.000Z",
      assignedTo: null,
    },
  ];

  // 5. Historical Attendance Records
  // For STU-001 (Rahul Sharma): 20 sessions across past 6 weeks.
  // Exactly 13 present, 5 absent, 2 late -> Attendance rate = 13/20 = 65% (0.65).
  const attendanceRecords: AttendanceRecord[] = [];
  const baseDate = new Date("2026-09-01T09:00:00.000Z");

  const rahulAttendancePattern: ("present" | "absent" | "late")[] = [
    "present", "present", "present", "present", "present", // Week 1-2 (Good start)
    "present", "present", "present", "late",    "absent",  // Week 3
    "present", "absent",  "present", "absent",  "late",    // Week 4
    "present", "absent",  "absent",  "present", "present", // Week 5-6 (Deterioration)
  ];

  for (let i = 0; i < rahulAttendancePattern.length; i++) {
    const sessionDate = new Date(baseDate.getTime() + i * 2 * 24 * 60 * 60 * 1000).toISOString();
    attendanceRecords.push({
      studentId: "STU-001",
      sectionId: "SEC-CSE-101",
      date: sessionDate,
      status: rahulAttendancePattern[i],
      sourceRef: `ERP-ATT-W${Math.floor(i / 3) + 1}-S${(i % 3) + 1}`,
    });

    // Healthy cohort students (STU-002..STU-005) have ~90-95% attendance
    for (const sid of ["STU-002", "STU-003", "STU-004", "STU-005"]) {
      attendanceRecords.push({
        studentId: sid,
        sectionId: "SEC-CSE-101",
        date: sessionDate,
        status: i % 10 === 0 ? "late" : i % 15 === 0 ? "absent" : "present",
        sourceRef: `ERP-ATT-W${Math.floor(i / 3) + 1}-S${(i % 3) + 1}`,
      });
    }
  }

  // 6. Assessment Records
  // For STU-001 (Rahul Sharma): Average = 52% (0.52) in course CS101
  const assessmentRecords: AssessmentRecord[] = [
    {
      studentId: "STU-001",
      courseId: "CS101",
      type: "quiz",
      score: 12,
      maxScore: 20, // 60%
      date: "2026-09-12T14:00:00.000Z",
      sourceRef: "LMS-ASSESS-Q1",
    },
    {
      studentId: "STU-001",
      courseId: "CS101",
      type: "midterm",
      score: 50,
      maxScore: 100, // 50%
      date: "2026-09-28T10:00:00.000Z",
      sourceRef: "LMS-ASSESS-MIDTERM",
    },
    {
      studentId: "STU-001",
      courseId: "CS101",
      type: "lab_exam",
      score: 24,
      maxScore: 50, // 48%
      date: "2026-10-10T11:00:00.000Z",
      sourceRef: "LMS-ASSESS-LAB1",
    },
    // Cohort assessment scores (STU-002..STU-005)
    {
      studentId: "STU-002",
      courseId: "CS101",
      type: "midterm",
      score: 86,
      maxScore: 100,
      date: "2026-09-28T10:00:00.000Z",
      sourceRef: "LMS-ASSESS-MIDTERM",
    },
    {
      studentId: "STU-003",
      courseId: "CS101",
      type: "midterm",
      score: 79,
      maxScore: 100,
      date: "2026-09-28T10:00:00.000Z",
      sourceRef: "LMS-ASSESS-MIDTERM",
    },
  ];

  // 7. Assignment Submissions for STU-001
  const assignmentSubmissions: AssignmentSubmission[] = [
    {
      studentId: "STU-001",
      courseId: "CS101",
      assignmentId: "ASG-001",
      submittedAt: "2026-09-10T18:00:00.000Z",
      status: "submitted",
    },
    {
      studentId: "STU-001",
      courseId: "CS101",
      assignmentId: "ASG-002",
      submittedAt: "2026-09-24T22:00:00.000Z",
      status: "late",
    },
    {
      studentId: "STU-001",
      courseId: "CS101",
      assignmentId: "ASG-003",
      submittedAt: null,
      status: "missing",
    },
    {
      studentId: "STU-001",
      courseId: "CS101",
      assignmentId: "ASG-004",
      submittedAt: null,
      status: "missing",
    },
  ];

  // 8. LMS Activity Records
  const lmsActivities: LmsActivity[] = [
    {
      studentId: "STU-001",
      courseId: "CS101",
      date: "2026-09-05T10:00:00.000Z",
      activityType: "video_lecture_watch",
      durationSec: 3200,
    },
    {
      studentId: "STU-001",
      courseId: "CS101",
      date: "2026-09-20T11:00:00.000Z",
      activityType: "video_lecture_watch",
      durationSec: 1800,
    },
    {
      studentId: "STU-001",
      courseId: "CS101",
      date: "2026-10-05T14:00:00.000Z",
      activityType: "forum_post",
      durationSec: 420, // Severe engagement drop
    },
  ];

  // 9. Deterministic Risk Snapshot (High Risk for Rahul Sharma)
  const snapshotDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const demoRiskSnapshot: RiskSnapshot = {
    _id: "SNAP-STU001-001",
    studentId: "STU-001",
    computedAt: snapshotDate,
    modelVersion: "v1.0.0",
    band: "high",
    factors: [
      { name: "attendance_deficit", weight: 0.35, contribution: 0.28, value: 0.65 },
      { name: "assessment_score", weight: 0.35, contribution: 0.24, value: 0.52 },
      { name: "trend_deterioration", weight: 0.20, contribution: 0.16, value: 0.35 },
      { name: "lms_engagement", weight: 0.10, contribution: 0.08, value: 0.40 },
    ],
  };

  // 10. Initial Open Alert assigned to Mentor MTR-001 with 48h SLA
  const alertCreatedAt = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const alertSlaDeadline = new Date(Date.now() + 46 * 60 * 60 * 1000).toISOString(); // 48h from creation

  const demoAlert: Alert = {
    _id: "ALT-STU001-OPEN",
    studentId: "STU-001",
    mentorId: "MTR-001",
    riskSnapshotId: "SNAP-STU001-001",
    status: "open",
    createdAt: alertCreatedAt,
    acknowledgedAt: null,
    escalatedAt: null,
    slaDeadline: alertSlaDeadline,
  };

  // 11. Active Risk Model Version
  const demoModelVersion: RiskModelVersion = {
    version: "v1.0.0",
    effectiveFrom: "2026-08-01T00:00:00.000Z",
    weights: {
      attendanceRate: 0.35,
      assessmentAvg: 0.35,
      trendDeterioration: 0.20,
      lmsEngagementRatio: 0.10,
    },
    thresholds: {
      low: 0.3,
      moderate: 0.6,
      high: 0.8,
      critical: 1.0,
    },
    createdBy: "ADM-001",
    previousVersion: null,
  };

  // 12. Idempotent Data Persistence (Clean up demo records and insert fresh)
  await Promise.all([
    UserModel.deleteMany({ email: { $in: demoUsers.map((u) => u.email) } }),
    StudentModel.deleteMany({ _id: { $in: demoStudents.map((s) => s._id) } }),
    MentorAssignmentModel.deleteMany({ studentId: { $in: demoStudents.map((s) => s._id) } }),
    AttendanceRecordModel.deleteMany({ studentId: { $in: demoStudents.map((s) => s._id) } }),
    AssessmentRecordModel.deleteMany({ studentId: { $in: demoStudents.map((s) => s._id) } }),
    AssignmentSubmissionModel.deleteMany({ studentId: { $in: demoStudents.map((s) => s._id) } }),
    LmsActivityModel.deleteMany({ studentId: { $in: demoStudents.map((s) => s._id) } }),
    RiskSnapshotModel.deleteMany({ _id: demoRiskSnapshot._id }),
    AlertModel.deleteMany({ _id: demoAlert._id }),
    RiskModelVersionModel.deleteMany({ version: demoModelVersion.version }),
  ]);

  await UserModel.insertMany(demoUsers);
  await StudentModel.insertMany(demoStudents);
  await MentorAssignmentModel.insertMany(demoMentorAssignments);
  await AttendanceRecordModel.insertMany(attendanceRecords);
  await AssessmentRecordModel.insertMany(assessmentRecords);
  await AssignmentSubmissionModel.insertMany(assignmentSubmissions);
  await LmsActivityModel.insertMany(lmsActivities);
  await RiskSnapshotModel.insertMany([demoRiskSnapshot]);
  await AlertModel.insertMany([demoAlert]);
  await RiskModelVersionModel.insertMany([demoModelVersion]);

  // Record Audit Log Entry for Seeding Event
  const auditEntry: AuditEntry = {
    actorId: "ADM-001",
    action: "DATABASE_DEMO_SEEDED",
    entityType: "System",
    entityId: "SYSTEM_DEMO_WEEK9",
    before: null,
    after: {
      seededUsers: demoUsers.length,
      highRiskStudent: "STU-001",
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
    riskSnapshotsCount: 1,
    alertsCount: 1,
    modelVersionsCount: 1,
  };
}

// Direct CLI Execution (npm run seed:demo)
if (process.argv[1] && process.argv[1].endsWith("seed-demo.js")) {
  seedDemoDatabase()
    .then((summary) => {
      console.log("================================================================================");
      console.log("✅ Academic Risk Radar — Deterministic Database Demo Seeding Complete (Week 9)");
      console.log("================================================================================");
      console.log("Seeded 6 Institutional Accounts (Default Password: Password123!):");
      console.log("  • Instructor: instructor@radar.edu  | Prof. Rajesh Iyer (Section: SEC-CSE-101)");
      console.log("  • Mentor:     mentor@radar.edu      | Dr. Sunita Rao    (Mentees: STU-001..STU-003)");
      console.log("  • Student:    student@radar.edu     | Rahul Sharma      (ID: STU-001, Section: SEC-CSE-101)");
      console.log("  • HoD:        hod@radar.edu         | Dr. Amit Verma    (Dept: DEP-CSE)");
      console.log("  • Dean:       dean@radar.edu        | Dr. Kavita Narang (Academics)");
      console.log("  • Admin:      admin@radar.edu       | System Admin");
      console.log("--------------------------------------------------------------------------------");
      console.log(`Academic Section:       SEC-CSE-101 (${summary.studentsCount} students)`);
      console.log(`High-Risk Student:      Rahul Sharma (STU-001)`);
      console.log(`Historical Attendance:  65% deficit (${summary.attendanceRecordsCount} records)`);
      console.log(`Assessment Scores:      52% avg score (${summary.assessmentRecordsCount} records)`);
      console.log(`Calculated Snapshot:    SNAP-STU001-001 (Band: HIGH)`);
      console.log(`Active Open Alert:      ALT-STU001-OPEN (Assigned to MTR-001, SLA: 48h)`);
      console.log(`Risk Model Version:     v1.0.0 (active)`);
      console.log("================================================================================");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Fatal Demo Seeding Error:", err);
      process.exit(1);
    });
}
