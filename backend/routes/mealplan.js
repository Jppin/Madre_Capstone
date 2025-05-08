// /routes/mealplan.js
import express from "express";
import { generateMealPlan } from "../controllers/mealplanController.js";
import { authenticateUser } from "../middleware/auth.js";
import { getEnergyAndMacroInfo } from "../controllers/mealplanController.js";
import { submitAvoidedFoods } from "../controllers/mealplanController.js";

const router = express.Router();

router.post("/generate", generateMealPlan);
router.get("/energy-macro", authenticateUser, getEnergyAndMacroInfo);
router.post("/submit-avoided-foods", authenticateUser, submitAvoidedFoods);

export default router;
