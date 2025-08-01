import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
  company: String,
  role: String,
  status: String,
  notes: String,
  dateApplied: Date
});

export default mongoose.model("Application", applicationSchema);
