// /routes/medicine.js
import express from "express";
import { authenticateUser } from "../middleware/auth.js";
import {
  getAllMedicines,
  addMedicine,
  toggleMedicine,
  deleteMedicine,
  updateMedicine,
} from "../controllers/medicineController.js";

const router = express.Router();

// 모든 약품 가져오기
router.get("/medicines", authenticateUser, getAllMedicines);

// 새 약품 추가
router.post("/medicines", authenticateUser, addMedicine);

// 복용 상태 토글
router.post("/medicines/:id/toggle", authenticateUser, toggleMedicine);

// 약품 삭제
router.delete("/medicines/:id", authenticateUser, deleteMedicine);

// 약품 정보 수정
router.put("/medicines/:id", authenticateUser, updateMedicine);

export default router;
