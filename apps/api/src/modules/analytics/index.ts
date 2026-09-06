import { Router } from "express";

// Module M7: Dashboards & Reporting (Team Member 4)
const router = Router();

router.get("/analytics/institution", (req, res) => {
  res.json({ status: "analytics module placeholder" });
});

export default router;
