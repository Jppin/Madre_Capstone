// /middleware/multerConfig.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = (prefix = "") =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueName = `${prefix}${Date.now()}_${file.originalname}`;
      cb(null, uniqueName);
    },
  });

export const ocrUpload = multer({ storage: storage("ocr_") });
export const profileUpload = multer({ storage: storage("profile_") });
