//server.js(백엔드)

require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const Medicine = require("./models/Medicine");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once("open", () => console.log("✅ MongoDB 연결 완료!"));

// 🟢 Multer 설정 (이미지 업로드용)
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// 🟢 Clova OCR API 호출
async function clovaOCR(imagePath) {
  const imageFile = fs.createReadStream(imagePath);
  const formData = new FormData();
  formData.append("image", imageFile);

  const headers = {
    "X-OCR-SECRET": process.env.CLOVA_OCR_SECRET_KEY,
    ...formData.getHeaders(),
  };

  try {
    const response = await axios.post(process.env.CLOVA_OCR_API_URL, formData, { headers });
    return response.data.images[0].fields.map(field => field.inferText).join(" ");
  } catch (error) {
    console.error("Clova OCR 오류:", error);
    return null;
  }
}

// 🟢 OCR → GPT → MongoDB 저장 API
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const ocrText = await clovaOCR(imagePath);
    if (!ocrText) return res.status(500).json({ error: "OCR 실패" });

    // OpenAI GPT 요청
    const response = await axios.post(process.env.OPENAI_API_URL, {
      model: "gpt-4",
      messages: [
        { role: "system", content: "OCR 데이터를 JSON 형식으로 변환하는 전문가입니다." },
        { role: "user", content: `OCR 결과: ${ocrText}` }
      ],
      max_tokens: 700,
      temperature: 0.0
    }, {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
    });

    const gptResult = JSON.parse(response.data.choices[0].message.content.trim());

    // MongoDB 저장
    const newMedicine = new Medicine({
      name: gptResult.medications[0].medication_name,
      prescriptionDate: gptResult.prescription_info.dispensing_date,
      registerDate: new Date().toISOString().split("T")[0],
      pharmacy: gptResult.prescription_info.medical_institution,
      dosageGuide: gptResult.medications[0].dosage,
      warning: gptResult.medications[0].precautions,
      sideEffects: gptResult.medications[0].general_info,
    });

    await newMedicine.save();
    res.json({ message: "약품 저장 완료!", medicine: newMedicine });

  } catch (error) {
    console.error("에러 발생:", error);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 서버 실행
app.listen(port, () => console.log(`🚀 서버 실행 중: http://localhost:${port}`));
