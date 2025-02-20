//app.js(backend)

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();
app.use(express.json());
const { spawn } = require("child_process");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Medicine = require("./models/Medicine"); // ✅ 약품 모델 추가

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
        const token = jwt.sign({ email: oldUser.email }, JWT_SECRET, { expiresIn: "24h" });

        return res.status(200).json({ status: "ok", token }); // ✅ token을 JSON 응답에 포함
    } else {
        return res.status(401).json({ status: "error", message: "잘못된 비밀번호입니다." });
    }
});








// ✅ 로그인용 사용자 데이터 가져오기 엔드포인트 (토큰 헤더 방식 적용) - 이멜만 가져옴옴
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
        concerns: user.concerns,
        profileImage: user.profileImage 
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






// 마이페이지용 만성질환 정보 업데이트 API
app.post("/update-conditions", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { conditions } = req.body;

    // MongoDB에서 해당 사용자를 찾아 conditions 업데이트
    const user = await User.findOneAndUpdate(
      { email: decoded.email },
      { conditions },
      { new: true } // 업데이트 후 변경된 데이터 반환
    );

    if (!user) {
      return res.status(404).json({ message: "사용자 정보를 찾을 수 없습니다." });
    }

    res.status(200).json({ status: "ok", message: "만성질환 정보 업데이트 완료" });
  } catch (error) {
    console.error("만성질환 업데이트 오류:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});








// 마이페이지용 건강고민 업데이트 API
app.post("/update-user-concerns", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { concerns } = req.body;

    if (!Array.isArray(concerns)) {
      return res.status(400).json({ status: "error", message: "concerns는 배열이어야 합니다." });
    }

    // ✅ `findOneAndUpdate`를 사용하여 데이터 업데이트
    const user = await User.findOneAndUpdate(
      { email: decoded.email }, 
      { $set: { concerns } },
      { new: true } // 업데이트 후 변경된 데이터 반환
    );

    if (!user) {
      return res.status(404).json({ status: "error", message: "사용자를 찾을 수 없습니다." });
    }

    res.json({ status: "ok", message: "건강 고민 업데이트 완료" });
  } catch (error) {
    console.error("❌ 건강 고민 업데이트 오류:", error);
    res.status(500).json({ status: "error", message: "서버 오류 발생" });
  }
});








// ✅ 이미지 저장 폴더 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });









// ✅ 약품 이미지 업로드 엔드포인트 추가
app.post("/upload", upload.single("image"), async (req, res) => {
  console.log("📸 이미지 업로드 요청 도착!");
  console.log("✅ 업로드된 파일 정보:", req.file);
  if (!req.file) {
    console.error("❌ 파일이 업로드되지 않았음.");
    return res.status(400).json({ status: "error", message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const imagePath = path.join(__dirname, "uploads", req.file.filename);
    console.log(`📸 업로드된 이미지 경로: ${imagePath}`);


    // ✅ Python OCR 처리 실행
    const pythonProcess = spawn("python", ["test/ocr_test.py", imagePath]);
    console.log(`🛠 OCR 실행 시작: ${imagePath}`);



    let stdoutData = "";
    let stderrData = "";


    pythonProcess.stdout.on("data", (data) => {
      stdoutData += data.toString();
      console.log("OCR 실행 결과:", data.toString());
    });

    pythonProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
      console.error("OCR 실행 정보:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      console.log(`🛠 Python OCR 종료 코드: ${code}`);
      if (code === 0) {
        try {
          const jsonData = JSON.parse(stdoutData);
          res.json({ status: "ok", message: "OCR 처리 완료", medicine: jsonData });
        } catch (parseError) {
          console.error("❌ JSON 파싱 오류:", parseError);
          res.status(500).json({ status: "error", message: "OCR 결과 파싱 실패" });
        }
      } else {
        console.error("❌ Python OCR 스크립트 오류 발생:", stderrData);
        res.status(500).json({ status: "error", message: "OCR 처리 실패", details: stderrData });
      }
    });

  } catch (error) {
    console.error("❌ 서버 오류:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

// ✅ 서버에서 이미지 제공
app.use("/uploads", express.static(path.join(__dirname, "uploads")));









//프로필사진 upload post
app.post("/upload-profile", upload.single("image"), async (req, res) => {
  console.log("업로드된 파일:", req.file); // 추가: 파일이 제대로 수신됐는지 확인
  
  if (!req.file) {
    return res.status(400).json({ status: "error", message: "파일이 업로드되지 않았습니다." });
  }
  
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

      // ✅ 업로드된 이미지 경로를 MongoDB에 저장
      const fullUrl = `http://10.0.2.2:5001/uploads/${req.file.filename}`;
      user.profileImage = fullUrl;
      await user.save();

      res.json({ status: "ok", message: "프로필 사진 업데이트 완료", profileImage: user.profileImage });
  } catch (error) {
      console.error("❌ 프로필 업로드 오류:", error);
      res.status(500).json({ message: "서버 오류 발생" });
  }
});

// ✅ 서버에서 프로필 이미지 제공
app.use("/uploads", express.static(path.join(__dirname, "uploads")));









// ✅ 기본 프로필 이미지로 변경하는 API
app.post("/reset-profile", async (req, res) => {
  try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({ status: "error", message: "인증 토큰이 필요합니다." });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // ✅ 해당 사용자의 프로필 이미지를 기본값으로 변경 (MongoDB에서 profileImage 필드 삭제)
      const user = await User.findOneAndUpdate(
          { email: decoded.email },
          { $unset: { profileImage: "" } }, // ✅ `profileImage` 필드 삭제
          { new: true }
      );

      if (!user) {
          return res.status(404).json({ status: "error", message: "사용자를 찾을 수 없습니다." });
      }

      res.status(200).json({ status: "ok", message: "기본 프로필 이미지로 변경되었습니다." });
  } catch (error) {
      console.error("❌ 기본 프로필 이미지 변경 오류:", error);
      res.status(500).json({ status: "error", message: "서버 오류 발생" });
  }
});


// ✅ 마이페이지 - 비밀번호 변경 API
app.post("/api/change-password", async (req, res) => {
  try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({ status: "error", message: "인증 토큰이 필요합니다." });
      }

      // ✅ 토큰 검증
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const userEmail = decoded.email;

      const { currentPassword, newPassword } = req.body;

      // 1️⃣ 유저 조회
      const user = await User.findOne({ email: userEmail });
      if (!user) {
          return res.status(404).json({ status: "error", message: "사용자를 찾을 수 없습니다." });
      }

      // 2️⃣ 현재 비밀번호 검증
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
          return res.status(400).json({ status: "error", message: "현재 비밀번호가 올바르지 않습니다." });
      }

      // 3️⃣ 새 비밀번호 검증 (회원가입과 동일한 조건)
      if (!/^(?=.*\d)(?=.*[a-z])(?=.*[\W_]).{10,}$/.test(newPassword)) {
          return res.status(400).json({ status: "error", message: "비밀번호는 10자 이상이며, 소문자, 숫자, 특수문자를 포함해야 합니다." });
      }

      // 4️⃣ 새 비밀번호 암호화 후 저장
      const encryptedPassword = await bcrypt.hash(newPassword, 10);
      user.password = encryptedPassword;
      await user.save();

      // ✅ 비밀번호 변경 완료 후 기존 세션 종료 (클라이언트에서 로그아웃 요청 필요)
      res.status(200).json({ status: "ok", message: "비밀번호 변경 완료. 다시 로그인해주세요." });
  } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      res.status(500).json({ status: "error", message: "서버 오류 발생" });
  }
});



// ✅ 디비에 있는 모든 약품 약보관함으로 가져오기 (프론트엔드 요청 대응)
app.get("/medicines", async (req, res) => {
  try {
    const medicines = await Medicine.find(); // 모든 약 데이터를 가져옴
    res.json(medicines); // JSON 형식으로 응답
  } catch (error) {
    console.error("❌ 약품 데이터 불러오기 오류:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});




// ✅ 새 약품 추가 (프론트엔드에서 새 약 등록 시 사용)
app.post("/medicines", async (req, res) => {
  try {
    const newMedicine = new Medicine(req.body);
    await newMedicine.save();
    res.status(201).json({ message: "약품이 추가되었습니다." });
  } catch (error) {
    console.error("❌ 약품 추가 오류:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});








app.post("/medicines/:id/toggle", async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "약품을 찾을 수 없습니다." });
    }

    medicine.active = !medicine.active;
    await medicine.save();

    // ✅ 변경된 medicine 정보를 응답으로 반환
    res.status(200).json(medicine);
  } catch (error) {
    console.error("복용 상태 변경 오류:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});
























// ✅ 서버 시작
app.listen(5001, () => {
  console.log("Node.js server started on port 5001.");
});
