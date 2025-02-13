const mongoose = require("mongoose");

const UserDetailSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },  // ✅ 이메일 필수값 지정
    password: { type: String, required: true }  // ✅ 비밀번호 필수값 지정 (confirmPassword 제거)
}, {
    collection: "UserInfo",
});

mongoose.model("UserInfo", UserDetailSchema);
