import { AppError } from './errorHandler.js';

const requiredEnvVars = [
  'JWT_SECRET',
  'MONGO_URI',
  'YOUTUBE_API_KEY',
  'OPEN_API_URL',
  'OPEN_API_KEY'
];

export const validateEnvVars = () => {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new AppError(
      `필수 환경 변수가 설정되지 않았습니다: ${missingVars.join(', ')}`,
      500
    );
  }

  // 환경 변수 형식 검증
  if (process.env.MONGO_URI && !process.env.MONGO_URI.startsWith('mongodb')) {
    throw new AppError('MONGO_URI가 올바른 형식이 아닙니다.', 500);
  }

  if (process.env.PORT && isNaN(Number(process.env.PORT))) {
    throw new AppError('PORT는 숫자여야 합니다.', 500);
  }

  if (process.env.FLASK_PORT && isNaN(Number(process.env.FLASK_PORT))) {
    throw new AppError('FLASK_PORT는 숫자여야 합니다.', 500);
  }

  console.log('✅ 환경 변수 검증 완료');
}; 