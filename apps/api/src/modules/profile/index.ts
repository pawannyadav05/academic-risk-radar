import { Router } from "express";

// Module M2: Student Academic Profile (Team Member 3)
const router = Router();

router.get("/students/:id/profile", (req, res) => {
  res.json({ status: "profile module placeholder", studentId: req.params.id });
});

export default router;
