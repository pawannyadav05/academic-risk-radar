import { Router } from "express";

// Module M1: Ingestion & Normalisation (Team Member 3)
const router = Router();

router.get("/connectors/status", (req, res) => {
  res.json({ status: "ingestion module placeholder" });
});

export default router;
