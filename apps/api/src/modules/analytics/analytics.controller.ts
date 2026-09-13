import { Request, Response } from "express";
import { RiskSnapshotModel, StudentModel, AlertModel, InterventionModel } from "../../db/schemas.js";

/**
 * GET /api/v1/analytics/department/:id
 * Return department-level risk band distributions for HoD view.
 *
 * Aggregates the latest RiskSnapshot for each student in the department,
 * groups by band, and returns distribution counts plus recent weekly trends.
 */
export async function getDepartmentAnalytics(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Missing user authentication" });
    }

    const departmentId = req.params.id;

    // Validate departmentId to prevent regex/NoSQL injection — only allow safe characters
    if (!departmentId || typeof departmentId !== "string" || !/^[a-zA-Z0-9._-]+$/.test(departmentId)) {
      return res.status(400).json({ error: "Validation error: Invalid department ID format" });
    }

    // RBAC: HoD can only access their own department
    if (user.role === "hod" && user.departmentId !== departmentId) {
      return res.status(403).json({
        error: "Forbidden: HoD can only access analytics for their own department",
      });
    }

    // Find all students in this department (students whose sectionIds belong to this department)
    // For department scoping, we match students that have a sectionId starting with the departmentId.
    // departmentId has been validated above to contain only safe characters (no regex metacharacters).
    const escapedDeptId = departmentId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const students = await StudentModel.find({
      sectionIds: { $regex: new RegExp(`^${escapedDeptId}`, "i") },
    }).lean();

    // Fallback: if no students found via sectionId prefix, try finding all students
    // (in a real system, departments/sections would have a proper mapping collection)
    const studentIds = students.map((s) => s._id);

    if (studentIds.length === 0) {
      return res.status(200).json({
        departmentId,
        totalStudents: 0,
        bandDistribution: { low: 0, moderate: 0, high: 0, critical: 0 },
        recentTrends: [],
        escalatedAlerts: 0,
      });
    }

    // Get the latest RiskSnapshot per student using aggregation
    const latestSnapshots = await RiskSnapshotModel.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      { $sort: { studentId: 1, computedAt: -1 } },
      {
        $group: {
          _id: "$studentId",
          band: { $first: "$band" },
          computedAt: { $first: "$computedAt" },
          factors: { $first: "$factors" },
        },
      },
    ]);

    // Count band distribution
    const bandDistribution = { low: 0, moderate: 0, high: 0, critical: 0 };
    for (const snap of latestSnapshots) {
      const band = snap.band as keyof typeof bandDistribution;
      if (band in bandDistribution) {
        bandDistribution[band]++;
      }
    }

    // Get recent weekly trends (last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const fourWeeksAgoISO = fourWeeksAgo.toISOString();

    const weeklyTrends = await RiskSnapshotModel.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          computedAt: { $gte: fourWeeksAgoISO },
        },
      },
      {
        $addFields: {
          weekNumber: {
            $dateToString: { format: "%Y-W%V", date: { $dateFromString: { dateString: "$computedAt" } } },
          },
        },
      },
      {
        $group: {
          _id: { week: "$weekNumber", band: "$band" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.week": 1 } },
    ]);

    // Transform weekly trends into structured format
    const trendsMap = new Map<string, Record<string, number>>();
    for (const entry of weeklyTrends) {
      const week = entry._id.week;
      if (!trendsMap.has(week)) {
        trendsMap.set(week, { low: 0, moderate: 0, high: 0, critical: 0 });
      }
      const weekData = trendsMap.get(week)!;
      weekData[entry._id.band] = entry.count;
    }

    const recentTrends = Array.from(trendsMap.entries()).map(([week, bandCounts]) => ({
      week,
      bandCounts,
    }));

    // Count escalated alerts for this department's students
    const escalatedAlerts = await AlertModel.countDocuments({
      studentId: { $in: studentIds },
      status: "escalated",
    });

    return res.status(200).json({
      departmentId,
      totalStudents: studentIds.length,
      bandDistribution,
      recentTrends,
      escalatedAlerts,
    });
  } catch (err) {
    console.error("Error fetching department analytics:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/v1/analytics/institution
 * Return institution-wide risk trends for Dean view.
 *
 * Aggregates all students' latest snapshots, provides department comparison,
 * intervention success rate, and weekly trends.
 */
export async function getInstitutionAnalytics(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Missing user authentication" });
    }

    // Get all students
    const students = await StudentModel.find().lean();
    const studentIds = students.map((s) => s._id);
    const totalStudents = studentIds.length;

    if (totalStudents === 0) {
      return res.status(200).json({
        totalStudents: 0,
        bandDistribution: { low: 0, moderate: 0, high: 0, critical: 0 },
        departmentComparison: [],
        interventionSuccessRate: 0,
        weeklyTrends: [],
      });
    }

    // Get latest snapshot per student
    const latestSnapshots = await RiskSnapshotModel.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      { $sort: { studentId: 1, computedAt: -1 } },
      {
        $group: {
          _id: "$studentId",
          band: { $first: "$band" },
          computedAt: { $first: "$computedAt" },
        },
      },
    ]);

    // Institution-wide band distribution
    const bandDistribution = { low: 0, moderate: 0, high: 0, critical: 0 };
    for (const snap of latestSnapshots) {
      const band = snap.band as keyof typeof bandDistribution;
      if (band in bandDistribution) {
        bandDistribution[band]++;
      }
    }

    // Department comparison: group students by their first sectionId prefix as department proxy
    const deptStudentMap = new Map<string, string[]>();
    for (const student of students) {
      // Use the first sectionId as a department identifier, or "unknown"
      const deptId = student.sectionIds?.[0]?.split("-")?.[0] || "unknown";
      if (!deptStudentMap.has(deptId)) {
        deptStudentMap.set(deptId, []);
      }
      deptStudentMap.get(deptId)!.push(student._id);
    }

    // Build snapshot lookup
    const snapshotLookup = new Map<string, string>();
    for (const snap of latestSnapshots) {
      snapshotLookup.set(snap._id, snap.band);
    }

    const departmentComparison = Array.from(deptStudentMap.entries()).map(([deptId, deptStudentIds]) => {
      const bandCounts = { low: 0, moderate: 0, high: 0, critical: 0 };
      for (const sid of deptStudentIds) {
        const band = snapshotLookup.get(sid) as keyof typeof bandCounts;
        if (band && band in bandCounts) {
          bandCounts[band]++;
        }
      }
      return { departmentId: deptId, name: `Department ${deptId}`, bandCounts };
    });

    // Intervention success rate: ratio of "improved" outcomes to total recorded outcomes
    const [totalOutcomes, improvedOutcomes] = await Promise.all([
      InterventionModel.countDocuments({ outcome: { $ne: null } }),
      InterventionModel.countDocuments({ outcome: "improved" }),
    ]);
    const interventionSuccessRate = totalOutcomes > 0 ? Math.round((improvedOutcomes / totalOutcomes) * 100) / 100 : 0;

    // Weekly trends (last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const fourWeeksAgoISO = fourWeeksAgo.toISOString();

    const weeklyAgg = await RiskSnapshotModel.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          computedAt: { $gte: fourWeeksAgoISO },
        },
      },
      {
        $addFields: {
          weekNumber: {
            $dateToString: { format: "%Y-W%V", date: { $dateFromString: { dateString: "$computedAt" } } },
          },
        },
      },
      {
        $group: {
          _id: { week: "$weekNumber", band: "$band" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.week": 1 } },
    ]);

    const trendsMap = new Map<string, Record<string, number>>();
    for (const entry of weeklyAgg) {
      const week = entry._id.week;
      if (!trendsMap.has(week)) {
        trendsMap.set(week, { low: 0, moderate: 0, high: 0, critical: 0 });
      }
      trendsMap.get(week)![entry._id.band] = entry.count;
    }

    const weeklyTrends = Array.from(trendsMap.entries()).map(([week, bandCounts]) => ({
      week,
      bandCounts,
    }));

    return res.status(200).json({
      totalStudents,
      bandDistribution,
      departmentComparison,
      interventionSuccessRate,
      weeklyTrends,
    });
  } catch (err) {
    console.error("Error fetching institution analytics:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/v1/analytics/section/:id
 * Return section-level risk band distributions and attendance deficits for Instructor view.
 */
export async function getSectionAnalytics(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Missing user authentication" });
    }

    const sectionId = req.params.id;

    // Validate sectionId
    if (!sectionId || typeof sectionId !== "string" || !/^[a-zA-Z0-9._-]+$/.test(sectionId)) {
      return res.status(400).json({ error: "Validation error: Invalid section ID format" });
    }

    // Find students in this section
    const students = await StudentModel.find({ sectionIds: sectionId }).lean();
    const studentIds = students.map((s) => s._id);

    if (studentIds.length === 0) {
      return res.status(200).json({
        sectionId,
        totalStudents: 0,
        bandDistribution: { low: 0, moderate: 0, high: 0, critical: 0 },
        attendanceDeficitDistribution: [],
      });
    }

    // Get the latest RiskSnapshot per student using aggregation
    const latestSnapshots = await RiskSnapshotModel.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      { $sort: { studentId: 1, computedAt: -1 } },
      {
        $group: {
          _id: "$studentId",
          band: { $first: "$band" },
          computedAt: { $first: "$computedAt" },
          factors: { $first: "$factors" },
        },
      },
    ]);

    // Count band distribution
    const bandDistribution = { low: 0, moderate: 0, high: 0, critical: 0 };
    
    // Group attendance deficits into buckets for histogram
    // Buckets: 0-10%, 10-20%, 20-30%, >30%
    const attendanceBuckets = {
      "0-10%": 0,
      "10-20%": 0,
      "20-30%": 0,
      ">30%": 0
    };

    for (const snap of latestSnapshots) {
      const band = snap.band as keyof typeof bandDistribution;
      if (band in bandDistribution) {
        bandDistribution[band]++;
      }
      
      // Find attendance deficit factor
      const attendanceFactor = snap.factors?.find((f: any) => f.name === "attendance_deficit");
      if (attendanceFactor) {
        const val = attendanceFactor.value; // typically 0.0 to 1.0
        if (val <= 0.10) attendanceBuckets["0-10%"]++;
        else if (val <= 0.20) attendanceBuckets["10-20%"]++;
        else if (val <= 0.30) attendanceBuckets["20-30%"]++;
        else attendanceBuckets[">30%"]++;
      } else {
        // Assume 0 deficit if factor missing
        attendanceBuckets["0-10%"]++;
      }
    }
    
    // Format attendance buckets for chart
    const attendanceDeficitDistribution = Object.entries(attendanceBuckets).map(([bucket, count]) => ({
      bucket,
      count
    }));

    return res.status(200).json({
      sectionId,
      totalStudents: studentIds.length,
      bandDistribution,
      attendanceDeficitDistribution,
    });
  } catch (err) {
    console.error("Error fetching section analytics:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
