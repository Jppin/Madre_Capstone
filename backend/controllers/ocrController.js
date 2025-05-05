// /controllers/ocrController.js
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runOcrScript = async (req, res) => {
  const imagePath = path.join(__dirname, "../uploads", req.file.filename);
  const pythonProcess = spawn("python", ["test/ocr_test.py", imagePath]);

  let output = "", errorOutput = "";
  pythonProcess.stdout.setEncoding("utf8");
  pythonProcess.stderr.setEncoding("utf8");

  pythonProcess.stdout.on("data", data => output += data.toString());
  pythonProcess.stderr.on("data", data => errorOutput += data.toString());

  pythonProcess.on("close", (code) => {
    if (code === 0) {
      try {
        const result = JSON.parse(output);
        res.json({ status: "ok", message: "OCR 완료", medicine: result });
      } catch (e) {
        res.status(500).json({ status: "error", message: "JSON 파싱 실패" });
      }
    } else {
      res.status(500).json({ status: "error", message: "OCR 실패", details: errorOutput });
    }
  });
};
