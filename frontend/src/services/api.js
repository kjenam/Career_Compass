import axios from "axios";
const allowedOrigins = [
  "http://localhost:3000",
  "https://career-compass-3cg1.onrender.com/", // Replace with your actual frontend URL
];
const api = axios.create({
  baseURL: allowedOrigins,
  withCredentials: true, // ⬅️ crucial for cookies
});

export default api;
