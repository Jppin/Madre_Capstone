// /app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "redis";
import { validateEnvVars } from './middleware/envValidator.js';

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
import healthRoutes from "./routes/health.js";

// Init
const app = express();
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ▶ ${req.method} ${req.originalUrl}`);
  next();
});

// 환경 변수 검증
validateEnvVars();

// DB 연결
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB 연결됨"))
  .catch((err) => console.error("❌ DB 연결 실패:", err));

// Redis 연결
const redisClient = createClient();
redisClient.connect().catch(console.error);
redisClient.on("error", (err) => console.error("❌ Redis 오류:", err));

// Routes 연결
app.use(express.json());
app.use("/health", healthRoutes);
app.use(profileRoutes); 
app.use(ocrRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(authenticateUser, medicineRoutes);
app.use("/nutrient", nutrientRoutes);
app.use("/mealplan", mealplanRoutes);
app.use("/youtube", youtubeRoutes);

// Health Check 라우트
app.get("/health-check", async (req, res) => {
  try {
    // MongoDB 연결 상태 확인
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Redis 연결 상태 확인
    const redisStatus = redisClient.isReady ? 'connected' : 'disconnected';
    
    // 시스템 리소스 상태
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus,
        redis: redisStatus
      },
      system: {
        memory: {
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
        },
        uptime: `${Math.round(uptime / 60)} minutes`
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
});

  
// 404 에러 핸들링 (모든 라우트 이후에 위치)
import { notFoundHandler } from './middleware/errorHandler.js';
app.use(notFoundHandler);

// 에러 핸들링 미들웨어 (가장 마지막에 위치)
import { errorHandler } from './middleware/errorHandler.js';
app.use(errorHandler);


// Root
app.get("/", (req, res) => res.send({ status: "Started" }));

// Start
const PORT = process.env.PORT || 5001;
const BASE_URL = process.env.BASE_URL || "localhost";
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ 서버가 http://${BASE_URL}:${PORT} 에서 실행 중`);
});
