import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

const SmartReminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reminders');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  useEffect(() => {
    fetchRemindersData();
  }, []);

  const fetchRemindersData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reminders/reminders');
      console.log('Smart Reminders API Response:', response.data);
      setReminders(response.data || []);
      setPreferences(response.data.preferences || {});
    } catch (error) {
      console.error('Error fetching reminders data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/reminders/notifications');
      console.log('Notifications API Response:', response.data);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/reminders/smart-suggestions');
      console.log('Smart Suggestions API Response:', response.data);
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleCreateReminder = async (reminderData) => {
    try {
      await api.post('/reminders/reminders', reminderData);
      fetchRemindersData();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating reminder:', error);
      alert('Error creating reminder');
    }
  };

  const handleUpdateReminder = async (reminderId, reminderData) => {
    try {
      await api.put(`/reminders/reminders/${reminderId}`, reminderData);
      fetchRemindersData();
      setEditingReminder(null);
    } catch (error) {
      console.error('Error updating reminder:', error);
      alert('Error updating reminder');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      try {
        await api.delete(`/reminders/reminders/${reminderId}`);
        fetchRemindersData();
      } catch (error) {
        console.error('Error deleting reminder:', error);
        alert('Error deleting reminder');
      }
    }
  };

  const handleToggleReminder = async (reminderId, enabled) => {
    try {
      await api.put(`/reminders/reminders/${reminderId}`, { enabled });
      fetchRemindersData();
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await api.post(`/reminders/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleUpdatePreferences = async (newPreferences) => {
    try {
      const response = await api.put('/reminders/preferences', newPreferences);
      setPreferences(response.data.preferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Error updating preferences');
    }
  };

  const getReminderTypeColor = (type) => {
    const colors = {
      deadline: 'bg-red-100 text-red-800 border-red-200',
      daily_check: 'bg-blue-100 text-blue-800 border-blue-200',
      weekly_review: 'bg-green-100 text-green-800 border-green-200',
      priority_task: 'bg-orange-100 text-orange-800 border-orange-200',
      habit_building: 'bg-purple-100 text-purple-800 border-purple-200',
      break_reminder: 'bg-cyan-100 text-cyan-800 border-cyan-200'
    };
    return colors[type] || colors.daily_check;
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
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl">
      {/* Header with glassmorphism */}
      <div className="p-8 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent bg-clip-text mb-2">
              Smart Reminders & Notifications
            </h2>
            <p className="text-gray-600">Stay on track with AI-powered intelligent reminders</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:-translate-y-0.5"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">+</span>
                Create Reminder
              </span>
            </button>
            <button
              onClick={fetchSuggestions}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/50 hover:-translate-y-0.5"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                AI Suggestions
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs with glassmorphism */}
      <div className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <nav className="flex -mb-px">
          {[
            { id: 'reminders', label: 'Reminders', count: reminders.length, icon: '🔔' },
            { id: 'notifications', label: 'Notifications', count: notifications.filter(n => !n.read).length, icon: '📬' },
            { id: 'suggestions', label: 'AI Suggestions', count: suggestions.length, icon: '✨' },
            { id: 'preferences', label: 'Preferences', count: null, icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'notifications') fetchNotifications();
                if (tab.id === 'suggestions') fetchSuggestions();
              }}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50/30'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </span>
              {tab.count !== null && (
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content with glassmorphism */}
      <div className="p-6 bg-white/5 backdrop-blur-sm rounded-b-lg">
        {activeTab === 'reminders' && (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`border rounded-lg p-4 transition-all ${
                  reminder.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReminderTypeColor(reminder.type)}`}>
                        {reminder.type.replace('_', ' ').title()}
                      </span>
                      <h3 className="font-semibold text-gray-800">{reminder.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{reminder.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Schedule: {reminder.schedule}</span>
                      <span>Next: {new Date(reminder.next_trigger).toLocaleString()}</span>
                      <span>Pattern: {reminder.repeat_pattern}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleReminder(reminder.id, !reminder.enabled)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        reminder.enabled
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {reminder.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => setEditingReminder(reminder)}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {reminders.length === 0 && (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">notifications</span>
                <p className="text-gray-500 mb-4">No reminders set up yet</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Your First Reminder
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 transition-all ${
                  notification.read ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`}></div>
                      <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                      {!notification.read && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <div className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkNotificationRead(notification.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">mark_email_read</span>
                <p className="text-gray-500">No notifications</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReminderTypeColor(suggestion.type)}`}>
                        {suggestion.type.replace('_', ' ').title()}
                      </span>
                      <h3 className="font-semibold text-gray-800">{suggestion.title}</h3>
                      <span className="text-sm text-purple-600">
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                    <p className="text-sm text-purple-700 mb-3">Reason: {suggestion.reason}</p>
                    <div className="text-sm text-gray-500">
                      Recommended schedule: {suggestion.recommended_schedule?.join(', ')}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const reminderData = {
                        type: suggestion.type,
                        title: suggestion.title,
                        description: suggestion.description,
                        schedule: suggestion.recommended_schedule?.[0] || '09:00',
                        channels: ['in_app'],
                        enabled: true
                      };
                      handleCreateReminder(reminderData);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Apply Suggestion
                  </button>
                </div>
              </div>
            ))}

            {suggestions.length === 0 && (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">lightbulb</span>
                <p className="text-gray-500 mb-4">No AI suggestions available</p>
                <p className="text-sm text-gray-400">Complete more tasks to get personalized suggestions</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'preferences' && preferences && (
          <div className="space-y-6">
            {/* Notification Channels */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Channels</h3>
              <div className="space-y-3">
                {Object.entries(preferences.channels).map(([channel, config]) => (
                  <div key={channel} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) => handleUpdatePreferences({
                          channels: {
                            ...preferences.channels,
                            [channel]: { ...config, enabled: e.target.checked }
                          }
                        })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <div className="font-medium text-gray-800 capitalize">{channel.replace('_', ' ')}</div>
                        <div className="text-sm text-gray-500">
                          {config.address && `Email: ${config.address}`}
                          {config.phone_number && `Phone: ${config.phone_number}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiet Hours */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quiet Hours</h3>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={preferences.quiet_hours.enabled}
                    onChange={(e) => handleUpdatePreferences({
                      quiet_hours: {
                        ...preferences.quiet_hours,
                        enabled: e.target.checked
                      }
                    })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label className="font-medium text-gray-800">Enable Quiet Hours</label>
                </div>
                {preferences.quiet_hours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={preferences.quiet_hours.start}
                        onChange={(e) => handleUpdatePreferences({
                          quiet_hours: {
                            ...preferences.quiet_hours,
                            start: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={preferences.quiet_hours.end}
                        onChange={(e) => handleUpdatePreferences({
                          quiet_hours: {
                            ...preferences.quiet_hours,
                            end: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reminder Types */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Reminder Types</h3>
              <div className="space-y-3">
                {Object.entries(preferences.types).map(([type, config]) => (
                  <div key={type} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) => handleUpdatePreferences({
                          types: {
                            ...preferences.types,
                            [type]: { ...config, enabled: e.target.checked }
                          }
                        })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <div className="font-medium text-gray-800 capitalize">{type.replace('_', ' ')}</div>
                        <div className="text-sm text-gray-500">Priority: {config.priority}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Reminder Modal */}
      {(showCreateForm || editingReminder) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {editingReminder ? 'Edit Reminder' : 'Create Reminder'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingReminder(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                close
              </button>
            </div>

            <ReminderForm
              reminder={editingReminder}
              onSubmit={editingReminder ? 
                (data) => handleUpdateReminder(editingReminder.id, data) : 
                handleCreateReminder
              }
              onCancel={() => {
                setShowCreateForm(false);
                setEditingReminder(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Smart reminders help you stay on track with your tasks and goals
          </p>
          <button
            onClick={fetchRemindersData}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

// Reminder Form Component
const ReminderForm = ({ reminder, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: reminder?.type || 'daily_check',
    title: reminder?.title || '',
    description: reminder?.description || '',
    schedule: reminder?.schedule || '09:00',
    channels: reminder?.channels || ['in_app'],
    enabled: reminder?.enabled ?? true,
    repeat_pattern: reminder?.repeat_pattern || 'daily'
  });

  const reminderTypes = [
    { value: 'deadline', label: 'Deadline Reminder' },
    { value: 'daily_check', label: 'Daily Check' },
    { value: 'weekly_review', label: 'Weekly Review' },
    { value: 'priority_task', label: 'Priority Task' },
    { value: 'habit_building', label: 'Habit Building' },
    { value: 'break_reminder', label: 'Break Reminder' }
  ];

  const scheduleOptions = [
    { value: '09:00', label: '9:00 AM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '1_day_before', label: '1 Day Before' },
    { value: '1_hour_before', label: '1 Hour Before' },
    { value: '15_minutes_before', label: '15 Minutes Before' },
    { value: 'every_2_hours', label: 'Every 2 Hours' },
    { value: 'every_90_minutes', label: 'Every 90 Minutes' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          {reminderTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
        <select
          value={formData.schedule}
          onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          {scheduleOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Repeat Pattern</label>
        <select
          value={formData.repeat_pattern}
          onChange={(e) => setFormData({ ...formData, repeat_pattern: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="once">Once</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="hourly">Hourly</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={formData.enabled}
          onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded"
        />
        <label className="text-sm font-medium text-gray-700">Enable this reminder</label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {reminder ? 'Update' : 'Create'} Reminder
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

export default SmartReminders;
