import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "../hooks/useAuth";
import TaskForm from "../components/TaskForm";

// Filter and Sort Components
function FilterBadge({ label, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
        active
          ? `${color} border-opacity-60` 
          : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    filterAndSortTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortBy, sortOrder]);

  const filterAndSortTasks = () => {
    let filtered = [...tasks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === "created_at" || sortBy === "due_date") {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTasks(filtered);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/tasks/");

      setTasks(response.data || []);
      setFilteredTasks(response.data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete task");
    }
  };

  const priorityColor = {
    low: "text-green-400 bg-green-900/30 border-green-700/40",
    medium: "text-yellow-400 bg-yellow-900/30 border-yellow-700/40",
    high: "text-red-400 bg-red-900/30 border-red-700/40",
  };

  const statusColor = {
    pending: "text-zinc-400 bg-zinc-800/50 border-zinc-700/40",
    in_progress: "text-blue-400 bg-blue-900/30 border-blue-700/40",
    completed: "text-green-400 bg-green-900/30 border-green-700/40",
  };

  const statusLabel = {
    pending: " Pending",
    in_progress: " In Progress",
    completed: " Completed",
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header with Search and Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Tasks</h1>
              <p className="text-zinc-400 mt-1 text-sm">
                Logged in as <span className="text-white font-medium">{user?.name}</span>{" "}
                <span className="text-zinc-500">({user?.role})</span>
              </p>
            </div>
            <button
              onClick={() => { setEditTask(null); setShowForm(true); }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-indigo-500/30"
            >
              + Create Task
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder=" Search tasks by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Status:</span>
              <div className="flex gap-2">
                <FilterBadge
                  label="All"
                  active={statusFilter === "all"}
                  onClick={() => setStatusFilter("all")}
                  color="bg-zinc-700 text-white border-zinc-600"
                />
                <FilterBadge
                  label="Pending"
                  active={statusFilter === "pending"}
                  onClick={() => setStatusFilter("pending")}
                  color="bg-yellow-900/40 text-yellow-400 border-yellow-700/50"
                />
                <FilterBadge
                  label="In Progress"
                  active={statusFilter === "in_progress"}
                  onClick={() => setStatusFilter("in_progress")}
                  color="bg-blue-900/40 text-blue-400 border-blue-700/50"
                />
                <FilterBadge
                  label="Completed"
                  active={statusFilter === "completed"}
                  onClick={() => setStatusFilter("completed")}
                  color="bg-green-900/40 text-green-400 border-green-700/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Priority:</span>
              <div className="flex gap-2">
                <FilterBadge
                  label="All"
                  active={priorityFilter === "all"}
                  onClick={() => setPriorityFilter("all")}
                  color="bg-zinc-700 text-white border-zinc-600"
                />
                <FilterBadge
                  label="High"
                  active={priorityFilter === "high"}
                  onClick={() => setPriorityFilter("high")}
                  color="bg-red-900/40 text-red-400 border-red-700/50"
                />
                <FilterBadge
                  label="Medium"
                  active={priorityFilter === "medium"}
                  onClick={() => setPriorityFilter("medium")}
                  color="bg-orange-900/40 text-orange-400 border-orange-700/50"
                />
                <FilterBadge
                  label="Low"
                  active={priorityFilter === "low"}
                  onClick={() => setPriorityFilter("low")}
                  color="bg-blue-900/40 text-blue-400 border-blue-700/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-zinc-400">Sort:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  setSortBy(sort);
                  setSortOrder(order);
                }}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="due_date-asc">Due Date (Earliest)</option>
                <option value="due_date-desc">Due Date (Latest)</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-700/50 text-red-300 text-sm">
             {error}
          </div>
        )}

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: filteredTasks.length, color: "text-white" },
            { label: "Pending", value: filteredTasks.filter(t => t.status === "pending").length, color: "text-zinc-400" },
            { label: "In Progress", value: filteredTasks.filter(t => t.status === "in_progress").length, color: "text-blue-400" },
            { label: "Completed", value: filteredTasks.filter(t => t.status === "completed").length, color: "text-green-400" },
          ].map((s) => (
            <div key={s.label} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Task Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editTask ? " Edit Task" : " Create New Task"}
                </h2>
                <button
                  onClick={() => { setShowForm(false); setEditTask(null); }}
                  className="text-zinc-400 hover:text-white text-xl transition-colors"
                >
                  
                </button>
              </div>
              <TaskForm
                initialData={editTask}
                onTaskCreated={() => { fetchTasks(); setShowForm(false); setEditTask(null); }}
                onClose={() => { setShowForm(false); setEditTask(null); }}
              />
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredTasks.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            <div className="text-5xl mb-4">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all" ? "" : ""}
            </div>
            <p className="text-lg font-medium text-zinc-400">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all" 
                ? "No tasks match your filters" 
                : "No tasks yet"}
            </p>
            <p className="text-sm mt-1">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : 'Click "Create Task" to add your first one.'}
            </p>
            {(searchTerm || statusFilter !== "all" || priorityFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                }}
                className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Task list */}
        {!loading && filteredTasks.length > 0 && (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-base truncate">{task.title}</h3>
                    {task.description && (
                      <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${statusColor[task.status] || statusColor.pending}`}>
                        {statusLabel[task.status] || task.status}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${priorityColor[task.priority] || priorityColor.medium}`}>
                        {task.priority === "high" ? "" : task.priority === "low" ? "" : ""} {task.priority}
                      </span>
                      {task.due_date && (
                        <span className="text-xs text-zinc-500">
                           {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      {task.assigned_to_name && (
                        <span className="text-xs text-zinc-500">
                           {task.assigned_to_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setEditTask(task); setShowForm(true); }}
                      className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-all"
                    >
                       Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="px-3 py-1.5 text-xs bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 text-red-400 hover:text-red-300 rounded-lg transition-all"
                    >
                       Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
