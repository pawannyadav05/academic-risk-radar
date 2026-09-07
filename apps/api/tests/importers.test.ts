import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseAssessmentCsv,
  parseAssignmentCsv,
  parseAttendanceCsv,
  parseLmsActivityCsv,
} from "../src/modules/ingestion/csv-importers.js";

describe("M1: Ingestion & CSV Importers", () => {
  describe("Attendance CSV Parser & Validation", () => {
    it("should parse valid attendance records cleanly", () => {
      const csv = `studentId,sectionId,date,status,sourceRef
STD001,SEC_A,2026-03-01T09:00:00Z,present,RFID_1
STD002,SEC_A,2026-03-01T09:00:00Z,absent,RFID_1
STD003,SEC_A,2026-03-01T09:00:00Z,late,RFID_1`;

      const result = parseAttendanceCsv(csv);
      assert.equal(result.totalRows, 3);
      assert.equal(result.valid.length, 3);
      assert.equal(result.quarantined.length, 0);

      assert.equal(result.valid[0].studentId, "STD001");
      assert.equal(result.valid[0].status, "present");
      assert.equal(result.valid[1].status, "absent");
      assert.equal(result.valid[2].status, "late");
    });

    it("should quarantine invalid attendance rows without failing the batch", () => {
      const csv = `studentId,sectionId,date,status,sourceRef
STD001,SEC_A,2026-03-01T09:00:00Z,present,RFID_1
,SEC_A,2026-03-01T09:00:00Z,present,RFID_1
STD003,,2026-03-01T09:00:00Z,present,RFID_1
STD004,SEC_A,not-a-date,present,RFID_1
STD005,SEC_A,2026-03-01T09:00:00Z,unknown_status,RFID_1`;

      const result = parseAttendanceCsv(csv);
      assert.equal(result.totalRows, 5);
      assert.equal(result.valid.length, 1);
      assert.equal(result.quarantined.length, 4);

      assert.equal(result.valid[0].studentId, "STD001");
      assert.match(result.quarantined[0].reason, /studentId is required/i);
      assert.match(result.quarantined[1].reason, /sectionId is required/i);
      assert.match(result.quarantined[2].reason, /Invalid ISO date/i);
      assert.match(result.quarantined[3].reason, /Invalid status/i);
    });

    it("should quarantine batch if required header columns are missing", () => {
      const csv = `studentId,date,status
STD001,2026-03-01T09:00:00Z,present`;

      const result = parseAttendanceCsv(csv);
      assert.equal(result.valid.length, 0);
      assert.equal(result.quarantined.length, 1);
      assert.match(result.quarantined[0].reason, /Missing required header column/i);
    });
  });

  describe("Assessment CSV Parser & Validation", () => {
    it("should parse valid assessment records", () => {
      const csv = `studentId,courseId,type,score,maxScore,date,sourceRef
STD001,CSE101,Midterm,85,100,2026-03-15T10:00:00Z,ERP
STD002,CSE101,Midterm,0,100,2026-03-15T10:00:00Z,ERP`;

      const result = parseAssessmentCsv(csv);
      assert.equal(result.valid.length, 2);
      assert.equal(result.quarantined.length, 0);
      assert.equal(result.valid[0].score, 85);
      assert.equal(result.valid[0].maxScore, 100);
      assert.equal(result.valid[1].score, 0);
    });

    it("should quarantine assessments where score > maxScore or score is negative", () => {
      const csv = `studentId,courseId,type,score,maxScore,date,sourceRef
STD001,CSE101,Quiz,105,100,2026-03-15T10:00:00Z,ERP
STD002,CSE101,Quiz,-5,100,2026-03-15T10:00:00Z,ERP
STD003,CSE101,Quiz,50,0,2026-03-15T10:00:00Z,ERP
STD004,CSE101,Quiz,abc,100,2026-03-15T10:00:00Z,ERP`;

      const result = parseAssessmentCsv(csv);
      assert.equal(result.valid.length, 0);
      assert.equal(result.quarantined.length, 4);
      assert.match(result.quarantined[0].reason, /must be between 0 and maxScore/i);
      assert.match(result.quarantined[1].reason, /must be between 0 and maxScore/i);
      assert.match(result.quarantined[2].reason, /maxScore must be strictly greater than 0/i);
      assert.match(result.quarantined[3].reason, /must be valid numbers/i);
    });
  });

  describe("Assignment Submission CSV Parser & Validation", () => {
    it("should parse valid assignment submissions with submitted or missing states", () => {
      const csv = `studentId,courseId,assignmentId,submittedAt,status
STD001,CSE101,HW1,2026-02-10T18:00:00Z,submitted
STD002,CSE101,HW1,null,missing
STD003,CSE101,HW1,2026-02-11T02:00:00Z,late`;

      const result = parseAssignmentCsv(csv);
      assert.equal(result.valid.length, 3);
      assert.equal(result.quarantined.length, 0);
      assert.equal(result.valid[1].status, "missing");
      assert.equal(result.valid[1].submittedAt, null);
      assert.equal(result.valid[2].status, "late");
    });

    it("should quarantine assignment submissions with invalid status or bad date", () => {
      const csv = `studentId,courseId,assignmentId,submittedAt,status
STD001,CSE101,HW1,2026-02-10,invalid_status
STD002,CSE101,HW1,not-a-date,submitted`;

      const result = parseAssignmentCsv(csv);
      assert.equal(result.valid.length, 0);
      assert.equal(result.quarantined.length, 2);
      assert.match(result.quarantined[0].reason, /Invalid status/i);
      assert.match(result.quarantined[1].reason, /Invalid ISO date/i);
    });
  });

  describe("LMS Activity CSV Parser & Validation", () => {
    it("should parse valid LMS activity entries", () => {
      const csv = `studentId,courseId,date,activityType,durationSec
STD001,CSE101,2026-02-15T14:30:00Z,video_lecture,1800
STD002,CSE101,2026-02-15T15:00:00Z,quiz_attempt,600`;

      const result = parseLmsActivityCsv(csv);
      assert.equal(result.valid.length, 2);
      assert.equal(result.quarantined.length, 0);
      assert.equal(result.valid[0].durationSec, 1800);
      assert.equal(result.valid[1].activityType, "quiz_attempt");
    });

    it("should quarantine LMS activity with negative duration or non-number", () => {
      const csv = `studentId,courseId,date,activityType,durationSec
STD001,CSE101,2026-02-15T14:30:00Z,video_lecture,-100
STD002,CSE101,2026-02-15T15:00:00Z,quiz_attempt,ten_minutes`;

      const result = parseLmsActivityCsv(csv);
      assert.equal(result.valid.length, 0);
      assert.equal(result.quarantined.length, 2);
      assert.match(result.quarantined[0].reason, /non-negative number/i);
      assert.match(result.quarantined[1].reason, /non-negative number/i);
    });
  });
});
