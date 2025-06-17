// 커스텀 에러 클래스
export class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // 에러 핸들링 미들웨어
  export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    // 개발 환경에서는 상세 에러 정보 제공
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
      console.error(err.stack);
  
      res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
      });
    } 
    // 프로덕션 환경에서는 제한된 정보만 제공
    else {
      // 운영 에러인 경우에만 클라이언트에게 에러 메시지 전달
      if (err.isOperational) {
        res.status(err.statusCode).json({
          status: err.status,
          message: err.message
        });
      } 
      // 프로그래밍 에러나 알 수 없는 에러의 경우 일반적인 에러 메시지
      else {
        console.error('ERROR 💥', err);
        res.status(500).json({
          status: 'error',
          message: '서버에서 오류가 발생했습니다.'
        });
      }
    }
  };
  
  // 404 에러 핸들링
  export const notFoundHandler = (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  };