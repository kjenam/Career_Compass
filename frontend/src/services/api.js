import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true, // ⬅️ crucial for cookies
});

export default api;
