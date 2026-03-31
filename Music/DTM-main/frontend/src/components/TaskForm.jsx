import { useState, useEffect } from "react";
import axios from "axios";

export default function TaskForm({ onTaskCreated, initialData = null, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "medium",
    due_date: "",
    status: "pending",
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        assigned_to: initialData.assigned_to,
        priority: initialData.priority,
        due_date: initialData.due_date ? initialData.due_date.split("T")[0] : "",
        status: initialData.status,
      });
    }

    // Fetch users for assignment
    fetchUsers();
  }, [initialData]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/auth/users");
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      if (initialData) {
        // Update existing task
        const { assigned_to, ...updateData } = formData;
        await axios.put(`/api/tasks/${initialData.id}`, updateData, { headers });
      } else {
        // Create new task
        await axios.post("/api/tasks", formData, { headers });
      }

      setFormData({
        title: "",
        description: "",
        assigned_to: "",
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

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full">
      <h2 className="text-xl font-semibold mb-4 text-white">
        {initialData ? "Edit Task" : "Create New Task"}
      </h2>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded p-3 mb-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Task title"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Task description"
            rows="3"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {!initialData && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Assign To
            </label>
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              required={!initialData}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {initialData && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Due Date
          </label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-600 text-white font-medium py-2 rounded transition-colors"
          >
            {loading ? "Saving..." : initialData ? "Update Task" : "Create Task"}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
