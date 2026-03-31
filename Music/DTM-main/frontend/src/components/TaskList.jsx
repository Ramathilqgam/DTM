import { useState } from "react";
import axios from "axios";

const statusColors = {
  pending: "bg-yellow-900/30 text-yellow-200 border-yellow-700",
  in_progress: "bg-blue-900/30 text-blue-200 border-blue-700",
  completed: "bg-green-900/30 text-green-200 border-green-700",
};

const priorityColors = {
  low: "text-blue-400",
  medium: "text-yellow-400",
  high: "text-red-400",
};

export default function TaskList({ tasks, isAdmin, onTaskClick, onDeleteTask, onTaskUpdated }) {
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingStatus(taskId);
    try {
      const token = localStorage.getItem("access_token");
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onTaskUpdated();
    } catch (err) {
      console.error("Failed to update task status:", err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDeleteTask();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">No tasks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 cursor-pointer" onClick={() => onTaskClick(task)}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                <span className={`text-xs font-bold uppercase ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
              {task.description && (
                <p className="text-sm text-zinc-400 mb-3">{task.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                {task.due_date && (
                  <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                disabled={updatingStatus === task.id}
                className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
                  statusColors[task.status]
                } bg-transparent disabled:opacity-50 cursor-pointer`}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              {isAdmin && (
                <button
                  onClick={() => handleDelete(task.id)}
                  className="px-3 py-1 text-red-400 hover:bg-red-900/20 rounded transition-colors text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
