// /controllers/nutrientController.js
import Nutrition from "../models/Nutrient.cjs";
import LikedNutrient from "../models/LikedNutrient.js";

const labelMap = {
  "0": "운동 없음",
  "1": "주 1회 운동",
  "2": "주 2회 운동",
  "3": "주 3회 운동",
  "4": "주 4회 운동",
  "5": "주 5회 운동",
  "6": "주 6회 운동",
  "7": "주 7회 운동",
};

export const getRecommendedNutrients = async (req, res) => {
  try {
    const { concerns } = req.query;
    if (!concerns || concerns.length === 0) {
      return res.status(400).json({ status: "error", message: "No concerns provided" });
    }

    const nutrients = await Nutrition.find({
      "recommendations.category": "건강관심사",
      "recommendations.keyword": { $in: concerns }
    });

    res.json({ status: "ok", data: nutrients });
  } catch (error) {
    console.error("[getRecommendedNutrients]", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

export const getPersonalizedNutrients = async (req, res) => {
  try {
    const user = req.user;

    const keywords = [
      { category: "운동", keyword: String(user.exercise) },
      { category: "임신", keyword: user.pregnancy },
      ...user.conditions.map((c) => ({ category: "건강문제", keyword: c })),
      ...user.concerns.map((c) => ({ category: "건강관심사", keyword: c }))
    ];

    const results = await Nutrition.find({
      recommendations: {
        $elemMatch: {
          $or: keywords.map(({ category, keyword }) => ({ category, keyword }))
        }
      }
    });

    const recommendList = [];
    const warningList = [];

    results.forEach((item) => {
      item.recommendations.forEach((rec) => {
        if (keywords.some(k => k.category === rec.category && k.keyword === rec.keyword)) {
          const label = labelMap[rec.keyword] || rec.keyword;
          const target = {
            name: item.name,
            effect: rec.reason,
            concern: label
          };
          rec.type === "추천" ? recommendList.push(target) : warningList.push(target);
        }
      });
    });

    res.json({ recommendList, warningList });
  } catch (error) {
    console.error("[getPersonalizedNutrients]", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
};

export const likeNutrient = async (req, res) => {
  try {
    const { nutrientName } = req.body;
    const exists = await LikedNutrient.findOne({ email: req.user.email, nutrientName });
    if (exists) {
      return res.status(400).json({ message: "이미 찜한 영양 성분입니다." });
    }

    const liked = new LikedNutrient({ email: req.user.email, nutrientName });
    await liked.save();
    res.status(201).json({ message: "찜한 영양 성분 추가 완료" });
  } catch (error) {
    console.error("[likeNutrient]", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
};

export const getLikedNutrients = async (req, res) => {
  try {
    const liked = await LikedNutrient.find({ email: req.user.email }).select("nutrientName -_id");
    res.status(200).json({ likedNutrients: liked.map(n => n.nutrientName) });
  } catch (error) {
    console.error("[getLikedNutrients]", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
};

export const unlikeNutrient = async (req, res) => {
  try {
    const { nutrientName } = req.body;
    await LikedNutrient.deleteOne({ email: req.user.email, nutrientName });
    res.status(200).json({ message: "찜한 영양 성분 삭제 완료" });
  } catch (error) {
    console.error("[unlikeNutrient]", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
};
