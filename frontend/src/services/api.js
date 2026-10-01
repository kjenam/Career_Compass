import axios from "axios";
// const allowedOrigins = [
//   "http://localhost:8000",
//   "https://career-compass-3cg1.onrender.com/", // Replace with your actual frontend URL
// ];
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
  withCredentials: true, // ⬅️ crucial for cookies
});

export default api;
