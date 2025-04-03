const mongoose = require("mongoose");

const UserDetailSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true }, // ✅ 이메일 (기존)
    password: { type: String, required: true }, // ✅ 비밀번호 (기존)
    nickname: { type: String, default: "사용자" },  // ✅ 기본값 추가
    birthYear: { type: Number, default: null },  // ✅ 기본값 추가 (없으면 null)
    exercise: { type: Number, default: 0 }, // ✅ 운동동 횟수
    //smoking: { type: String, enum: ["yes", "no"], default: "no" }, // ✅ 흡연 여부
    pregnancy: { type: String, default: "해당 없음" }, // ✅ 임신 상태 (기본값)
    conditions: { type: [String], default: [] }, // ✅ 사용자가 선택한 질환 목록
    concerns: { type: [String], default: [] }, // ✅ 건강 고민 목록
    isNewUser: { type: Boolean, default: true }, // ✅ 온보딩 여부 (최초 가입 후 false 변경)
    profileImage: { 
      type: String, 
      default: "http://10.0.2.2:5001/uploads/default_profile.png" // ✅ 기본값을 서버 이미지 URL로 설정
    },
  },
  {
    collection: "UserInfo",
  }
);

mongoose.model("UserInfo", UserDetailSchema);
