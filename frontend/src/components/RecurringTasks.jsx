import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

const RecurringTasks = () => {
  const { user } = useAuth();
  const [recurringTasks, setRecurringTasks] = useState([]);
  const [upcomingInstances, setUpcomingInstances] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [calendarView, setCalendarView] = useState(false);

  useEffect(() => {
    fetchRecurringTasksData();
  }, []);

  const fetchRecurringTasksData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/recurring-tasks/recurring-tasks');
      setRecurringTasks(response.data.recurring_tasks || []);
      setUpcomingInstances(response.data.upcoming_instances || []);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching recurring tasks data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/recurring-tasks/recurring-tasks/templates');
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleCreateRecurringTask = async (taskData) => {
    try {
      await api.post('/recurring-tasks/recurring-tasks', taskData);
      fetchRecurringTasksData();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating recurring task:', error);
      alert('Error creating recurring task');
    }
  };

  const handleUpdateRecurringTask = async (taskId, taskData) => {
    try {
      await api.put(`/recurring-tasks/recurring-tasks/${taskId}`, taskData);
      fetchRecurringTasksData();
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating recurring task:', error);
      alert('Error updating recurring task');
    }
  };

  const handleDeleteRecurringTask = async (taskId) => {
    if (confirm('Are you sure you want to delete this recurring task? This will also delete all future instances.')) {
      try {
        await api.delete(`/recurring-tasks/recurring-tasks/${taskId}`);
        fetchRecurringTasksData();
      } catch (error) {
        console.error('Error deleting recurring task:', error);
        alert('Error deleting recurring task');
      }
    }
  };

  const handleToggleTask = async (taskId, enabled) => {
    try {
      await api.put(`/recurring-tasks/recurring-tasks/${taskId}`, { enabled });
      fetchRecurringTasksData();
    } catch (error) {
      console.error('Error toggling recurring task:', error);
    }
  };

  const handleSkipNext = async (taskId) => {
    try {
      await api.post(`/recurring-tasks/recurring-tasks/${taskId}/skip-next`);
      fetchRecurringTasksData();
    } catch (error) {
      console.error('Error skipping next occurrence:', error);
    }
  };

  const handleCompleteInstance = async (taskId, instanceId) => {
    try {
      await api.post(`/recurring-tasks/recurring-tasks/${taskId}/complete`, { instance_id: instanceId });
      fetchRecurringTasksData();
    } catch (error) {
      console.error('Error completing instance:', error);
    }
  };

  const handleGenerateAll = async () => {
    try {
      const response = await api.post('/recurring-tasks/recurring-tasks/generate-all');
      alert(`Generated ${response.data.count} new instances`);
      fetchRecurringTasksData();
    } catch (error) {
      console.error('Error generating instances:', error);
    }
  };

  const getPatternColor = (pattern) => {
    const colors = {
      daily: 'bg-blue-100 text-blue-800 border-blue-200',
      weekly: 'bg-green-100 text-green-800 border-green-200',
      bi_weekly: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      monthly: 'bg-orange-100 text-orange-800 border-orange-200',
      quarterly: 'bg-red-100 text-red-800 border-red-200',
      yearly: 'bg-purple-100 text-purple-800 border-purple-200',
      custom: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[pattern] || colors.daily;
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
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Recurring Tasks</h2>
            <p className="text-sm text-gray-600">Automate your recurring tasks and stay organized</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateAll}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Generate All
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Recurring Task
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {[
            { id: 'tasks', label: 'Recurring Tasks', count: recurringTasks.length },
            { id: 'upcoming', label: 'Upcoming', count: upcomingInstances.length },
            { id: 'templates', label: 'Templates', count: templates.length },
            { id: 'stats', label: 'Statistics', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'templates') fetchTemplates();
              }}
              className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {recurringTasks.map((task) => (
              <div
                key={task.id}
                className={`border rounded-lg p-4 transition-all ${
                  task.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPatternColor(task.recurrence_pattern)}`}>
                        {task.recurrence_pattern.replace('_', ' ').title()}
                      </span>
                      <h3 className="font-semibold text-gray-800">{task.title}</h3>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Next:</span>
                        <div>{new Date(task.next_occurrence).toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="font-medium">Occurrences:</span>
                        <div>{task.occurrence_count}</div>
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span>
                        <div>{task.estimated_duration || 'N/A'} min</div>
                      </div>
                      <div>
                        <span className="font-medium">Category:</span>
                        <div className="capitalize">{task.category}</div>
                      </div>
                    </div>
                    {task.tags && task.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {task.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleTask(task.id, !task.enabled)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        task.enabled
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {task.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => handleSkipNext(task.id)}
                      disabled={!task.enabled}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded text-sm font-medium hover:bg-orange-200 transition-colors disabled:opacity-50"
                    >
                      Skip Next
                    </button>
                    <button
                      onClick={() => setEditingTask(task)}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRecurringTask(task.id)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {recurringTasks.length === 0 && (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">repeat</span>
                <p className="text-gray-500 mb-4">No recurring tasks set up yet</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Your First Recurring Task
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingInstances.map((instance) => (
              <div key={instance.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{instance.title}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Upcoming
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Scheduled: {new Date(instance.scheduled_date).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Generated: {new Date(instance.generated_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCompleteInstance(instance.recurring_task_id, instance.id)}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium hover:bg-green-200 transition-colors"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {upcomingInstances.length === 0 && (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">event_available</span>
                <p className="text-gray-500">No upcoming instances</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{template.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPatternColor(template.recurrence_pattern)}`}>
                        {template.recurrence_pattern.replace('_', ' ').title()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Priority: {template.priority}</span>
                      <span>Duration: {template.estimated_duration} min</span>
                      <span>Category: {template.category}</span>
                    </div>
                    {template.tags && template.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {template.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const taskData = {
                        title: template.name,
                        description: template.description,
                        recurrence_pattern: template.recurrence_pattern,
                        week_days: template.week_days,
                        day_of_month: template.day_of_month,
                        priority: template.priority,
                        category: template.category,
                        estimated_duration: template.estimated_duration,
                        tags: template.tags,
                        start_date: new Date().toISOString().split('T')[0],
                        enabled: true
                      };
                      handleCreateRecurringTask(taskData);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}

            {templates.length === 0 && (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">dashboard_customize</span>
                <p className="text-gray-500">No templates available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total_recurring_tasks}</div>
                <p className="text-sm text-blue-800">Total Recurring Tasks</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.active_tasks}</div>
                <p className="text-sm text-green-800">Active Tasks</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.total_instances_generated}</div>
                <p className="text-sm text-orange-800">Instances Generated</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.next_7_days}</div>
                <p className="text-sm text-purple-800">Next 7 Days</p>
              </div>
            </div>

            {/* Pattern Distribution */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribution by Pattern</h3>
              <div className="space-y-2">
                {Object.entries(stats.by_pattern).map(([pattern, count]) => (
                  <div key={pattern} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPatternColor(pattern)}`}>
                        {pattern.replace('_', ' ').title()}
                      </span>
                      <span className="font-medium text-gray-800 capitalize">{pattern.replace('_', ' ')}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-600">{count}</div>
                      <div className="text-sm text-gray-500">
                        {stats.total_recurring_tasks > 0 ? 
                          `${Math.round((count / stats.total_recurring_tasks) * 100)}%` : '0%'
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Distribution */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribution by Priority</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(stats.by_priority).map(([priority, count]) => (
                  <div key={priority} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(priority)} mx-auto mb-2`}></div>
                    <div className="text-lg font-bold text-gray-600">{count}</div>
                    <p className="text-sm text-gray-500 capitalize">{priority}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Recurring Task Modal */}
      {(showCreateForm || editingTask) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {editingTask ? 'Edit Recurring Task' : 'Create Recurring Task'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingTask(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                close
              </button>
            </div>

            <RecurringTaskForm
              task={editingTask}
              onSubmit={editingTask ? 
                (data) => handleUpdateRecurringTask(editingTask.id, data) : 
                handleCreateRecurringTask
              }
              onCancel={() => {
                setShowCreateForm(false);
                setEditingTask(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Recurring tasks help you automate repetitive work and stay consistent
          </p>
          <button
            onClick={fetchRecurringTasksData}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

// Recurring Task Form Component
const RecurringTaskForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    recurrence_pattern: task?.recurrence_pattern || 'daily',
    start_date: task?.start_date || new Date().toISOString().split('T')[0],
    end_date: task?.end_date || '',
    max_occurrences: task?.max_occurrences || '',
    week_days: task?.week_days || [],
    day_of_month: task?.day_of_month || 1,
    custom_interval: task?.custom_interval || 1,
    priority: task?.priority || 'medium',
    category: task?.category || 'general',
    estimated_duration: task?.estimated_duration || 30,
    tags: task?.tags || [],
    enabled: task?.enabled ?? true
  });

  const recurrencePatterns = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi_weekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom' }
  ];

  const weekDays = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleWeekDayToggle = (day) => {
    setFormData({
      ...formData,
      week_days: formData.week_days.includes(day)
        ? formData.week_days.filter(d => d !== day)
        : [...formData.week_days, day]
    });
  };

  const handleTagAdd = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };

  const handleTagRemove = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence Pattern *</label>
          <select
            value={formData.recurrence_pattern}
            onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            {recurrencePatterns.map(pattern => (
              <option key={pattern.value} value={pattern.value}>{pattern.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="general">General</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="meetings">Meetings</option>
            <option value="learning">Learning</option>
            <option value="health">Health</option>
          </select>
        </div>
      </div>

      {/* Weekly Pattern */}
      {formData.recurrence_pattern === 'weekly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Days</label>
          <div className="flex flex-wrap gap-2">
            {weekDays.map(day => (
              <button
                key={day.value}
                type="button"
                onClick={() => handleWeekDayToggle(day.value)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  formData.week_days.includes(day.value)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Pattern */}
      {formData.recurrence_pattern === 'monthly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Day of Month</label>
          <input
            type="number"
            min="1"
            max="31"
            value={formData.day_of_month}
            onChange={(e) => setFormData({ ...formData, day_of_month: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      )}

      {/* Custom Pattern */}
      {formData.recurrence_pattern === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Custom Interval (days)</label>
          <input
            type="number"
            min="1"
            value={formData.custom_interval}
            onChange={(e) => setFormData({ ...formData, custom_interval: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            min={formData.start_date}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Occurrences (optional)</label>
          <input
            type="number"
            min="1"
            value={formData.max_occurrences}
            onChange={(e) => setFormData({ ...formData, max_occurrences: e.target.value ? parseInt(e.target.value) : '' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (minutes)</label>
          <input
            type="number"
            min="1"
            value={formData.estimated_duration}
            onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add tag and press Enter"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleTagAdd(e.target.value.trim());
                e.target.value = '';
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={formData.enabled}
          onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded"
        />
        <label className="text-sm font-medium text-gray-700">Enable this recurring task</label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {task ? 'Update' : 'Create'} Recurring Task
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default RecurringTasks;
