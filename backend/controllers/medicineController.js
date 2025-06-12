import Medicine from "../models/Medicine.js";
import Drug from "../models/Drug.js";
import stringSimilarity from "string-similarity";
import mongoose from "mongoose";
import { AppError } from "../middleware/errorHandler.js";

// 모든 약품 가져오기
export const getAllMedicines = async (req, res, next) => {
  const userId = req.user._id;
  const medicines = await Medicine.find({ user_id: userId });
  res.json(medicines);
};

// 약품 추가
export const addMedicine = async (req, res, next) => {
  const userId = req.user._id;
  let medicinesData = Array.isArray(req.body) ? req.body : [req.body];

  for (const med of medicinesData) {
    if (!med.name) {
      throw new AppError("약품 이름이 필요합니다.", 400);
    }
  }

  const addedMedicines = [];
  const defaultValue = "(알 수 없음)";

  for (const med of medicinesData) {
    const {
      name,
      prescriptionDate,
      registerDate,
      pharmacy,
      dosageGuide,
      warning,
      sideEffects,
      appearance,
    } = med;

    let matchedDrug = null;
    try {
      const candidates = await Drug.find({
        ITEM_NAME: { $regex: name, $options: "i" },
      }).limit(10);
      if (candidates.length > 0) {
        const names = candidates.map(d => d.ITEM_NAME);
        const match = stringSimilarity.findBestMatch(name, names);
        if (match.bestMatch.rating >= 0.5) {
          matchedDrug = candidates.find(d => d.ITEM_NAME === match.bestMatch.target);
        }
      }
    } catch (err) {
      console.error("🔍 Drug match error:", err);
    }

    const finalName = matchedDrug ? matchedDrug.ITEM_NAME : name;
    const finalWarning = matchedDrug ? matchedDrug.TYPE_NAME : warning || defaultValue;
    const finalAppearance = matchedDrug ? matchedDrug.CHART : appearance || defaultValue;

    const duplicate = await Medicine.findOne({ name: finalName, user_id: userId });
    if (duplicate) {
      throw new AppError("같은 이름의 약품이 이미 등록됨", 400);
    }

    const newMedicine = new Medicine({
      name: finalName,
      prescriptionDate: prescriptionDate || defaultValue,
      registerDate: registerDate || new Date().toISOString().split("T")[0],
      pharmacy: pharmacy || defaultValue,
      dosageGuide: dosageGuide || defaultValue,
      warning: finalWarning,
      sideEffects: sideEffects || defaultValue,
      appearance: finalAppearance,
      user_id: userId,
    });

    await newMedicine.save();
    addedMedicines.push(newMedicine);
  }

  res.status(201).json(
    addedMedicines.length === 1
      ? { message: "약품 추가됨", medicine: addedMedicines[0] }
      : { message: "약품 추가됨", medicines: addedMedicines }
  );
};

// 복용 상태 토글
export const toggleMedicine = async (req, res, next) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) throw new AppError("약품을 찾을 수 없습니다.", 404);

  medicine.active = !medicine.active;
  await medicine.save();
  res.json(medicine);
};

// 약품 삭제
export const deleteMedicine = async (req, res, next) => {
  const medicine = await Medicine.findByIdAndDelete(req.params.id);
  if (!medicine) throw new AppError("약품을 찾을 수 없습니다.", 404);
  res.json({ message: "약품 삭제됨" });
};

// 약품 수정
export const updateMedicine = async (req, res, next) => {
  const userId = req.user._id;
  const medicine = await Medicine.findOne({ _id: req.params.id, user_id: userId });
  if (!medicine) throw new AppError("약품을 찾을 수 없습니다.", 404);

  Object.assign(medicine, req.body); // 업데이트 필드 자동 병합
  await medicine.save();
  res.json({ message: "약품 정보 업데이트됨", medicine });
};
