const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema({
    type: String, // "추천" or "주의"
    category: String, // 건강관심사, 흡연, 임신 등
    keyword: String, // 예: "눈 건강", "면역 기능"
    reason: String // 추천 또는 주의 이유
});

const NutritionSchema = new mongoose.Schema({
    name: { type: String, required: true }, // 영양소 이름
    info: { type: String }, // 성분 소개
    usage: { type: String }, // 복용 방법
    precaution: { type: String }, // 주의사항
    recommendations: [RecommendationSchema] // 추천 및 주의사항 배열
});

const Nutrition = mongoose.model("Nutrition", NutritionSchema);

module.exports = Nutrition;
