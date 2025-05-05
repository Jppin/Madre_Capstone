import mongoose from "mongoose";

const DrugSchema = new mongoose.Schema({
  ITEM_SEQ: { type: String, required: true, unique: true, index: true },
  ITEM_NAME: { type: String, required: true, index: true },
  ENTP_NAME: { type: String, required: true },
  ETC_OTC_CODE: String,
  CLASS_NO: String,
  MATERIAL_NAME: String,
  TYPE_NAME: String,
  STORAGE_METHOD: String,
  VALID_TERM: String,
  CHART: String,
  UPDATE_DATE: { type: Date, default: Date.now, index: -1 },
});

DrugSchema.index({ ITEM_SEQ: 1, ITEM_NAME: 1 });

const Drug = mongoose.model("Drug", DrugSchema);
export default Drug;
