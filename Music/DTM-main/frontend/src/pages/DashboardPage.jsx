import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axiosConfig";

function StatCard({ icon, label, value, color, percentage, trend }) {
  return (
    <div className={`relative group overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${color} border border-opacity-20 hover:border-opacity-50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/5 transition-opacity duration-300" />
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${color.replace('from-', 'bg-').split(' ')[0]}/30`}>
            {icon}
          </div>
          {percentage !== undefined && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${trend ? 'text-green-400 bg-green-950/40' : 'text-red-400 bg-red-950/40'}`}>
              {trend ? '↑' : '↓'} {percentage}%
            </span>
          )}
        </div>
        <p className="text-sm text-gray-300 mb-2">{label}</p>
        <p className="text-4xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function TaskProgressCard({ task, priority }) {
  const statusPercent = {
    pending: 33,
    in_progress: 66,
    completed: 100,
  }[task.status] || 0;

  const statusColor = {
    pending: "from-yellow-500 to-orange-500",
    in_progress: "from-blue-500 to-cyan-500",
    completed: "from-green-500 to-emerald-500",
  }[task.status] || "from-gray-500 to-zinc-500";

  const priorityColor = {
    high: "bg-red-950/40 border-red-700/50 text-red-300",
    medium: "bg-orange-950/40 border-orange-700/50 text-orange-300",
    low: "bg-blue-950/40 border-blue-700/50 text-blue-300",
  }[priority] || "bg-gray-950/40 border-gray-700/50 text-gray-300";

  return (
    <div className="group p-5 rounded-xl bg-gradient-to-br from-zinc-900/50 to-zinc-950 border border-zinc-800/50 hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors truncate pr-2 flex-1">{task.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap border ${priorityColor}`}>
          {priority || "Normal"}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-4 line-clamp-2">{task.description?.substring(0, 80) || "No description"}</p>

      <div className="flex items-center justify-between mb-3">
        <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium bg-gradient-to-r ${statusColor} bg-opacity-20 border border-opacity-30`}>
          {task.status.replace('_', ' ')}
        </span>
        <span className="text-xs text-gray-400">{statusPercent}%</span>
      </div>

      <div className="w-full bg-zinc-800/50 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${statusColor} transition-all duration-500`}
          style={{ width: `${statusPercent}%` }}
        />
      </div>
    </div>
  );
}

function ActivityBadge({ icon, label, count, color }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br ${color} border border-opacity-20 hover:border-opacity-50 transition-all hover:scale-105`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs text-gray-300 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-bold text-white">{count}</p>
      </div>
    </div>
  );
}

function NotificationCard({ type, message, time }) {
  const icons = {
    task: "🎯",
    complete: "✅",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 transition-all">
      <span className="text-lg">{icons[type] || icons.info}</span>
      <div className="flex-1">
        <p className="text-sm text-white">{message}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchStats();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/tasks");

      const tasks = response.data;
      const total = tasks.length;
      const completed = tasks.filter((t) => t.status === "completed").length;

      setStats({
        total: total,
        pending: tasks.filter((t) => t.status === "pending").length,
        in_progress: tasks.filter((t) => t.status === "in_progress").length,
        completed: completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      });

      setRecentTasks(tasks.slice(0, 9));
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setStats({
        total: 0,
        pending: 0,
        in_progress: 0,
        completed: 0,
        completionRate: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#16213e] text-white overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-[-30%] left-[-10%] w-80 h-80 bg-violet-600/20 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-[40%] left-[50%] w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl opacity-20 animate-bounce" />
        <div className="absolute top-[20%] left-[10%] w-60 h-60 bg-pink-500/10 rounded-full blur-3xl opacity-15" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-zinc-800/50 backdrop-blur-xl bg-black/20">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {user?.avatar ? (
                  <div className="relative">
                    <img src={user.avatar} className="w-14 h-14 rounded-xl border-2 border-gradient-to-r from-indigo-500 to-violet-500 object-cover" alt="avatar" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
                  </div>
                ) : (
                  <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">{getGreeting()}, {user?.name?.split(" ")[0]} 👋</h1>
                  <p className="text-sm text-gray-400">{user?.role.toUpperCase()} • {user?.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-red-500/50 hover:-translate-y-0.5"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-indigo-600/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Loading your dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Statistics Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    icon={<span className="text-2xl">📋</span>}
                    label="Total Tasks"
                    value={stats.total}
                    color="from-blue-600/40 to-blue-800/20"
                    percentage={12}
                    trend={true}
                  />
                  <StatCard
                    icon={<span className="text-2xl">⏳</span>}
                    label="Pending"
                    value={stats.pending}
                    color="from-yellow-600/40 to-yellow-800/20"
                  />
                  <StatCard
                    icon={<span className="text-2xl">🚀</span>}
                    label="In Progress"
                    value={stats.in_progress}
                    color="from-purple-600/40 to-purple-800/20"
                  />
                  <StatCard
                    icon={<span className="text-2xl">✅</span>}
                    label="Completed"
                    value={stats.completed}
                    color="from-green-600/40 to-green-800/20"
                    percentage={stats.completionRate}
                    trend={true}
                  />
                </div>
              )}

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Left Column - Performance */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Overall Progress */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-emerald-950/20 border border-emerald-700/30 hover:border-emerald-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">Overall Progress</h3>
                      <span className="text-3xl font-bold text-emerald-400">{stats?.completionRate}%</span>
                    </div>
                    <div className="w-full bg-emerald-950 rounded-full h-3 overflow-hidden mb-4">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                        style={{ width: `${stats?.completionRate || 0}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-300">{stats?.completed} of {stats?.total} tasks completed</p>
                  </div>

                  {/* Activity Stats */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold mb-4">📊 Today's Activity</h3>
                    <ActivityBadge
                      icon="⚡"
                      label="Active"
                      count={stats?.in_progress || 0}
                      color="from-blue-600/40 to-blue-800/20"
                    />
                    <ActivityBadge
                      icon="🎉"
                      label="Completed"
                      count={stats?.completed || 0}
                      color="from-green-600/40 to-green-800/20"
                    />
                    <ActivityBadge
                      icon="⏰"
                      label="Pending"
                      count={stats?.pending || 0}
                      color="from-orange-600/40 to-orange-800/20"
                    />
                  </div>
                </div>

                {/* Middle Column - Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Quick Actions */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-indigo-950/20 border border-indigo-700/30 hover:border-indigo-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20">
                    <h3 className="text-xl font-bold mb-4">⚡ Quick Actions</h3>
                    <p className="text-gray-300 mb-6">
                      {user?.role === "admin"
                        ? "🎯 Manage your team's tasks, track progress, and ensure project timelines are met."
                        : "📝 Stay updated with your tasks, update status, and collaborate with your team."}
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      <Link
                        to="/tasks"
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-xl font-semibold transition-all duration-300 text-center shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-0.5"
                      >
                        {user?.role === "admin" ? "✨ Create New Task" : "📋 View Tasks"}
                      </Link>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-900/30 to-cyan-950/20 border border-cyan-700/30">
                    <h3 className="text-lg font-bold mb-4">🔔 Notifications</h3>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      <NotificationCard
                        type="task"
                        message={`You have ${stats?.pending || 0} pending tasks`}
                        time="Just now"
                      />
                      <NotificationCard
                        type="complete"
                        message={`Great! You've completed ${stats?.completed || 0} tasks this week`}
                        time="2 hours ago"
                      />
                      <NotificationCard
                        type="info"
                        message={`${stats?.in_progress || 0} tasks in progress`}
                        time="4 hours ago"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Tasks Section */}
              <div className="rounded-2xl bg-gradient-to-br from-zinc-900/50 to-zinc-950 border border-zinc-800/50 p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <span>📌</span> Recent Tasks
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Keep track of your task progress</p>
                  </div>
                  <Link to="/tasks" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">
                    View all →
                  </Link>
                </div>

                {recentTasks.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-5xl mb-4">📝</p>
                    <p className="text-gray-400 mb-4 text-lg">No tasks yet. Time to get started!</p>
                    <Link to="/tasks" className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-xl font-semibold transition-all shadow-lg hover:shadow-indigo-500/50">
                      Create your first task →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {recentTasks.map((task, idx) => {
                      const priorities = ["high", "medium", "low"];
                      return (
                        <TaskProgressCard
                          key={task.id}
                          task={task}
                          priority={priorities[idx % 3]}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer Stats */}
              <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-700/30 text-center">
                <p className="text-sm text-gray-300">
                  ✨ You're doing great! Keep up with your tasks and maintain your productivity. Next target: 100% completion rate! 🎯
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
