// /routes/mealplan.js
import express from "express";
import { authenticateUser } from "../middleware/auth.js";
import { generateAndSaveMealPlan, getLatestMealPlan } from "../controllers/mealplanController.js";

const router = express.Router();

router.post("/generate-and-save", generateAndSaveMealPlan);
router.get("/latest", authenticateUser, getLatestMealPlan);

export default router;
