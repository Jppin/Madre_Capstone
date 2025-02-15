//App.js

const express = require("express");
const app = express();
app.use(express.json());

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const mongoUrl = 
  "mongodb+srv://dding921:1472uiop!!@graduationpj.w6wq3.mongodb.net/?retryWrites=true&w=majority&appName=graduationpj";

const JWT_SECRET = "sdfsdferrwsdkjhk12j34##$@^&dlfjsdjfersgiobkcm";

mongoose
  .connect(mongoUrl)
  .then(() => console.log("Database Connected"))
  .catch((e) => console.log(e));

require("./UserDetails");
const User = mongoose.model("UserInfo");

app.get("/", (req, res) => {
  res.send({ status: "Started" });
});









// ✅ 비밀번호 찾기 (임시 비밀번호 전송)
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
      return res.status(400).json({ message: "이메일을 입력하세요." });
  }

  try {
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(404).json({ message: "가입된 이메일이 없습니다." });
      }

      // ✅ 8자리 랜덤 임시 비밀번호 생성
      const tempPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // ✅ DB에 새로운 해시된 비밀번호 저장
      await User.updateOne({ email }, { $set: { password: hashedPassword } });

      // ✅ 이메일 전송 설정
      const transporter = nodemailer.createTransport({
          service: "gmail", // ✅ Gmail SMTP 사용
          auth: {
              user: "nutribox26@gmail.com",
              pass: "waaj lzqi mnxb lqgh", // ✅ Gmail 앱 비밀번호 사용 (보안 강화 필요)
          },
      });

      const mailOptions = {
          from: "nutribox26@gmail.com",
          to: email,
          subject: "임시 비밀번호 발송",
          text: `임시 비밀번호: ${tempPassword}\n로그인 후 비밀번호를 변경해주세요.`,
      };

      await transporter.sendMail(mailOptions);

      res.json({ message: "임시 비밀번호가 이메일로 발송되었습니다." });

  } catch (error) {
      console.error("비밀번호 찾기 오류:", error);
      res.status(500).json({ message: "서버 오류 발생" });
  }
});








// ✅ 회원가입 엔드포인트
app.post("/register", async (req, res) => {
    const { email, password } = req.body;
    const oldUser = await User.findOne({ email });

    if (oldUser) {
        return res.status(400).json({ status: "error", message: "이미 등록된 이메일입니다." });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: encryptedPassword });

    // ✅ 회원가입 후 바로 토큰 생성
    const token = jwt.sign({ email: newUser.email }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ status: "ok", token });
});








// ✅ 로그인 엔드포인트
app.post("/login-user", async(req, res) => {
    const { email, password } = req.body;
    const oldUser = await User.findOne({ email });

    if (!oldUser) {
        return res.status(404).json({ status: "error", message: "사용자가 존재하지 않습니다." });
    }

    if (await bcrypt.compare(password, oldUser.password)) {
        const token = jwt.sign({ email: oldUser.email }, JWT_SECRET, { expiresIn: "3h" });

        return res.status(200).json({ status: "ok", token }); // ✅ token을 JSON 응답에 포함
    } else {
        return res.status(401).json({ status: "error", message: "잘못된 비밀번호입니다." });
    }
});






// ✅ 사용자 데이터 가져오기 엔드포인트 (토큰 헤더 방식 적용) - 이멜만 가져옴옴
app.get("/userdata", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "사용자 정보를 찾을 수 없습니다." });
    }
    res.status(200).json({ status: "ok", data: { email: user.email } });
  } catch (error) {
    res.status(401).json({ status: "error", message: "유효하지 않은 토큰입니다." });
  }
});







// ✅ 사용자 정보 저장 엔드포인트 (온보딩 완료 시 호출)
app.post("/save-user-info", async (req, res) => {
  const { email, nickname, birthYear, gender, alcohol, smoking, pregnancy, conditions, concerns } = req.body;

  try {
      // ✅ 이메일로 기존 사용자 찾기
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(404).json({ status: "error", message: "사용자를 찾을 수 없습니다." });
      }

      // ✅ 사용자 데이터 업데이트
      user.nickname = nickname;
      user.birthYear = birthYear;
      user.gender = gender;
      user.alcohol = alcohol;
      user.smoking = smoking;
      user.pregnancy = pregnancy;
      user.conditions = conditions;
      user.concerns = concerns;

      await user.save(); // ✅ 데이터 저장

      res.status(200).json({ status: "ok", message: "사용자 정보 저장 완료" });
  } catch (error) {
      console.error("❌ 사용자 정보 저장 오류:", error);
      res.status(500).json({ status: "error", message: "사용자 정보 저장 중 문제가 발생했습니다." });
  }
});






// ✅ 전체 사용자 정보 가져오기 엔드포인트 - 마이페이지용
app.get("/user-full-data", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "사용자 정보를 찾을 수 없습니다." });
    }

    // ✅ 전체 사용자 정보 반환
    res.status(200).json({ 
      status: "ok", 
      data: {
        email: user.email,
        nickname: user.nickname,
        birthYear: user.birthYear,
        gender: user.gender,
        alcohol: user.alcohol,
        smoking: user.smoking,
        pregnancy: user.pregnancy,
        conditions: user.conditions,
        concerns: user.concerns
      } 
    });
  } catch (error) {
    res.status(401).json({ status: "error", message: "유효하지 않은 토큰입니다." });
  }
});


//마이페이지 이름성별나이&건강습관 업뎃
app.post("/update-user-info", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { nickname, birthYear, gender, alcohol, smoking, pregnancy } = req.body;

    // ✅ 업데이트할 필드만 선택적으로 저장 (값이 undefined인 경우 업데이트하지 않음)
    const updateFields = {};
    if (nickname !== undefined) updateFields.nickname = nickname;
    if (birthYear !== undefined) updateFields.birthYear = birthYear;
    if (gender !== undefined) updateFields.gender = gender;
    if (alcohol !== undefined) updateFields.alcohol = alcohol;
    if (smoking !== undefined) updateFields.smoking = smoking;
    if (pregnancy !== undefined) updateFields.pregnancy = pregnancy;


    const user = await User.findOneAndUpdate(
      { email: decoded.email },
      { $set: updateFields },
      { new: true } // 업데이트 후 변경된 데이터 반환
    );

    if (!user) {
      return res.status(404).json({ message: "사용자 정보를 찾을 수 없습니다." });
    }

    res.status(200).json({ status: "ok", message: "사용자 정보 업데이트 완료" });
  } catch (error) {
    console.error("사용자 정보 업데이트 오류:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});








// ✅ 서버 시작
app.listen(5001, () => {
  console.log("Node.js server started on port 5001.");
});
