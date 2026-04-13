import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axiosConfig";

export default function AuthCallbackPage() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");
    const error = params.get("error");

    if (error || !access) {
      navigate("/login?error=google_failed");
      return;
    }

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    api.get("/auth/me")
      .then(({ data }) => {
        login(data.user, access, refresh);
        navigate("/dashboard");
      })
      .catch(() => navigate("/login?error=google_failed"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
