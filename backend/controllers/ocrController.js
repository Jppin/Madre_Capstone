// /controllers/ocrController.js
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { AppError } from "../middleware/errorHandler.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runOcrScript = async (req, res, next) => {
  const imagePath = path.join(__dirname, "../uploads", req.file.filename);
  const pythonProcess = spawn("python", ["test/ocr_test.py", imagePath]);

  let output = "", errorOutput = "";
  pythonProcess.stdout.setEncoding("utf8");
  pythonProcess.stderr.setEncoding("utf8");

  pythonProcess.stderr.on("data", data => {
    errorOutput += data.toString();
    console.error("Python stderr:", data.toString());  // 🔹 콘솔에도 출력됨
  });

  pythonProcess.stdout.on("data", data => {
    output += data.toString();
    console.log("Python stdout:", data.toString()); // 🔹 콘솔에 보여줌
  });


  pythonProcess.on("close", (code) => {
  if (code === 0) {
    try {
      const lines = output.trim().split('\n');
      const jsonLine = lines.reverse().find(line => {
        try {
          JSON.parse(line);
          return true;
        } catch {
          return false;
        }
      });

      if (!jsonLine) throw new Error("유효한 JSON 응답 없음");

      const result = JSON.parse(jsonLine);
      res.json({ status: "ok", message: "OCR 완료", medicine: result });
    } catch (e) {
      console.error("❌ JSON 파싱 실패:", e.message);
      console.log("📦 전체 출력 내용:", output);
      next(new AppError("JSON 파싱 실패", 500));
    }
  } else {
    next(new AppError("OCR 실패", 500, errorOutput));
  }
});

};
