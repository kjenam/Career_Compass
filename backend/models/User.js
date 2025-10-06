import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: String,
  email: {type: String, unique: true,
    required: true,
  trim: true
  },
  password: String,
});

export default mongoose.model("User", userSchema);
