import User from "../models/UserInfo.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// 온보딩 정보 저장
export const saveUserInfo = async (req, res) => {
  const {
    email, nickname, birthYear, height, weight, exercise,
    pregnancy, subPregnancy, pregnancyWeek, weightBefore,
    nausea, conditions, concerns
  } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: "error", message: "사용자를 찾을 수 없습니다." });

    Object.assign(user, {
      nickname, birthYear, height, weight, exercise,
      pregnancy, subPregnancy, pregnancyWeek, weightBefore,
      nausea, conditions, concerns
    });

    await user.save();
    res.status(200).json({ status: "ok", message: "사용자 정보 저장 완료" });
  } catch (error) {
    console.error("❌ 사용자 정보 저장 오류:", error);
    res.status(500).json({ status: "error", message: "저장 중 오류 발생" });
  }
};

// 마이페이지 - 전체 정보 조회
export const getUserFullData = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "사용자 정보를 찾을 수 없습니다." });

    res.status(200).json({
      status: "ok",
      data: {
        _id: user._id,
        email: user.email,
        nickname: user.nickname,
        height: user.height,
        weight: user.weight,
        birthYear: user.birthYear,
        exercise: user.exercise,
        pregnancy: user.pregnancy,
        subPregnancy: user.subPregnancy,
        pregnancyWeek: user.pregnancyWeek,
        weightBefore: user.weightBefore,
        nausea: user.nausea,
        conditions: user.conditions,
        concerns: user.concerns,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "서버 오류 발생" });
  }
};

// 이름/나이 등 기본 정보 업데이트
export const updateUserInfo = async (req, res) => {
  try {
    const updateFields = {};
    const fields = [
      "nickname", "birthYear", "height", "weight", "exercise",
      "pregnancy", "subPregnancy", "pregnancyWeek", "weightBefore", "nausea"
    ];
    fields.forEach(field => {
      if (req.body[field] !== undefined) updateFields[field] = req.body[field];
    });

    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      { $set: updateFields },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "사용자 정보를 찾을 수 없습니다." });
    res.status(200).json({ status: "ok", message: "정보 업데이트 완료" });
  } catch (error) {
    res.status(500).json({ message: "서버 오류 발생" });
  }
};

// 만성질환 업데이트
export const updateUserConditions = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      { conditions: req.body.conditions },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "사용자 정보를 찾을 수 없습니다." });
    res.status(200).json({ status: "ok", message: "만성질환 업데이트 완료" });
  } catch (error) {
    res.status(500).json({ message: "서버 오류 발생" });
  }
};

// 건강 고민 업데이트
export const updateUserConcerns = async (req, res) => {
  try {
    const concerns = req.body.concerns;
    if (!Array.isArray(concerns)) return res.status(400).json({ status: "error", message: "concerns는 배열이어야 합니다." });

    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      { $set: { concerns } },
      { new: true }
    );

    if (!user) return res.status(404).json({ status: "error", message: "사용자를 찾을 수 없습니다." });
    res.json({ status: "ok", message: "건강 고민 업데이트 완료" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "서버 오류 발생" });
  }
};
