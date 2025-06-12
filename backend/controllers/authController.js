// /controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserInfo.js";
import nodemailer from "nodemailer";
import { AppError } from "../middleware/errorHandler.js";

const JWT_SECRET = process.env.JWT_SECRET;

// 🔐 회원가입
export const registerUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError("이미 등록된 이메일입니다.", 400);
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: encryptedPassword });

    const token = jwt.sign({ email: newUser.email }, JWT_SECRET, { expiresIn: "1h" });
    res.status(201).json({ status: "ok", token });
  } catch (err) {
    next(err);
  }
};

// 🔑 로그인
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new AppError("사용자가 존재하지 않습니다.", 404);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError("잘못된 비밀번호입니다.", 401);

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "24h" });
    res.status(200).json({ status: "ok", token });
  } catch (err) {
      next(err);
  }
};

// 🔐 임시 비밀번호 발급
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new AppError("가입된 이메일이 없습니다.", 404);

    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nutribox26@gmail.com",
        pass: "waaj lzqi mnxb lqgh",
      },
    });

    const mailOptions = {
      from: "nutribox26@gmail.com",
      to: email,
      subject: "임시 비밀번호 발송",
      text: `임시 비밀번호: ${tempPassword}\n로그인 후 비밀번호를 변경해주세요.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "임시 비밀번호가 이메일로 발송되었습니다." });
  } catch (err) {
      next(err);
  }
};

// 🔐 비밀번호 변경
export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) throw new AppError("사용자를 찾을 수 없습니다.", 404);

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new AppError("현재 비밀번호가 올바르지 않습니다.", 400);

    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[\W_]).{10,}$/.test(newPassword)) {
      throw new AppError("비밀번호 조건을 만족하지 않습니다.", 400);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: "비밀번호 변경 완료. 다시 로그인해주세요." });
  } catch (err) {
    next(err);
  }
};

// 🔐 사용자 정보 조회
export const getUserData = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) throw new AppError("사용자 정보를 찾을 수 없습니다.", 404);
    res.status(200).json({ email: user.email, isNewUser: user.isNewUser });
  } catch (err) {
    next(err);
  }
};

// 🔐 isNewUser 상태 업데이트
export const updateIsNewUser = async (req, res, next) => {
  try {
    await User.updateOne({ email: req.user.email }, { isNewUser: false });
    res.status(200).json({ message: "isNewUser 업데이트 완료" });
  } catch (err) {
    next(err);
  }
};

// 🔐 회원 탈퇴
export const withdrawUser = async (req, res, next) => {
  try {
    await User.deleteOne({ email: req.user.email });
    res.status(200).json({ message: "회원 탈퇴 완료" });
  } catch (err) {
    next(err);
  }
};
