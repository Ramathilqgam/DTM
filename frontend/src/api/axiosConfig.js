import axios from "axios";

const api = axios.create({
  // Prefer relative base URL so Vite dev proxy can handle requests
  // and avoid browser CORS/network issues.
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token"); // ✅ MUST match login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const isAuthRoute =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/me") ||
        url.includes("/auth/logout") ||
        url.includes("/auth/google") ||
        url.includes("/auth/google/callback");

      localStorage.removeItem("access_token");
      if (!isAuthRoute) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;