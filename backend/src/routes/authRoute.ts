import { Router } from "express";
import {
  getMe,
  login,
  logout,
  refreshToken,
  register,
} from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;
