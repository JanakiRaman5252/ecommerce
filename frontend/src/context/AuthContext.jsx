import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import API, { API_URL } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 🔹 Login
  const login = async (email, password) => {
    try {
      const res = await API.post("login/", { email, password });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data || "Login failed" };
    }
  };

  // 🔹 Logout
  const logout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        await API.post("logout/", { refresh });
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
    localStorage.clear();
    setUser(null);
  };

  // 🔹 Auto-logout if token expired
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        }
      } catch {
        logout();
      }
    }
  }, []);

  // 🔹 Axios interceptor for auto token refresh
  useEffect(() => {
    const interceptor = API.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refresh = localStorage.getItem("refresh");
            const res = await API.post("refresh/", { refresh });
            localStorage.setItem("access", res.data.access);

            API.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;
            return API(originalRequest);
          } catch  {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      API.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🔹 Custom hook
export const useAuth = () => useContext(AuthContext);
