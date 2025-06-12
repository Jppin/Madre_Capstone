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
        const result = JSON.parse(output);
        res.json({ status: "ok", message: "OCR 완료", medicine: result });
      } catch (e) {
        next(new AppError("JSON 파싱 실패", 500));
      }
    } else {
      next(new AppError("OCR 실패", 500, errorOutput));
    }
  });
};
