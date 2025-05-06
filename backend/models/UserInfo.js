//backend/models/UserInfo.js

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const UserInfoSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    nickname: { type: String, default: "사용자" },
    birthYear: { type: Number, default: null },
    height: { type: Number, default: null },
    weight: { type: Number, default: null },
    exercise: { type: Number, default: 0 },
    pregnancy: { type: String, default: "해당 없음" },
    weightBefore: { type: Number, default: null },
    conditions: { type: [String], default: [] },
    concerns: { type: [String], default: [] },
    isNewUser: { type: Boolean, default: true },
    subPregnancy: { type: String, default: null },
    pregnancyWeek: { type: Number, default: null },
    nausea: { type: Number, default: 0 },
    profileImage: {
      type: String,
      default: `${process.env.BASE_URL}:${process.env.PORT}/uploads/default_profile.png`,
    },
  },
  {
    collection: "UserInfo",
  }
);

const UserInfo = mongoose.model("UserInfo", UserInfoSchema);
export default UserInfo;
