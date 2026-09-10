import { Router } from "express";

export * from "./rolling-baseline.js";
export * from "./seed-generator.js";

// Module M4: Trend & Anomaly Detection (Team Member 2)
const router = Router();

router.get("/trends/:id", (req, res) => {
  res.json({ status: "trends module placeholder", studentId: req.params.id });
});

export default router;

