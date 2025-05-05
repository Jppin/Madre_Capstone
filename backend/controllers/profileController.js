// /controllers/profileController.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import User from "../models/UserInfo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET;

export const uploadProfileImage = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ message: "사용자 정보 없음" });

    const fileExtension = path.extname(req.file.originalname);
    const newFilename = `${decoded.email.replace(/[^a-zA-Z0-9]/g, "_")}${fileExtension}`;
    const newPath = path.join(__dirname, "../uploads", newFilename);

    fs.renameSync(req.file.path, newPath);
    user.profileImage = `/uploads/${newFilename}`;
    await user.save();

    res.json({ status: "ok", profileImage: user.profileImage });
  } catch (e) {
    res.status(500).json({ message: "프로필 업로드 실패" });
  }
};

export const resetProfileImage = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOneAndUpdate(
      { email: decoded.email },
      { $unset: { profileImage: "" } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "사용자 정보 없음" });

    res.json({ status: "ok", message: "기본 프로필 이미지로 변경됨" });
  } catch (e) {
    res.status(500).json({ message: "기본 이미지 복원 실패" });
  }
};
