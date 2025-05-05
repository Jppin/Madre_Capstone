// /routes/profile.js
import express from "express";
import { profileUpload } from "../config/multerConfig.js";
import { uploadProfileImage, resetProfileImage } from "../controllers/profileController.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();
router.post("/upload-profile", authenticateUser, profileUpload.single("image"), uploadProfileImage);
router.post("/reset-profile", authenticateUser, resetProfileImage);

export default router;
