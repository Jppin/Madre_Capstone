import mongoose from "mongoose";

const MealSchema = new mongoose.Schema({
  menu: String,
  warning: String,
  reason: String,
  tip: String,
});

const DailyGuideSchema = new mongoose.Schema({
  nutrientFulfillment: String,
  supplementGuide: String,
  precautions: String,
  tip: String,
});

const MealPlanSchema = new mongoose.Schema({
  email: String,
  kcal: Number,
  macroRatio: String,
  llmResult: String,
  breakfast: MealSchema,
  lunch: MealSchema,
  dinner: MealSchema,
  snack: MealSchema,
  dailyGuide: DailyGuideSchema,
}, { timestamps: true });

export default mongoose.model("MealPlan", MealPlanSchema);
