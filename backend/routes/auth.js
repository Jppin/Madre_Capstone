// /routes/auth.js
import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  changePassword,
  getUserData,
  updateIsNewUser,
  withdrawUser,
} from "../controllers/authController.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// 공개 API
router.post("/register", registerUser);
router.post("/login-user", loginUser);
router.post("/forgot-password", forgotPassword);

// 인증 필요 API
router.post("/change-password", authenticateUser, changePassword);
router.get("/userdata", authenticateUser, getUserData);
router.post("/update-isnewuser", authenticateUser, updateIsNewUser);
router.delete("/withdraw", authenticateUser, withdrawUser);

export default router;
