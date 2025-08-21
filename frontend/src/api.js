import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const API_URL = import.meta.env.VITE_API_URL;

export const API = axios.create({
  baseURL: `${API_URL}/api/`,
});

// 🔹 Request Interceptor → attach valid access token
API.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("access");

    if (token) {
      const decoded = jwtDecode(token);
      const expiry_date = decoded.exp;
      const current_time = Math.floor(Date.now() / 1000);

      // If token expired → try refresh
      if (expiry_date <= current_time) {
        try {
          const refresh = localStorage.getItem("refresh");
          if (refresh) {
            const res = await axios.post(`${API_URL}/api/token/refresh/`, {
              refresh,
            });

            token = res.data.access;
            localStorage.setItem("access", token);
          }
        } catch (err) {
          console.error("Refresh token failed:", err);
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login"; // force logout
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
