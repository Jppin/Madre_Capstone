// /routes/mealplan.js
import express from "express";
import { generateMealPlan } from "../controllers/mealplanController.js";
import { authenticateUser } from "../middleware/auth.js";
import { getEnergyAndMacroInfo } from "../controllers/mealplanController.js";
import { getLatestMealPlan } from "../controllers/mealplanController.js";


const router = express.Router();

router.post("/generate", generateMealPlan);
router.get("/energy-macro", authenticateUser, getEnergyAndMacroInfo);
router.get("/latest", authenticateUser, getLatestMealPlan);

export default router;
