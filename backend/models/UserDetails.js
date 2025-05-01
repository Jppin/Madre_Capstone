//backend/models/UserDetails.js

const mongoose = require("mongoose");
require('dotenv').config();


const UserDetailSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true }, // ✅ 이메일 (기존)
    password: { type: String, required: true }, // ✅ 비밀번호 (기존)
    nickname: { type: String, default: "사용자" },  // ✅ 기본값 추가
    birthYear: { type: Number, default: null },  // ✅ 기본값 추가 (없으면 null)
    height: { type: Number, default: null }, // cm 단위
    weight: { type: Number, default: null }, // kg 단위
    exercise: { type: Number, default: 0 }, // ✅ 운동동 횟수
    pregnancy: { type: String, default: "해당 없음" }, // ✅ 임신 상태 (기본값)
    weightBefore: { type: Number, default: null }, // ✅ 임신 전 몸무게 (임신 중인 경우만)
    conditions: { type: [String], default: [] }, // ✅ 사용자가 선택한 질환 목록
    concerns: { type: [String], default: [] }, // ✅ 건강 고민 목록
    isNewUser: { type: Boolean, default: true }, // ✅ 온보딩 여부 (최초 가입 후 false 변경)
    subPregnancy: { type: String, default: null }, // 임신 단계
    pregnancyWeek: { type: Number, default: null }, // 임신 주차
    nausea: { type: Number, default: 0 }, // 입덧 정도
    profileImage: { 
      type: String, 
      default: `${process.env.BASE_URL}:${process.env.PORT}/uploads/default_profile.png` // ✅ 기본값을 서버 이미지 URL로 설정
    },
  },
  {
    collection: "UserInfo",
  }
);

mongoose.model("UserInfo", UserDetailSchema);
