import express from "express";
import mongoose from "mongoose";
import { createClient } from "redis";

const router = express.Router();

// Redis 클라이언트 생성
const redisClient = createClient();

// 헬스 체크 엔드포인트
router.get("/", async (req, res) => {
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

export default router; 