import mongoose from "mongoose";

const LikedNutrientSchema = new mongoose.Schema({
  email: { type: String, required: true },         // 사용자 이메일
  nutrientName: { type: String, required: true },  // 찜한 영양 성분
  createdAt: { type: Date, default: Date.now },    // 찜한 날짜
});

const LikedNutrient = mongoose.model("LikedNutrient", LikedNutrientSchema);
export default LikedNutrient;
