// /routes/mealplan.js
import express from "express";
import { generateMealPlan } from "../controllers/mealplanController.js";

const router = express.Router();

router.post("/generate", generateMealPlan);

export default router;
