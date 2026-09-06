import mongoose, { Schema } from "mongoose";
import {
  AuditEntry,
  RiskModelVersion,
  RiskSnapshot,
  Student,
  User,
} from "@academic-risk-radar/shared-types";

// Student Schema
const StudentSchema = new Schema<Student>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  enrolmentId: { type: String, required: true, unique: true },
  sectionIds: [{ type: String }],
  programme: { type: String, required: true },
});
export const StudentModel = mongoose.model<Student>("Student", StudentSchema);

// Risk Snapshot Schema (Append-Only)
const RiskSnapshotSchema = new Schema<RiskSnapshot>({
  _id: { type: String, required: true },
  studentId: { type: String, required: true, index: true },
  computedAt: { type: String, required: true, index: true },
  modelVersion: { type: String, required: true },
  band: { type: String, enum: ["low", "moderate", "high", "critical"], required: true },
  factors: [
    {
      name: { type: String, required: true },
      weight: { type: Number, required: true },
      contribution: { type: Number, required: true },
      value: { type: Number, required: true },
    },
  ],
});
RiskSnapshotSchema.index({ studentId: 1, computedAt: -1 });
export const RiskSnapshotModel = mongoose.model<RiskSnapshot>("RiskSnapshot", RiskSnapshotSchema);

// Risk Model Version Schema
const RiskModelVersionSchema = new Schema<RiskModelVersion>({
  version: { type: String, required: true, unique: true },
  effectiveFrom: { type: String, required: true },
  weights: { type: Map, of: Number, required: true },
  thresholds: {
    low: { type: Number, required: true },
    moderate: { type: Number, required: true },
    high: { type: Number, required: true },
    critical: { type: Number, required: true },
  },
  createdBy: { type: String, required: true },
  previousVersion: { type: String, default: null },
});
export const RiskModelVersionModel = mongoose.model<RiskModelVersion>("RiskModelVersion", RiskModelVersionSchema);

// Audit Entry Schema (Append-Only)
const AuditEntrySchema = new Schema<AuditEntry>({
  actorId: { type: String, required: true },
  action: { type: String, required: true },
  entityType: { type: String, required: true, index: true },
  entityId: { type: String, required: true },
  before: { type: Schema.Types.Mixed, default: null },
  after: { type: Schema.Types.Mixed, default: null },
  timestamp: { type: String, required: true, index: true },
});
export const AuditEntryModel = mongoose.model<AuditEntry>("AuditEntry", AuditEntrySchema);

// User Schema
const UserSchema = new Schema<User>({
  _id: { type: String, required: true },
  role: { type: String, enum: ["student", "instructor", "mentor", "hod", "dean", "admin"], required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  departmentId: { type: String },
  sectionIds: [{ type: String }],
});
export const UserModel = mongoose.model<User>("User", UserSchema);
