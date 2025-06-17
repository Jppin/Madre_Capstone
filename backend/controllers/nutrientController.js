// /controllers/nutrientController.js
import Nutrition from "../models/Nutrient.cjs";
import LikedNutrient from "../models/LikedNutrient.js";
import { AppError } from "../middleware/errorHandler.js";




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

export const getRecommendedNutrients = async (req, res, next) => {
  try {
    const { concerns } = req.query;
    if (!concerns || concerns.length === 0) {
      throw new AppError("No concerns provided", 400);
    }

    const nutrients = await Nutrition.find({
      "recommendations.category": "건강관심사",
      "recommendations.keyword": { $in: concerns }
    });

    res.json({ status: "ok", data: nutrients });
  } catch (error) {
    console.error("[getRecommendedNutrients]", error);
    next(error);
  }
};

export const getPersonalizedNutrients = async (req, res, next) => {
  try {
    const user = req.user;

    const keywords = [
      { category: "운동", keyword: String(user.exercise) },
      { category: "임신", keyword: user.subPregnancy },
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
    next(error);
  }
};

export const likeNutrient = async (req, res, next) => {
  try {
    console.log("[likeNutrient] req.user:", req.user); // 🔥 추가
    console.log("[likeNutrient] nutrientName:", req.body.nutrientName); // 🔥 추가
    const { nutrientName } = req.body;
    const exists = await LikedNutrient.findOne({ email: req.user.email, nutrientName });
    if (exists) {
      throw new AppError("이미 찜한 영양 성분입니다.", 400);
    }

    const liked = new LikedNutrient({ email: req.user.email, nutrientName });
    await liked.save();
    res.status(201).json({ message: "찜한 영양 성분 추가 완료" });
  } catch (error) {
    console.error("[likeNutrient]", error);
    next(error);
  }
};

export const getLikedNutrients = async (req, res, next) => {
  try {
    const liked = await LikedNutrient.find({ email: req.user.email }).select("nutrientName -_id");
    res.status(200).json({ likedNutrients: liked.map(n => n.nutrientName) });
  } catch (error) {
    console.error("[getLikedNutrients]", error);
    next(error);
  }
};

export const unlikeNutrient = async (req, res, next) => {
  try {
    const { nutrientName } = req.body;
    await LikedNutrient.deleteOne({ email: req.user.email, nutrientName });
    res.status(200).json({ message: "찜한 영양 성분 삭제 완료" });
  } catch (error) {
    console.error("[unlikeNutrient]", error);
    next(error);
  }
  
};





//상세보기 페이지
export const getNutrientDetail = async (req, res, next) => {
  try {
    const nutrientName = req.params.name;
    const nutrient = await Nutrition.findOne({ name: nutrientName });

    if (!nutrient) {
      throw new AppError("해당 영양소를 찾을 수 없습니다.", 404);
    }

    res.status(200).json({
      name: nutrient.name,
      info: nutrient.info,
      usage: nutrient.usage,
      precaution: nutrient.precaution,
    });
  } catch (error) {
    console.error("[getNutrientDetail]", error);
    next(error);
  }
};

