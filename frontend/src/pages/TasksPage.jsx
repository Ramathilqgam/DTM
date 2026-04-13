import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "../hooks/useAuth";
import NewTaskForm from "../components/NewTaskForm";

// Advanced Icons
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// Statistics Icons
const TotalTasksIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const PendingIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InProgressIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const CompletedIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Animated Background Component
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden z-0">
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-emerald-600/20 via-teal-600/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      
      {/* Moving Particles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-bounce"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          />
        ))}
      </div>
      
      {/* Gradient Mesh */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-indigo-900/10 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
    </div>
  );
}

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);

  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/tasks/");

      setTasks(response.data || []);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900/50 to-purple-900/50 text-white p-6 relative">
      <AnimatedBackground />
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Advanced Header with Glassmorphism */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300 animate-pulse">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                    Tasks
                  </h1>
                  <p className="text-white/80 mt-2">
                    Logged in as <span className="text-white font-semibold">{user?.name}</span>{" "}
                    <span className="text-white/60">({user?.role})</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setEditTask(null); setShowForm(true); }}
                className="group px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-700/50 text-red-300 text-sm">
             {error}
          </div>
        )}

        {/* Advanced Animated Statistics Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: "Total", 
              value: tasks.length, 
              color: "from-white to-zinc-300", 
              bg: "from-indigo-600/20 to-purple-600/20",
              icon: <TotalTasksIcon />,
              progress: Math.min((tasks.length / 10) * 100, 100)
            },
            { 
              label: "Pending", 
              value: tasks.filter(t => t.status === "pending").length, 
              color: "from-yellow-400 to-orange-400", 
              bg: "from-yellow-600/20 to-orange-600/20",
              icon: <PendingIcon />,
              progress: tasks.length > 0 ? (tasks.filter(t => t.status === "pending").length / tasks.length) * 100 : 0
            },
            { 
              label: "In Progress", 
              value: tasks.filter(t => t.status === "in_progress").length, 
              color: "from-blue-400 to-cyan-400", 
              bg: "from-blue-600/20 to-cyan-600/20",
              icon: <InProgressIcon />,
              progress: tasks.length > 0 ? (tasks.filter(t => t.status === "in_progress").length / tasks.length) * 100 : 0
            },
            { 
              label: "Completed", 
              value: tasks.filter(t => t.status === "completed").length, 
              color: "from-green-400 to-emerald-400", 
              bg: "from-green-600/20 to-emerald-600/20",
              icon: <CompletedIcon />,
              progress: tasks.length > 0 ? (tasks.filter(t => t.status === "completed").length / tasks.length) * 100 : 0
            },
          ].map((s, index) => (
            <div 
              key={s.label} 
              className={`group relative p-6 bg-gradient-to-br ${s.bg} backdrop-blur-sm border border-white/10 rounded-2xl text-center shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icon */}
              <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300 text-white/80">
                {s.icon}
              </div>
              
              {/* Value */}
              <div className={`text-3xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent mb-2`}>
                {s.value}
              </div>
              
              {/* Label */}
              <div className="text-sm text-white/80 font-medium">{s.label}</div>
              
              {/* Progress Bar */}
              <div className="mt-4 w-full bg-white/10 rounded-full h-1 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-white/50 to-white/30 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${s.progress}%` }}
                />
              </div>
              
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
              <NewTaskForm
                initialData={editTask}
                onTaskCreated={() => { fetchTasks(); setShowForm(false); setEditTask(null); }}
                onClose={() => { setShowForm(false); setEditTask(null); }}
              />
            </div>
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && tasks.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            <div className="text-5xl mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-lg font-medium text-zinc-400">No tasks yet</p>
            <p className="text-sm mt-1">
              Click "Create Task" to add your first one.
            </p>
          </div>
        )}

        {/* Innovative Task Cards */}
        {!loading && tasks.length > 0 && (
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        {/* Status Icon */}
                        <div className={`p-3 rounded-xl ${
                          task.status === 'completed' 
                            ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30' 
                            : task.status === 'in_progress'
                            ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30'
                            : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30'
                        } mt-1`}>
                          {task.status === 'completed' ? (
                            <div className="text-green-400">
                              <CheckIcon />
                            </div>
                          ) : task.status === 'in_progress' ? (
                            <div className="text-blue-400 animate-pulse">
                              <ClockIcon />
                            </div>
                          ) : (
                            <div className="text-yellow-400">
                              <ClockIcon />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className={`font-bold text-xl mb-2 transition-colors duration-300 ${
                            task.status === 'completed' 
                              ? 'text-green-400 line-through' 
                              : 'text-white group-hover:text-indigo-300'
                          }`}>
                            {task.title}
                          </h3>
                          
                          {task.description && (
                            <p className="text-white/70 text-sm leading-relaxed mb-4 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          
                          {/* Advanced Tags */}
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className={`px-3 py-1.5 rounded-xl border font-medium text-sm backdrop-blur-sm ${
                              task.status === 'completed'
                                ? 'bg-green-500/20 border-green-400/30 text-green-300'
                                : task.status === 'in_progress'
                                ? 'bg-blue-500/20 border-blue-400/30 text-blue-300'
                                : 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300'
                            }`}>
                              {statusLabel[task.status] || task.status}
                            </span>
                            
                            <span className={`px-3 py-1.5 rounded-xl border font-medium text-sm backdrop-blur-sm ${
                              task.priority === 'high'
                                ? 'bg-red-500/20 border-red-400/30 text-red-300'
                                : task.priority === 'medium'
                                ? 'bg-orange-500/20 border-orange-400/30 text-orange-300'
                                : 'bg-blue-500/20 border-blue-400/30 text-blue-300'
                            }`}>
                              {task.priority}
                            </span>
                            
                            {task.due_date && (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white/80">
                                <ClockIcon />
                                <span>{new Date(task.due_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                            {task.assigned_to_name && (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white/80">
                                <UserIcon />
                                <span>{task.assigned_to_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Advanced Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => { setEditTask(task); setShowForm(true); }}
                        className="group/btn p-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 hover:text-white rounded-xl transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:scale-110"
                        title="Edit task"
                      >
                        <EditIcon />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="group/btn p-3 bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-400 hover:text-red-300 rounded-xl transition-all duration-300 hover:bg-red-500/30 hover:border-red-400/50 hover:scale-110"
                        title="Delete task"
                      >
                        <TrashIcon />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Hover Border Animation */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}