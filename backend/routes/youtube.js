// /routes/youtube.js
import express from "express";
import { fetchYoutubeVideos } from "../controllers/youtubeController.js";

const router = express.Router();

router.get("/", fetchYoutubeVideos);

export default router;
