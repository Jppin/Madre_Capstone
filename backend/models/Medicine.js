import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  prescriptionDate: { type: String },
  registerDate: { type: String },
  pharmacy: { type: String },
  dosageGuide: { type: String },
  warning: { type: String },
  appearance: { type: String },
  sideEffects: { type: String },
  active: { type: Boolean, default: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "UserInfo" },
});

const Medicine = mongoose.model("Medicine", MedicineSchema);
export default Medicine;
