// /routes/ocr.js
import express from "express";
import { ocrUpload } from "../config/multerConfig.js";
import { runOcrScript } from "../controllers/ocrController.js";

const router = express.Router();
router.post("/ocr", ocrUpload.single("image"), runOcrScript);
export default router;
