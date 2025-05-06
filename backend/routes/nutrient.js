//backend/routes/nutrient.js

import express from "express";
import {
  getRecommendedNutrients,
  getPersonalizedNutrients,
  likeNutrient,
  getLikedNutrients,
  unlikeNutrient
} from "../controllers/nutrientController.js";
import { authenticateUser } from "../middleware/auth.js";
import { getNutrientDetail } from "../controllers/nutrientController.js";

const router = express.Router();

// 관심사 기반 추천
router.get("/recommendations", getRecommendedNutrients);

// 개인화된 추천/주의 성분
router.get("/personal", authenticateUser, getPersonalizedNutrients);

// 찜한 성분 추가/조회/삭제
router.post("/like", authenticateUser, likeNutrient);
router.get("/likes", authenticateUser, getLikedNutrients);
router.post("/unlike", authenticateUser, unlikeNutrient);

router.get("/detail/:name", authenticateUser, getNutrientDetail);


export default router;
