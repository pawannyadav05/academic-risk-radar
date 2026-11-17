import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, logout, getMe } from "./auth.controller.js";

const router = Router();

const isDev = process.env.NODE_ENV !== "production";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100000 : 30, // Limit 30 login attempts per 15 mins per IP in prod
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again after 15 minutes" },
  skip: () => isDev,
});

router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", getMe);

export default router;
