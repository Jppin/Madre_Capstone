const mongoose = require("mongoose");

// ✅ 약품 데이터 모델 (최소한의 필드만 저장)
const DrugSchema = new mongoose.Schema({
  ITEM_SEQ: { type: String, required: true, unique: true, index: true }, // 약품 고유 ID
  ITEM_NAME: { type: String, required: true, index: true }, // 약품명
  ENTP_NAME: { type: String, required: true }, // 제조사
  ETC_OTC_CODE: String, // 전문의약품 / 일반의약품
  CLASS_NO: String, // 약품 분류
  CHART: { type: String },
  MATERIAL_NAME: String, // 주요 성분 (첫 번째 성분만 저장)
  TYPE_NAME: String, // 금기 정보 (예: 임부금기, 첨가제 주의)
  STORAGE_METHOD: String, // 보관 방법
  VALID_TERM: String, // 유효 기간
  UPDATE_DATE: { type: Date, default: Date.now, index: -1 },  // ✅ 날짜 인덱스 (최신순 정렬 최적화)
});

// ✅ 복합 인덱스 (ITEM_SEQ & ITEM_NAME 함께 조회할 경우 최적화)
DrugSchema.index({ ITEM_SEQ: 1, ITEM_NAME: 1 });

const Drug = mongoose.model("Drug", DrugSchema);

module.exports = Drug;
