// /controllers/profileController.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import User from "../models/UserInfo.js";
import { AppError } from "../middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET;

export const uploadProfileImage = async (req, res, next) => {
  try {
    console.log("📥 업로드된 파일:", req.file); // ✅ 여기에 추가!
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) throw new AppError("사용자 정보 없음", 404);

    const fileExtension = path.extname(req.file.originalname);
    const newFilename = `${decoded.email.replace(/[^a-zA-Z0-9]/g, "_")}${fileExtension}`;
    const newPath = path.join(__dirname, "../uploads", newFilename);

    fs.renameSync(req.file.path, newPath);
    user.profileImage = `/uploads/${newFilename}`;
    await user.save();

    res.json({ status: "ok", profileImage: user.profileImage });
  } catch (e) {
    next(e);
  }
};

export const resetProfileImage = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const defaultImagePath = "/uploads/default_profile.png";

    const user = await User.findOneAndUpdate(
      { email: decoded.email },
      { profileImage: defaultImagePath }, // ✅ 기본 이미지 경로를 명시적으로 저장
      { new: true }
    );

    if (!user) throw new AppError("사용자 정보 없음", 404);

    res.json({
      status: "ok",
      message: "기본 프로필 이미지로 변경됨",
      profileImage: user.profileImage // 추가로 전달하면 프론트도 바로 반영 가능
    });
  } catch (e) {
    console.error("❌ 기본 이미지 변경 오류:", e);
      next(e);
  }
};

