// /routes/user.js
import express from "express";
import { authenticateUser } from "../middleware/auth.js";
import {
  saveUserInfo,
  getUserFullData,
  updateUserInfo,
  updateUserConditions,
  updateUserConcerns
} from "../controllers/userController.js";

const router = express.Router();

// 온보딩 정보 저장
router.post("/save-user-info", saveUserInfo);

// 마이페이지 전체 사용자 정보 조회
router.get("/user-full-data", authenticateUser, getUserFullData);

// 기본 건강 정보 업데이트
router.post("/update-user-info", authenticateUser, updateUserInfo);

// 만성질환 업데이트
router.post("/update-conditions", authenticateUser, updateUserConditions);

// 건강 고민 업데이트
router.post("/update-user-concerns", authenticateUser, updateUserConcerns);

export default router;
