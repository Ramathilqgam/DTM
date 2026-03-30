import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center gap-6">
      <div className="text-center">
        {user?.avatar && (
          <img
            src={user.avatar}
            className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-indigo-500"
            alt="avatar"
          />
        )}
        <h1 className="text-3xl font-semibold">Welcome, {user?.name} 👋</h1>
        <p className="text-zinc-400 mt-2">
          {user?.email} · <span className="capitalize">{user?.role}</span>
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center max-w-sm w-full">
        <p className="text-zinc-400 text-sm">Sprint 2 — Task Management is coming here.</p>
      </div>

      <button
        onClick={handleLogout}
        className="text-sm text-zinc-500 hover:text-red-400 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
