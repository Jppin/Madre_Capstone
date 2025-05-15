// /app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "redis";

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import profileRoutes from "./routes/profile.js";
import medicineRoutes from "./routes/medicine.js";
import nutrientRoutes from "./routes/nutrient.js";
import ocrRoutes from "./routes/ocr.js";
import youtubeRoutes from "./routes/youtube.js";
import mealplanRoutes from "./routes/mealplan.js";
import { authenticateUser } from "./middleware/auth.js";

// Init
const app = express();
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use((req, res, next) => {
  console.log(`📥 요청 도착: ${req.method} ${req.url}`);
  next();
});


// DB 연결
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB 연결됨"))
  .catch((err) => console.error("❌ DB 연결 실패:", err));

// Redis 연결
const redisClient = createClient();
redisClient.connect().catch(console.error);
redisClient.on("error", (err) => console.error("❌ Redis 오류:", err));

// Routes 연결
app.use(profileRoutes); 
app.use(ocrRoutes);
app.use(express.json());

app.use(authRoutes);
app.use(userRoutes);
app.use(authenticateUser, medicineRoutes);
app.use("/nutrient", nutrientRoutes);
app.use("/mealplan", mealplanRoutes);
app.use("/youtube", youtubeRoutes);


// Root
app.get("/", (req, res) => res.send({ status: "Started" }));

// Start
const PORT = process.env.PORT || 5001;
const BASE_URL = process.env.BASE_URL || "localhost";
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ 서버가 http://${BASE_URL}:${PORT} 에서 실행 중`);
});
