import { Router } from "express";

// Module M5: Alert Routing & Mentor Inbox (Team Member 2)
const router = Router();

router.get("/alerts", (req, res) => {
  res.json({ status: "alerts module placeholder" });
});

export default router;
