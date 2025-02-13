const express = require("express");
const app = express();
app.use(express.json());

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

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
        const token = jwt.sign({ email: oldUser.email }, JWT_SECRET, { expiresIn: "1h" });

        return res.status(200).json({ status: "ok", token }); // ✅ token을 JSON 응답에 포함
    } else {
        return res.status(401).json({ status: "error", message: "잘못된 비밀번호입니다." });
    }
});


// ✅ 사용자 데이터 가져오기 엔드포인트 (토큰 헤더 방식 적용)
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

// ✅ 서버 시작
app.listen(5001, () => {
  console.log("Node.js server started on port 5001.");
});
