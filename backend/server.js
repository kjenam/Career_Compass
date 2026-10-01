import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// CORS settings — allow both local dev and deployed frontend
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean); // remove undefined entries

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true, // Allow sending cookies
  })
);

// Middlewares
app.use(express.json()); // JSON body parser
app.use(cookieParser()); // Parse cookies

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api", profileRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("🌍 CareerCompass API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
