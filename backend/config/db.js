import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    // Do not exit — let the server stay alive so Render can detect the port.
    // Requests that need DB will fail gracefully via mongoose errors.
  }
};

export default connectDB;
