import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  // "None" is required for cross-origin cookie sending (Vercel → Render).
  // "Lax" is safe for same-domain local dev.
  sameSite: isProduction ? "None" : "Lax",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export const register = async (req, res) => {
  const {fullName, email, password} = req.body;

  const userExists = await User.findOne({email});

  if (userExists) return res.status(400).json({message: "User already exists"});

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({fullName, email, password: hashed});

  const token = generateToken(user._id);
  res
    .cookie("token", token, cookieOptions)
    .status(200)
    .json({message: "User registered successfully"});
};

export const login = async (req, res) => {
  const {email, password} = req.body;
  const user = await User.findOne({email});

  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({message: "Invalid email or password"});

  const token = generateToken(user._id);
  res
    .cookie("token", token, cookieOptions)
    .json({message: "Logged in successfully"});
};

export const verify = async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({message: "Not authenticated"});

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({message: "Token is invalid"});

    // You may fetch user from DB using decoded.id if needed
    res.status(200).json({user: decoded});
  });
};

export const logout = (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({message: "Logged out successfully"});
};
