import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';
import NewTaskForm from '../components/NewTaskForm';

// Animated Icons
const TeamIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const TaskIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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

export default function TeamTasksPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamTasks, setTeamTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    if (user) {
      fetchTeams();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get('/team-tasks/teams');
      setTeams(response.data.teams || []);
      if (response.data.teams.length > 0) {
        setSelectedTeam(response.data.teams[0]);
        fetchTeamDetails(response.data.teams[0].id);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err.response?.data?.error || 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamDetails = async (teamId) => {
    try {
      const response = await api.get(`/team-tasks/teams/${teamId}`);
      setTeamTasks(response.data.tasks || []);
      setTeamMembers(response.data.members || []);
      setSelectedTeam(response.data.team);
    } catch (err) {
      console.error('Error fetching team details:', err);
      setError('Failed to fetch team details');
    }
  };

  const handleCreateTeam = async (teamData) => {
    try {
      const response = await api.post('/team-tasks/teams', teamData);
      fetchTeams();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team');
      throw err;
    }
  };

  const handleCreateTask = async (taskData) => {
    if (!selectedTeam) {
      setError('Please select a team first');
      return;
    }
    
    try {
      const response = await api.post(`/team-tasks/teams/${selectedTeam.id}/tasks`, taskData);
      fetchTeamDetails(selectedTeam.id);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
      throw err;
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this team task?")) return;
    if (!selectedTeam) return;
    
    try {
      await api.delete(`/team-tasks/teams/${selectedTeam.id}/tasks/${taskId}`);
      setTeamTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const statusColor = {
    pending: 'text-zinc-400 bg-zinc-800/50 border-zinc-700/40',
    in_progress: 'text-blue-400 bg-blue-900/30 border-blue-700/40',
    completed: 'text-green-400 bg-green-900/30 border-green-700/40',
  };

  const statusLabel = {
    pending: ' Pending',
    in_progress: ' In Progress',
    completed: ' Completed',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900/50 to-purple-900/50 text-white p-3 relative">
      <AnimatedBackground />
      <div className="max-w-6xl mx-auto relative z-10">

        {/* Compact Header */}
        <div className="mb-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300">
                  <TeamIcon />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Team Tasks
                  </h1>
                  <p className="text-white/70 text-xs">
                    {user?.name} ({user?.role})
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setEditTask(null); setShowForm(true); }}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <TaskIcon />
                <span className="text-sm">Create Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-3 p-3 rounded-lg bg-red-950/40 border border-red-700/50 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Team Selector */}
        {teams.length > 0 && (
          <div className="mb-6">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-white/90">Select Team:</label>
                <select
                  value={selectedTeam?.id || ''}
                  onChange={(e) => {
                    const team = teams.find(t => t.id === e.target.value);
                    setSelectedTeam(team);
                    if (team) {
                      fetchTeamDetails(team.id);
                    }
                  }}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-all duration-300"
                >
                  {teams.map(team => (
                    <option key={team.id} value={team.id} className="bg-slate-800">
                      {team.name} ({team.user_role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Compact Statistics Cards */}
        {selectedTeam && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="group relative p-3 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-lg text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="text-xl font-bold text-white mb-1">{teamTasks.length}</div>
              <div className="text-xs text-white/60">Tasks</div>
            </div>
            <div className="group relative p-3 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-white/10 rounded-lg text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="text-xl font-bold text-blue-300 mb-1">{teamMembers.length}</div>
              <div className="text-xs text-white/60">Members</div>
            </div>
            <div className="group relative p-3 bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-white/10 rounded-lg text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="text-xl font-bold text-green-300 mb-1">{teamTasks.filter(t => t.status === 'completed').length}</div>
              <div className="text-xs text-white/60">Completed</div>
            </div>
            <div className="group relative p-3 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border border-white/10 rounded-lg text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="text-xl font-bold text-yellow-300 mb-1">{teamTasks.filter(t => t.status === 'in_progress').length}</div>
              <div className="text-xs text-white/60">In Progress</div>
            </div>
          </div>
        )}

        {/* Task Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-4 w-full max-w-2xl shadow-2xl">
              <NewTaskForm
                initialData={editTask}
                onTaskCreated={() => { handleCreateTask(editTask || {}); setShowForm(false); setEditTask(null); }}
                onClose={() => { setShowForm(false); setEditTask(null); }}
              />
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && teams.length === 0 && (
          <div className="text-center py-10 text-zinc-500">
            <div className="text-3xl mb-2">
              <TeamIcon />
            </div>
            <p className="text-sm font-medium text-zinc-400">No teams yet</p>
            <p className="text-xs mt-1">
              Create your first team to get started.
            </p>
          </div>
        )}

        {/* No team selected */}
        {!loading && !error && teams.length > 0 && !selectedTeam && (
          <div className="text-center py-10 text-zinc-500">
            <p className="text-sm font-medium text-zinc-400">Select a team to view tasks</p>
          </div>
        )}

        {/* Compact Task Cards */}
        {!loading && !error && selectedTeam && teamTasks.length > 0 && (
          <div className="space-y-2">
            {teamTasks.map((task, index) => (
              <div
                key={task.id}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300 overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Status Icon */}
                    <div className={`p-1.5 rounded-lg ${
                      task.status === 'completed' 
                        ? 'bg-green-500/20 border border-green-400/30' 
                        : task.status === 'in_progress'
                        ? 'bg-blue-500/20 border border-blue-400/30'
                        : 'bg-yellow-500/20 border border-yellow-400/30'
                    }`}>
                      {task.status === 'completed' ? (
                        <div className="text-green-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="text-yellow-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm mb-1 transition-colors duration-300 truncate ${
                        task.status === 'completed' 
                          ? 'text-green-400 line-through' 
                          : 'text-white group-hover:text-indigo-300'
                      }`}>
                        {task.title}
                      </h3>
                      
                      {task.description && (
                        <p className="text-white/60 text-xs leading-relaxed line-clamp-1">
                          {task.description}
                        </p>
                      )}
                      
                      {/* Compact Tags */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded border text-xs backdrop-blur-sm ${
                          task.status === 'completed'
                            ? 'bg-green-500/20 border-green-400/30 text-green-300'
                            : task.status === 'in_progress'
                            ? 'bg-blue-500/20 border-blue-400/30 text-blue-300'
                            : 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300'
                        }`}>
                          {statusLabel[task.status] || task.status}
                        </span>
                        
                        {task.priority && (
                          <span className={`px-2 py-0.5 rounded border text-xs backdrop-blur-sm ${
                            task.priority === 'high'
                              ? 'bg-red-500/20 border-red-400/30 text-red-300'
                              : task.priority === 'medium'
                              ? 'bg-orange-500/20 border-orange-400/30 text-orange-300'
                              : 'bg-blue-500/20 border-blue-400/30 text-blue-300'
                          }`}>
                            {task.priority}
                          </span>
                        )}
                        
                        {task.due_date && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 backdrop-blur-sm border border-white/20 text-xs text-white/70">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Compact Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditTask(task); setShowForm(true); }}
                      className="p-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 hover:text-white rounded-lg transition-all duration-300 hover:bg-white/20 hover:scale-110"
                      title="Edit task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-400 hover:text-red-300 rounded-lg transition-all duration-300 hover:bg-red-500/30 hover:scale-110"
                      title="Delete task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No tasks in team */}
        {!loading && !error && selectedTeam && teamTasks.length === 0 && (
          <div className="text-center py-10 text-zinc-500">
            <div className="text-3xl mb-2">
              <TaskIcon />
            </div>
            <p className="text-sm font-medium text-zinc-400">No tasks in this team</p>
            <p className="text-xs mt-1">
              Click "Create Task" to add your first team task.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
