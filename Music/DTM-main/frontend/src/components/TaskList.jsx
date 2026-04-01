import { useState } from "react";
import api from "../api/axiosConfig";

const statusColors = {
  pending: "bg-yellow-950/40 border-yellow-700/50 text-yellow-200 from-yellow-500 to-orange-500",
  in_progress: "bg-blue-950/40 border-blue-700/50 text-blue-200 from-blue-500 to-cyan-500",
  completed: "bg-green-950/40 border-green-700/50 text-green-200 from-green-500 to-emerald-500",
};

const priorityColors = {
  low: { bg: "bg-blue-950/40", border: "border-blue-700/50", text: "text-blue-300", emoji: "🟢" },
  medium: { bg: "bg-orange-950/40", border: "border-orange-700/50", text: "text-orange-300", emoji: "🟡" },
  high: { bg: "bg-red-950/40", border: "border-red-700/50", text: "text-red-300", emoji: "🔴" },
};

const statusEmojis = {
  pending: "⏳",
  in_progress: "🚀",
  completed: "✅",
};

export default function TaskList({ tasks, isAdmin, onTaskClick, onDeleteTask, onTaskUpdated }) {
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingStatus(taskId);
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      onTaskUpdated();
    } catch (err) {
      console.error("Failed to update task status:", err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("🗑️ Are you sure you want to delete this task? This action cannot be undone.")) return;

    setDeletingId(taskId);
    try {
      await api.delete(`/tasks/${taskId}`);
      onDeleteTask();
    } catch (err) {
      console.error("Failed to delete task:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-16 px-8">
        <p className="text-5xl mb-4">📭</p>
        <p className="text-gray-400 text-lg">No tasks found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-800/50">
      {tasks.map((task, idx) => {
        const priorityConfig = priorityColors[task.priority] || priorityColors.medium;
        const statusColor = statusColors[task.status] || statusColors.pending;

        return (
          <div
            key={task.id}
            className="p-6 hover:bg-zinc-900/30 transition-all duration-300 hover:border-l-4 hover:border-indigo-500 group"
          >
            <div className="flex items-start justify-between gap-6">
              {/* Task Content */}
              <div className="flex-1 cursor-pointer" onClick={() => onTaskClick(task)}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg">{statusEmojis[task.status]}</span>
                  <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {task.title}
                  </h3>
                  <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${priorityConfig.text} ${priorityConfig.bg} border ${priorityConfig.border}`}>
                    {priorityConfig.emoji} {task.priority}
                  </span>
                </div>

                {task.description && (
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                )}

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  {task.due_date && (
                    <span className="flex items-center gap-1">
                      📅 {new Date(task.due_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {task.assigned_to && (
                    <span className="flex items-center gap-1">
                      👤 {task.assigned_to}
                    </span>
                  )}
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Status Dropdown */}
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  disabled={updatingStatus === task.id}
                  className={`px-4 py-2 rounded-lg border font-semibold text-sm transition-all ${statusColor} bg-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:opacity-80`}
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="in_progress">🚀 In Progress</option>
                  <option value="completed">✅ Completed</option>
                </select>

                {/* Delete Button - Admin Only */}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(task.id)}
                    disabled={deletingId === task.id}
                    className="px-4 py-2 text-red-400 hover:bg-red-950/30 hover:text-red-300 border border-red-700/30 hover:border-red-600/50 rounded-lg transition-all duration-300 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === task.id ? "⏳ Deleting..." : "🗑️ Delete"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
