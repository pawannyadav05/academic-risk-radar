import { Router } from "express";

// Module M3: Risk Scoring Engine (Team Member 1)
const router = Router();

router.get("/students/:id/risk", (req, res) => {
  res.json({ status: "scoring module placeholder", studentId: req.params.id });
});

export default router;
