import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';
import CreateTeamForm from './CreateTeamForm';
import CreateTeamTaskForm from './CreateTeamTaskForm';

const TeamTasks = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamTasks, setTeamTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamAnalytics, setTeamAnalytics] = useState(null);
  const [teamActivity, setTeamActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showCreateTeamForm, setShowCreateTeamForm] = useState(false);
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/team-tasks/teams');
      setTeams(response.data.teams || []);
      if (response.data.teams.length > 0) {
        setSelectedTeam(response.data.teams[0]);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamDetails = async (teamId) => {
    try {
      const response = await api.get(`/team-tasks/teams/${teamId}`);
      setTeamTasks(response.data.tasks || []);
      setTeamMembers(response.data.members || []);
      setTeamAnalytics(response.data.analytics);
      setSelectedTeam(response.data.team);
    } catch (error) {
      console.error('Error fetching team details:', error);
    }
  };

  const fetchTeamActivity = async (teamId) => {
    try {
      const response = await api.get(`/team-tasks/teams/${teamId}/activity`);
      setTeamActivity(response.data.activity || []);
    } catch (error) {
      console.error('Error fetching team activity:', error);
    }
  };

  const handleCreateTeam = async (teamData) => {
    try {
      console.log('Creating team with data:', teamData);
      const response = await api.post('/team-tasks/teams', teamData);
      console.log('Team creation response:', response.data);
      fetchTeams();
      setShowCreateTeamForm(false);
    } catch (error) {
      console.error('Error creating team:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
      alert(`Error creating team: ${errorMessage}`);
    }
  };

  const handleCreateTeamTask = async (taskData) => {
    if (!selectedTeam) {
      console.error('No team selected for task creation');
      alert('Please select a team first');
      return;
    }
    
    try {
      console.log('Creating team task with data:', taskData);
      console.log('Selected team:', selectedTeam);
      
      const response = await api.post(`/team-tasks/teams/${selectedTeam.id}/tasks`, taskData);
      console.log('Team task creation response:', response.data);
      
      fetchTeamDetails(selectedTeam.id);
      setShowCreateTaskForm(false);
    } catch (error) {
      console.error('Error creating team task:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
      alert(`Error creating team task: ${errorMessage}`);
    }
  };

  const handleUpdateTeamTask = async (taskId, taskData) => {
    if (!selectedTeam) return;
    
    try {
      await api.put(`/team-tasks/teams/${selectedTeam.id}/tasks/${taskId}`, taskData);
      fetchTeamDetails(selectedTeam.id);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating team task:', error);
      alert('Error updating team task');
    }
  };

  const handleAddComment = async (taskId, comment) => {
    if (!selectedTeam) return;
    
    try {
      await api.post(`/team-tasks/teams/${selectedTeam.id}/tasks/${taskId}/comments`, comment);
      fetchTeamDetails(selectedTeam.id);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleInviteMember = async (invitationData) => {
    if (!selectedTeam) return;
    
    try {
      await api.post(`/team-tasks/teams/${selectedTeam.id}/members`, invitationData);
      alert('Invitation sent successfully');
    } catch (error) {
      console.error('Error inviting member:', error);
      alert('Error inviting member');
    }
  };

  const getCollaborationTypeColor = (type) => {
    const colors = {
      individual: 'bg-blue-100 text-blue-800 border-blue-200',
      collaborative: 'bg-green-100 text-green-800 border-green-200',
      review_required: 'bg-orange-100 text-orange-800 border-orange-200',
      parallel: 'bg-purple-100 text-purple-800 border-purple-200',
      sequential: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[type] || colors.individual;
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-gray-500'
    };
    return colors[priority] || colors.medium;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
      {/* Enhanced Header */}
      <div className="p-8 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">Team Tasks & Collaboration</h2>
            <p className="text-zinc-300 text-sm">Work together with your team on shared tasks</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateTeamForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/50 flex items-center gap-2 border border-white/20 backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
              Create Team
            </button>
            {selectedTeam && (
              <button
                onClick={() => setShowCreateTaskForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:via-cyan-500 hover:to-teal-500 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/50 flex items-center gap-2 border border-white/20 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Create Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Team Selector */}
      {teams.length > 0 && (
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <label className="text-sm font-bold text-zinc-300 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Select Team:</label>
            <select
              value={selectedTeam?.id || ''}
              onChange={(e) => {
                const team = teams.find(t => t.id === e.target.value);
                setSelectedTeam(team);
                if (team) {
                  fetchTeamDetails(team.id);
                }
              }}
              className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white text-sm focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 transition-all duration-300 font-medium"
            >
              {teams.map(team => (
                <option key={team.id} value={team.id} className="bg-slate-800 text-white">
                  {team.name} ({team.user_role})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {!selectedTeam ? (
          <div className="text-center py-12">
            {teams.length === 0 ? (
              <>
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl transform hover:scale-110 transition-all duration-300">
                  <svg className="w-12 h-12 text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                </div>
                <p className="text-zinc-300 mb-6 text-lg">No teams yet. Create your first team to get started.</p>
                <button
                  onClick={() => setShowCreateTeamForm(true)}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/50 border border-white/20 backdrop-blur-sm"
                >
                  Create Your First Team
                </button>
              </>
            ) : (
              <p className="text-zinc-400">Select a team to view details</p>
            )}
          </div>
        ) : (
          <>
            {/* Enhanced Tabs */}
            <div className="border-b border-white/10 mb-8">
              <nav className="flex -mb-px space-x-2">
                {[
                  { id: 'tasks', label: 'Tasks', count: teamTasks.length, icon: 'clipboard' },
                  { id: 'members', label: 'Members', count: teamMembers.length, icon: 'users' },
                  { id: 'analytics', label: 'Analytics', count: null, icon: 'chart' },
                  { id: 'activity', label: 'Activity', count: teamActivity.length, icon: 'clock' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === 'activity') fetchTeamActivity(selectedTeam.id);
                    }}
                    className={`px-6 py-4 border-b-2 font-bold text-sm transition-all duration-300 transform hover:scale-105 rounded-t-2xl ${
                      activeTab === tab.id
                        ? 'border-indigo-400 text-indigo-300 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 backdrop-blur-sm border-opacity-60 shadow-lg'
                        : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {tab.icon === 'clipboard' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                      )}
                      {tab.icon === 'users' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                        </svg>
                      )}
                      {tab.icon === 'chart' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 3v18h18"/>
                        </svg>
                      )}
                      {tab.icon === 'clock' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                        </svg>
                      )}
                      {tab.label}
                      {tab.count !== null && (
                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white/20 text-zinc-300 backdrop-blur-sm border border-white/30">
                          {tab.count}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Enhanced Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-6">
                {teamTasks.map((task, index) => (
                  <div key={task.id} className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/20 overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
                    
                    {/* Priority Indicator */}
                    <div className={`absolute top-0 left-0 w-2 h-full rounded-l-3xl bg-gradient-to-b ${
                      task.priority === 'high' ? 'from-red-500 to-rose-500' : 
                      task.priority === 'medium' ? 'from-amber-500 to-orange-500' : 
                      'from-emerald-500 to-teal-500'
                    } shadow-lg`} />
                    
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border ${
                            task.collaboration_type === 'collaborative' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            task.collaboration_type === 'review_required' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                            task.collaboration_type === 'parallel' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                            task.collaboration_type === 'sequential' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                            'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          }`}>
                            {task.collaboration_type.replace('_', ' ').title()}
                          </span>
                          <h3 className="font-bold text-white text-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">
                            {task.title}
                          </h3>
                          <div className={`w-3 h-3 rounded-full ${
                            task.priority === 'high' ? 'bg-red-400 shadow-red-400/50' : 
                            task.priority === 'medium' ? 'bg-amber-400 shadow-amber-400/50' : 
                            'bg-emerald-400 shadow-emerald-400/50'
                          } shadow-lg animate-pulse`}></div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border ${
                            task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                            task.status === 'review' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                            task.status === 'cancelled' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                            'bg-zinc-500/20 text-zinc-300 border-zinc-500/30'
                          }`}>
                            {task.status.replace('_', ' ').title()}
                          </span>
                        </div>
                        <p className="text-zinc-300 text-sm mb-4 line-clamp-2 group-hover:text-zinc-200 transition-colors duration-300 leading-relaxed">
                          {task.description}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                            <div className="flex items-center gap-2 text-zinc-400 mb-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                              </svg>
                              <span className="text-xs font-medium">Assigned</span>
                            </div>
                            <div className="text-zinc-200 font-bold">{task.assigned_to.length} people</div>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                            <div className="flex items-center gap-2 text-zinc-400 mb-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                              </svg>
                              <span className="text-xs font-medium">Progress</span>
                            </div>
                            <div className="text-zinc-200 font-bold">{task.progress}%</div>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                            <div className="flex items-center gap-2 text-zinc-400 mb-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              <span className="text-xs font-medium">Duration</span>
                            </div>
                            <div className="text-zinc-200 font-bold">{task.estimated_duration || 'N/A'} min</div>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                            <div className="flex items-center gap-2 text-zinc-400 mb-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                              </svg>
                              <span className="text-xs font-medium">Category</span>
                            </div>
                            <div className="text-zinc-200 font-bold capitalize">{task.category}</div>
                          </div>
                        </div>

                        {task.due_date && (
                          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20 mb-4">
                            <div className="flex items-center gap-2 text-zinc-400">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                              <span className="text-sm font-medium">Due:</span>
                              <span className="text-zinc-200">{new Date(task.due_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        )}

                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {task.tags.map((tag, index) => (
                              <span key={index} className="px-3 py-1 bg-white/10 backdrop-blur-sm text-zinc-300 rounded-full text-xs border border-white/20 hover:bg-white/20 transition-colors duration-200">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Enhanced Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-zinc-400 mb-2 font-medium">
                            <span className="text-zinc-300">Progress</span>
                            <span className="text-indigo-400 font-bold">{task.progress}%</span>
                          </div>
                          <div className="w-full bg-white/10 backdrop-blur-sm rounded-full h-3 border border-white/20">
                            <div className="bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 h-3 rounded-full shadow-lg transform transition-all duration-500 hover:scale-105" style={{ width: `${task.progress}%` }}></div>
                          </div>
                        </div>

                        {/* Comments */}
                        {task.comments && task.comments.length > 0 && (
                          <div className="border-t border-white/10 pt-4">
                            <h4 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                              </svg>
                              Recent Comments
                            </h4>
                            <div className="space-y-2">
                              {task.comments.slice(-2).map((comment) => (
                                <div key={comment.id} className="text-sm bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                                  <span className="font-bold text-indigo-300">
                                    {comment.type === 'system' ? 'System' : 'User'}:
                                  </span>
                                  <span className="text-zinc-300 ml-2">{comment.content}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 hover:from-indigo-500/30 hover:to-blue-500/30 text-indigo-300 hover:text-indigo-200 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-indigo-500/30 shadow-lg flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => setEditingTask(task)}
                          className="px-4 py-2 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white hover:text-zinc-200 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/20 shadow-lg flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                          Edit
                        </button>
                      </div>
                    </div>

                    {/* Floating Decorative Elements */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse" />
                    <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-r from-cyan-400/20 to-teal-400/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }} />
                  </div>
                ))}

                {teamTasks.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl transform hover:scale-110 transition-all duration-300">
                      <svg className="w-12 h-12 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                      </svg>
                    </div>
                    <p className="text-zinc-300 mb-6 text-lg">No tasks in this team yet</p>
                    <button
                      onClick={() => setShowCreateTaskForm(true)}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:via-cyan-500 hover:to-teal-500 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/50 border border-white/20 backdrop-blur-sm"
                    >
                      Create First Task
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.user_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium capitalize">
                              {member.role}
                            </span>
                            <span className="text-xs text-gray-500">
                              Joined: {new Date(member.joined_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Last active</div>
                        <div className="text-sm text-gray-700">
                          {new Date(member.last_active).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => {
                      const email = prompt('Enter email to invite:');
                      if (email) {
                        handleInviteMember({
                          email: email,
                          role: 'member',
                          message: 'Join our team!'
                        });
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Invite Member
                  </button>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && teamAnalytics && (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{teamAnalytics.overview.total_tasks}</div>
                    <p className="text-sm text-blue-800">Total Tasks</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{teamAnalytics.overview.completed_tasks}</div>
                    <p className="text-sm text-green-800">Completed</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{teamAnalytics.overview.completion_rate}%</div>
                    <p className="text-sm text-yellow-800">Completion Rate</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{teamAnalytics.overview.tasks_created_this_week}</div>
                    <p className="text-sm text-purple-800">This Week</p>
                  </div>
                </div>

                {/* Member Performance */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Member Performance</h3>
                  <div className="space-y-3">
                    {teamAnalytics.member_performance.map((member) => (
                      <div key={member.user_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800">{member.name}</h4>
                            <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                              <div>
                                <span className="text-gray-500">Assigned:</span>
                                <span className="ml-2 font-medium">{member.tasks_assigned}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Completed:</span>
                                <span className="ml-2 font-medium">{member.tasks_completed}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Rate:</span>
                                <span className="ml-2 font-medium">{member.completion_rate}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Contribution Score</div>
                            <div className="text-lg font-bold text-blue-600">{member.contribution_score}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                {teamActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm">
                        {activity.type === 'task_created' ? 'add' : 
                         activity.type === 'comment_added' ? 'comment' : 'edit'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">{activity.user_name}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                  </div>
                ))}

                {teamActivity.length === 0 && (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">history</span>
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateTeamForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <CreateTeamForm
            onTeamCreated={handleCreateTeam}
            onClose={() => setShowCreateTeamForm(false)}
          />
        </div>
      )}

      {/* Create/Edit Task Modal */}
      {(showCreateTaskForm || editingTask) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <CreateTeamTaskForm
            initialData={editingTask}
            onTaskCreated={editingTask ? 
              (data) => handleUpdateTeamTask(editingTask.id, data) : 
              handleCreateTeamTask
            }
            teamMembers={teamMembers}
            onClose={() => {
              setShowCreateTaskForm(false);
              setEditingTask(null);
            }}
          />
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Task Details</h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                close
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800">{selectedTask.title}</h4>
                <p className="text-gray-600">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {selectedTask.status}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Priority:</span>
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                    {selectedTask.priority}
                  </span>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-800 mb-2">Comments</h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedTask.comments?.map((comment) => (
                    <div key={comment.id} className="text-sm bg-gray-50 p-2 rounded">
                      <span className="font-medium text-gray-700">
                        {comment.type === 'system' ? 'System' : 'User'}:
                      </span>
                      <span className="text-gray-600 ml-2">{comment.content}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      handleAddComment(selectedTask.id, { content: e.target.value });
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Team tasks help you collaborate effectively with your team members
          </p>
          <button
            onClick={() => selectedTeam && fetchTeamDetails(selectedTeam.id)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamTasks;
