import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await axios.get("/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
      setError("");
    } catch (err) {
      setError("Failed to load tasks");
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = filterStatus === "all"
    ? tasks
    : tasks.filter((task) => task.status === filterStatus);

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Task Management</h1>
            <p className="text-zinc-400 mt-2">
              {user?.role === "admin" ? "Create and manage team tasks" : "Your assigned tasks"}
            </p>
          </div>

          {user?.role === "admin" && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors"
            >
              {showForm ? "Cancel" : "Create Task"}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6 text-red-200">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, color: "bg-blue-900/20 border-blue-700" },
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

        {/* Task Form */}
        {showForm && user?.role === "admin" && (
          <div className="mb-8">
            <TaskForm
              onTaskCreated={() => {
                fetchTasks();
                setShowForm(false);
              }}
              onClose={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          {["all", "pending", "in_progress", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Task List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-400">Loading tasks...</p>
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            isAdmin={user?.role === "admin"}
            onTaskClick={(task) => console.log("Task clicked:", task)}
            onDeleteTask={fetchTasks}
            onTaskUpdated={fetchTasks}
          />
        )}
      </div>
    </div>
  );
}
