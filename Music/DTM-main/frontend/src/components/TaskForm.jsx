import { useState, useEffect } from "react";
import api from "../api/axiosConfig";

export default function TaskForm({ onTaskCreated, initialData = null, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    status: "pending",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        priority: initialData.priority,
        due_date: initialData.due_date ? initialData.due_date.split("T")[0] : "",
        status: initialData.status,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (initialData) {
        await api.put(`/tasks/${initialData.id}`, formData);
      } else {
        await api.post("/tasks", formData);
      }

      setFormData({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
        status: "pending",
      });

      onTaskCreated();
      onClose && onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  const priorityEmojis = { low: "🟢", medium: "🟡", high: "🔴" };
  const statusEmojis = { pending: "⏳", in_progress: "🚀", completed: "✅" };

  return (
    <div className="w-full max-w-2xl">
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-700/50 text-red-200">
          <p className="font-semibold">⚠️ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            📝 Task Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter task title"
            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:bg-zinc-800 transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            📋 Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add task details..."
            rows="4"
            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:bg-zinc-800 transition-all resize-none"
          />
        </div>

        {/* Priority & Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              {priorityEmojis[formData.priority]} Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:bg-zinc-800 transition-all"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>

          {initialData && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                {statusEmojis[formData.status]} Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:bg-zinc-800 transition-all"
              >
                <option value="pending">⏳ Pending</option>
                <option value="in_progress">🚀 In Progress</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          )}
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            📅 Due Date
          </label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:bg-zinc-800 transition-all"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              initialData ? "💾 Update Task" : "✨ Create Task"
            )}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-zinc-800/50 hover:bg-zinc-700 border border-zinc-700/50 text-white font-semibold rounded-xl transition-all duration-300"
            >
              ✕ Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}