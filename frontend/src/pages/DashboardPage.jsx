import { useEffect, useState, Fragment } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axiosConfig";
import FloatingAIAssistant from "../components/FloatingAIAssistant";
import FloatingVoiceCommand from "../components/FloatingVoiceCommand";
import EnhancedProgressBar from "../components/EnhancedProgressBar";
import AdminPanel from "../components/AdminPanel";
import TaskSearchFilter from "../components/TaskSearchFilter";
import Gamification from "../components/Gamification";


function MiniChart({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((value, idx) => (
        <div
          key={idx}
          className={`flex-1 rounded-t-sm ${color}`}
          style={{ height: `${(value / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

function PerformanceRing({ percentage, size = 120 }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-zinc-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-emerald-500 transition-all duration-700"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">{percentage}%</span>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, percentage, trend }) {
  return (
    <div className={`relative group overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${color} border border-white/10 hover:border-white/25 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/5 transition-opacity duration-300" />
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-white/10">
            {icon}
          </div>
          {percentage !== undefined && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${trend ? "text-green-400 bg-green-950/40" : "text-red-400 bg-red-950/40"}`}>
              {trend ? "↑" : "↓"} {percentage}%
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
  const statusPercent = { pending: 33, in_progress: 66, completed: 100 }[task.status] || 0;

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
        <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors truncate pr-2 flex-1">
          {task.title}
        </h3>
        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap border ${priorityColor}`}>
          {priority || "Normal"}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-4 line-clamp-2">
        {task.description?.substring(0, 80) || "No description"}
      </p>
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium bg-gradient-to-r ${statusColor} bg-opacity-20 border border-white/10`}>
          {task.status.replace("_", " ")}
        </span>
        <span className="text-xs text-gray-400">{statusPercent}%</span>
      </div>
      <EnhancedProgressBar percentage={statusPercent} size="small" showLabel={false} />
    </div>
  );
}

function NotificationCard({ type, message, time }) {
  const icons = { task: "🎯", complete: "✅", warning: "⚠️", info: "ℹ️" };
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
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchStats();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/tasks/");
      const tasks = response.data;

      const total = tasks.length;
      const completed = tasks.filter((t) => t.status === "completed").length;
      const pending = tasks.filter((t) => t.status === "pending").length;
      const inProgress = tasks.filter((t) => t.status === "in_progress").length;
      const highPriority = tasks.filter((t) => t.priority === "high").length;
      const mediumPriority = tasks.filter((t) => t.priority === "medium").length;
      const lowPriority = tasks.filter((t) => t.priority === "low").length;

      const today = new Date();
      const overdue = tasks.filter((t) => {
        if (!t.due_date) return false;
        return new Date(t.due_date) < today && t.status !== "completed";
      }).length;

      const weeklyActivity = [12, 19, 8, 15, 22, 18, 25];
      const monthlyTrend = [65, 72, 68, 81, 79, 85, 88, 92];

      setStats({
        total,
        pending,
        in_progress: inProgress,
        completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        highPriority,
        mediumPriority,
        lowPriority,
        overdue,
        weeklyActivity,
        monthlyTrend,
        productivity: total > 0 ? Math.round((completed / total) * 100) : 0,
      });

      setRecentTasks(tasks.slice(0, 9));
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setStats({
        total: 0, pending: 0, in_progress: 0, completed: 0,
        completionRate: 0, highPriority: 0, mediumPriority: 0, lowPriority: 0,
        overdue: 0, weeklyActivity: [0,0,0,0,0,0,0],
        monthlyTrend: [0,0,0,0,0,0,0,0], productivity: 0,
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
    <Fragment>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#16213e] text-white overflow-hidden">

        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl opacity-30 animate-pulse" />
          <div className="absolute bottom-[-30%] left-[-10%] w-80 h-80 bg-violet-600/20 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="absolute top-[40%] left-[50%] w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl opacity-20" />
        </div>

        <div className="relative z-10">

          {/* Header */}
          <div className="border-b border-zinc-800/50 backdrop-blur-xl bg-black/20">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {user?.avatar ? (
                    <div className="relative">
                      <img
                        src={user.avatar}
                        className="w-14 h-14 rounded-xl border-2 border-indigo-500 object-cover"
                        alt="avatar"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
                    </div>
                  ) : (
                    <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl font-bold">
                      {(user?.name?.charAt(0) || "?").toUpperCase()}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold">
                      {getGreeting()}, {user?.name?.split(" ")[0]} 👋
                    </h1>
                    <p className="text-sm text-gray-400">
                      {(user?.role || "").toUpperCase()} • {user?.email}
                    </p>
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
                {/* Stat Cards */}
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

                {/* Layout: Sidebar + Main */}
                <div className="flex gap-6">

                  {/* Left Sidebar — Quick Actions */}
                  <div className="w-72 flex-shrink-0">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-900/30 to-cyan-950/20 border border-cyan-700/30 hover:border-cyan-600/50 transition-all duration-300 sticky top-6">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">⚡</span>
                        <div>
                          <h3 className="text-xl font-bold">Quick Actions</h3>
                          <p className="text-sm text-gray-400">
                            {user?.role === "admin" ? "Manage your team" : "Access your tools"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Link to="/tasks"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 hover:-translate-y-0.5 group">
                          <span className="text-lg">📝</span>
                          <div className="flex-1">
                            <p className="font-semibold">{user?.role === "admin" ? "Create New Task" : "View Tasks"}</p>
                            <p className="text-xs text-cyan-200 opacity-0 group-hover:opacity-100 transition-opacity">Manage your tasks</p>
                          </div>
                        </Link>

                        {user?.role === "admin" && (
                          <Link to="/tasks?filter=pending"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/50 hover:-translate-y-0.5 group">
                            <span className="text-lg">⏰</span>
                            <div className="flex-1">
                              <p className="font-semibold">Review Pending</p>
                              <p className="text-xs text-orange-200 opacity-0 group-hover:opacity-100 transition-opacity">Check pending items</p>
                            </div>
                          </Link>
                        )}

                        <Link to="/team-tasks"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-0.5 group">
                          <span className="text-lg">👥</span>
                          <div className="flex-1">
                            <p className="font-semibold">Team Tasks</p>
                            <p className="text-xs text-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity">Collaborate</p>
                          </div>
                        </Link>

                        <Link to="/calendar-view"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 hover:-translate-y-0.5 group">
                          <span className="text-lg">📅</span>
                          <div className="flex-1">
                            <p className="font-semibold">Calendar View</p>
                            <p className="text-xs text-cyan-200 opacity-0 group-hover:opacity-100 transition-opacity">Schedule view</p>
                          </div>
                        </Link>

                        

                        <Link to="/smart-reminders"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/50 hover:-translate-y-0.5 group">
                          <span className="text-lg">🔔</span>
                          <div className="flex-1">
                            <p className="font-semibold">Smart Reminders</p>
                            <p className="text-xs text-orange-200 opacity-0 group-hover:opacity-100 transition-opacity">Set reminders</p>
                          </div>
                        </Link>

                        
                        

                        <Link to="/skill-development"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-green-500/50 hover:-translate-y-0.5 group">
                          <span className="text-lg">🎯</span>
                          <div className="flex-1">
                            <p className="font-semibold">Skill Development</p>
                            <p className="text-xs text-green-200 opacity-0 group-hover:opacity-100 transition-opacity">Improve skills</p>
                          </div>
                        </Link>

                        <Link to="/smart-automation"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/50 hover:-translate-y-0.5 group">
                          <span className="text-lg">⚙️</span>
                          <div className="flex-1">
                            <p className="font-semibold">Smart Automation</p>
                            <p className="text-xs text-orange-200 opacity-0 group-hover:opacity-100 transition-opacity">Automate workflows</p>
                          </div>
                        </Link>

                        <Link to="/drag-drop"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 hover:-translate-y-0.5 group">
                          <span className="text-lg">🎯</span>
                          <div className="flex-1">
                            <p className="font-semibold">Drag & Drop</p>
                            <p className="text-xs text-purple-200 opacity-0 group-hover:opacity-100 transition-opacity">Interactive demo</p>
                          </div>
                        </Link>

                      </div>
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                      {/* Left Column */}
                      <div className="lg:col-span-1 space-y-6">
                        {/* Overall Progress */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-emerald-950/20 border border-emerald-700/30 hover:border-emerald-600/50 transition-all duration-300">
                          <div className="flex flex-col items-center">
                            <h3 className="text-xl font-bold mb-4">Overall Progress</h3>
                            <PerformanceRing percentage={stats?.completionRate || 0} />
                            <p className="text-sm text-gray-300 mt-4">
                              {stats?.completed} of {stats?.total} tasks completed
                            </p>
                          </div>
                        </div>

                        {/* Priority Distribution */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 to-purple-950/20 border border-purple-700/30">
                          <h3 className="text-lg font-bold mb-4">🎯 Priority Distribution</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-red-400">High Priority</span>
                              <span className="font-bold">{stats?.highPriority || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-orange-400">Medium Priority</span>
                              <span className="font-bold">{stats?.mediumPriority || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-blue-400">Low Priority</span>
                              <span className="font-bold">{stats?.lowPriority || 0}</span>
                            </div>
                          </div>
                        </div>

                        {/* Weekly Activity */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/30 to-blue-950/20 border border-blue-700/30">
                          <h3 className="text-lg font-bold mb-4">📊 Weekly Activity</h3>
                          <MiniChart data={stats?.weeklyActivity || [0,0,0,0,0,0,0]} color="bg-blue-500" />
                          <div className="flex justify-between mt-2">
                            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => (
                              <span key={day} className="text-xs text-gray-400">{day}</span>
                            ))}
                          </div>
                        </div>

                        {/* Smart Notifications */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-900/30 to-violet-950/20 border border-violet-700/30">
                          <h3 className="text-lg font-bold mb-4">🔔 Smart Notifications</h3>
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {stats?.overdue > 0 && (
                              <NotificationCard
                                type="warning"
                                message={`⚠️ ${stats.overdue} tasks are overdue and need immediate attention`}
                                time="Urgent"
                              />
                            )}
                            <NotificationCard
                              type="task"
                              message={`You have ${stats?.pending || 0} pending tasks to review`}
                              time="Just now"
                            />
                            {stats?.completed > 0 ? (
                              <NotificationCard
                                type="complete"
                                message={`🎉 Great! You've completed ${stats.completed} task${stats.completed > 1 ? "s" : ""} this month`}
                                time="This week"
                              />
                            ) : (
                              <NotificationCard
                                type="info"
                                message="🚀 Start by completing your first task to boost productivity!"
                                time="Get started"
                              />
                            )}
                            {stats?.highPriority > 0 && (
                              <NotificationCard
                                type="info"
                                message={`🔥 ${stats.highPriority} high priority tasks require your focus`}
                                time="Today"
                              />
                            )}
                            <NotificationCard
                              type="info"
                              message={`📊 Your productivity score is ${stats?.productivity || 0}% this month`}
                              time="Analytics updated"
                            />
                          </div>
                        </div>

                        {/* Overdue Alert */}
                        {stats?.overdue > 0 && (
                          <div className="p-4 rounded-xl bg-gradient-to-br from-red-900/30 to-red-950/20 border border-red-700/30">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">⚠️</span>
                              <div>
                                <p className="text-sm font-semibold text-red-400">{stats.overdue} Overdue</p>
                                <p className="text-xs text-gray-400">Tasks need attention</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Columns */}
                      <div className="lg:col-span-2 space-y-6">
                        {/* Productivity Score */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-indigo-950/20 border border-indigo-700/30 hover:border-indigo-600/50 transition-all duration-300">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">📈 Productivity Score</h3>
                            <div className="text-right">
                              <span className="text-3xl font-bold text-indigo-400">{stats?.productivity || 0}%</span>
                              <p className="text-xs text-gray-400">This month</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-3 rounded-lg bg-indigo-950/30">
                              <p className="text-2xl font-bold text-white">{stats?.completed || 0}</p>
                              <p className="text-xs text-gray-400">Completed</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-indigo-950/30">
                              <p className="text-2xl font-bold text-white">{stats?.in_progress || 0}</p>
                              <p className="text-xs text-gray-400">In Progress</p>
                            </div>
                          </div>
                          <MiniChart data={stats?.monthlyTrend || [0,0,0,0,0,0,0,0]} color="bg-indigo-500" />
                          <div className="flex justify-between mt-2">
                            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"].map(month => (
                              <span key={month} className="text-xs text-gray-400">{month}</span>
                            ))}
                          </div>
                        </div>

                        {/* Task Search and Filter */}
                        <TaskSearchFilter tasks={recentTasks} onFilteredTasks={setFilteredTasks} />

                        {/* Admin Panel */}
                        {user?.role === "admin" && <AdminPanel />}

                        

                        {/* Gamification */}
                        <Gamification user={user} tasks={recentTasks} />

                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Tasks */}
                <div className="mt-8 rounded-2xl bg-gradient-to-br from-zinc-900/50 to-zinc-950 border border-zinc-800/50 p-8 backdrop-blur-xl">
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
                      <Link
                        to="/tasks"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-xl font-semibold transition-all shadow-lg hover:shadow-indigo-500/50"
                      >
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
                            priority={task.priority || priorities[idx % 3]}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

          {/* Floating AI Assistant */}
          <FloatingAIAssistant />
          {/* Floating Voice Command */}
          <FloatingVoiceCommand />
        </div>
      </div>
      </div>
    </Fragment>
  );
}
