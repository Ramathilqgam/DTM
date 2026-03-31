import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get("/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const tasks = response.data;
      setStats({
        total: tasks.length,
        pending: tasks.filter((t) => t.status === "pending").length,
        in_progress: tasks.filter((t) => t.status === "in_progress").length,
        completed: tasks.filter((t) => t.status === "completed").length,
      });

      // Get 5 most recent tasks
      setRecentTasks(tasks.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold">Welcome, {user?.name} 👋</h1>
            <p className="text-zinc-400 mt-2">
              {user?.email} · <span className="capitalize">{user?.role}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {user?.avatar && (
              <img
                src={user.avatar}
                className="w-12 h-12 rounded-full border-2 border-indigo-500"
                alt="avatar"
              />
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-red-400 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-400">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Tasks", value: stats.total, color: "bg-blue-900/20 border-blue-700" },
                  { label: "Pending", value: stats.pending, color: "bg-yellow-900/20 border-yellow-700" },
                  { label: "In Progress", value: stats.in_progress, color: "bg-purple-900/20 border-purple-700" },
                  { label: "Completed", value: stats.completed, color: "bg-green-900/20 border-green-700" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`border rounded-lg p-4 ${stat.color}`}
                  >
                    <p className="text-sm text-zinc-400 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* CTA and Recent Tasks */}
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
                <p className="text-zinc-400 mb-6">
                  {user?.role === "admin"
                    ? "Create tasks and assign them to your team members."
                    : "View and manage your assigned tasks."}
                </p>
                <Link
                  to="/tasks"
                  className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors"
                >
                  Go to Tasks
                </Link>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-4">Recent Tasks</h2>
                {recentTasks.length === 0 ? (
                  <p className="text-zinc-400 text-sm">No tasks yet</p>
                ) : (
                  <ul className="space-y-2">
                    {recentTasks.map((task) => (
                      <li key={task.id} className="text-sm text-zinc-300">
                        <div className="flex items-center justify-between">
                          <span className="truncate">{task.title}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            task.status === "completed"
                              ? "bg-green-900/30 text-green-200"
                              : task.status === "in_progress"
                              ? "bg-blue-900/30 text-blue-200"
                              : "bg-yellow-900/30 text-yellow-200"
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
