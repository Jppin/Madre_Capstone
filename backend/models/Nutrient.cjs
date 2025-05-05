const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema({
  type: String,
  category: String,
  keyword: String,
  reason: String
});

const NutrientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  info: { type: String },
  usage: { type: String },
  precaution: { type: String },
  recommendations: [RecommendationSchema]
});

module.exports = mongoose.model("Nutrient", NutrientSchema);
