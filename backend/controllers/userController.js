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

    const prevPregnancy = user.pregnancy;

    Object.assign(user, {
      nickname, birthYear, height, weight, exercise,
      pregnancy, subPregnancy, weightBefore,
      nausea, conditions, concerns
    });

    // ✅ "임신 중"으로 전환되는 경우 → 날짜 계산
    if (pregnancy === "임신 중" && prevPregnancy !== "임신 중") {
      if (pregnancyWeek !== undefined && typeof pregnancyWeek === 'number') {
        const today = new Date();
        const startDate = new Date(today.getTime() - pregnancyWeek * 7 * 24 * 60 * 60 * 1000);
        user.pregnancyStartDate = startDate;
        user.pregnancyWeek = pregnancyWeek;
      } else {
        user.pregnancyStartDate = new Date(); // fallback
        user.pregnancyWeek = 0;
      }
    }

    // ✅ 임신 아닌 상태로 전환되는 경우 → 초기화
    else if (pregnancy !== "임신 중") {
      user.pregnancyStartDate = undefined;
      user.pregnancyWeek = undefined;
    }

    // ✅ 임신 상태 유지 중 + 주차 수정한 경우 → 날짜 재계산
    else if (
      pregnancy === "임신 중" &&
      prevPregnancy === "임신 중" &&
      pregnancyWeek !== undefined &&
      typeof pregnancyWeek === 'number'
    ) {
      const today = new Date();
      const startDate = new Date(today.getTime() - pregnancyWeek * 7 * 24 * 60 * 60 * 1000);
      user.pregnancyStartDate = startDate;
      user.pregnancyWeek = pregnancyWeek;
    }

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
        profileImage: user.profileImage,
        pregnancyStartDate: user.pregnancyStartDate,
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
      if (field in req.body) {
        updateFields[field] = req.body[field];
      }
    });

    console.log("💾 실제 반영될 updateFields:", updateFields);

    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "사용자 정보를 찾을 수 없습니다." });

    const prevPregnancy = user.pregnancy;
    const newPregnancy = req.body.pregnancy ?? prevPregnancy;
    const newWeek = req.body.pregnancyWeek;

    // ✅ 비임신 → 임신 중 전환
    if (newPregnancy === "임신 중" && prevPregnancy !== "임신 중") {
      if (typeof newWeek === 'number') {
        const today = new Date();
        const startDate = new Date(today.getTime() - newWeek * 7 * 24 * 60 * 60 * 1000);
        updateFields.pregnancyStartDate = startDate;
        updateFields.pregnancyWeek = newWeek;
      } else {
        updateFields.pregnancyStartDate = new Date();
        updateFields.pregnancyWeek = 0;
      }
    }

    // ✅ 임신 중 유지하면서 주차만 변경한 경우
    else if (
      newPregnancy === "임신 중" &&
      prevPregnancy === "임신 중" &&
      typeof newWeek === 'number'
    ) {
      const today = new Date();
      const startDate = new Date(today.getTime() - newWeek * 7 * 24 * 60 * 60 * 1000);
      updateFields.pregnancyStartDate = startDate;
      updateFields.pregnancyWeek = newWeek;
    }

    // ✅ 임신 중 → 비임신 전환
    else if (newPregnancy !== "임신 중") {
      updateFields.pregnancyStartDate = undefined;
      updateFields.pregnancyWeek = undefined;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: req.user.email },
      { $set: updateFields },
      { new: true }
    );

    res.status(200).json({ status: "ok", message: "정보 업데이트 완료" });
  } catch (error) {
    console.error("❌ 사용자 정보 업데이트 오류:", error);
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
