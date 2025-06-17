import mongoose from "mongoose";
import axios from "axios";

const MealSchema = new mongoose.Schema({
  menu: String,
  warning: String,
  explanation: String,
  benefit: String,
  smartTip: String,
});

const DailyGuideSchema = new mongoose.Schema({
  theme: String, // ex) 철분 강화 식단
  themeComment: String, // ex) 철분이 부족한 임산부에게 좋은 식단입니다
  nutrientFulfillment: {
    type: Map,
    of: String, // ex) "엽산": "85%"
  },
  supplementRecommendation: {
    supplements: [String], // ex) ["철분제 30~50mg", "엽산 400~600μg"]
    explanation: String,   // ex) "철분 섭취가 부족해 보충이 필요해요."
  },
  precautions: [String], // ex) "유제품과 함께 복용하지 마세요."
});

const MealPlanSchema = new mongoose.Schema({
  email: String,
  kcal: Number,
  macroRatio: {
    percent: {
      탄수화물: String,
      단백질: String,
      지방: String,
    },
    grams: {
      carb: Number,
      protein: Number,
      fat: Number,
    },
  },
  micronutrients: {
    type: Map,
    of: String,
    default: {},
  },
  avoidedFoods: [String],
  llmResult: String,
  breakfast: MealSchema,
  lunch: MealSchema,
  dinner: MealSchema,
  snack: MealSchema,
  dailyGuide: DailyGuideSchema,
}, { timestamps: true });

export default mongoose.model("MealPlan", MealPlanSchema);
