import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

const GoogleCalendarSync = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('status');
  const [calendarStatus, setCalendarStatus] = useState(null);
  const [syncSettings, setSyncSettings] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [syncResults, setSyncResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      const [statusResponse, settingsResponse] = await Promise.all([
        api.get('/google-calendar/status'),
        api.get('/google-calendar/sync-settings')
      ]);

      setCalendarStatus(statusResponse.data);
      setSyncSettings(settingsResponse.data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectCalendar = async () => {
    try {
      const response = await api.get('/google-calendar/auth');
      const { authorization_url } = response.data;
      
      // Open OAuth window
      const popup = window.open(
        authorization_url,
        'google-calendar-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Poll for completion
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          fetchCalendarData();
        }
      }, 1000);
    } catch (error) {
      console.error('Error connecting calendar:', error);
      alert('Failed to connect Google Calendar');
    }
  };

  const handleDisconnectCalendar = async () => {
    if (confirm('Are you sure you want to disconnect Google Calendar?')) {
      try {
        await api.post('/google-calendar/disconnect');
        setCalendarStatus({ connected: false });
        alert('Google Calendar disconnected successfully');
      } catch (error) {
        console.error('Error disconnecting calendar:', error);
        alert('Failed to disconnect Google Calendar');
      }
    }
  };

  const handleSyncCalendar = async (syncType = 'bidirectional') => {
    setSyncing(true);
    try {
      const response = await api.post('/google-calendar/sync', {
        sync_type: syncType,
        date_range: {
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });

      setSyncResults(response.data.sync_results);
      fetchCalendarData();
    } catch (error) {
      console.error('Error syncing calendar:', error);
      alert('Failed to sync calendar');
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateSettings = async (newSettings) => {
    try {
      const response = await api.put('/google-calendar/sync-settings', newSettings);
      setSyncSettings(response.data.settings);
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const response = await api.get('/google-calendar/events', {
        params: {
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });
      setCalendarEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const getEventColor = (event) => {
    if (event.summary?.startsWith('DTMS:')) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatEventTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Google Calendar Sync
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sync your tasks with Google Calendar for seamless scheduling
            </p>
          </div>
          <div className="flex items-center gap-3">
            {calendarStatus?.connected ? (
              <>
                <button
                  onClick={() => handleSyncCalendar()}
                  disabled={syncing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Settings
                </button>
              </>
            ) : (
              <button
                onClick={handleConnectCalendar}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Connect Calendar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${
            calendarStatus?.connected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {calendarStatus?.connected ? 'Connected to Google Calendar' : 'Not Connected'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {calendarStatus?.connected 
                ? `Last sync: ${calendarStatus.last_sync ? new Date(calendarStatus.last_sync).toLocaleString() : 'Never'}`
                : 'Connect your Google Calendar to enable synchronization'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          {[
            { id: 'status', label: 'Status', icon: 'monitoring' },
            { id: 'events', label: 'Calendar Events', icon: 'event' },
            { id: 'sync', label: 'Sync History', icon: 'history' },
            { id: 'settings', label: 'Settings', icon: 'settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'status' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-blue-500">calendar_today</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Connection Status
                  </span>
                </div>
                <p className={`text-sm ${calendarStatus?.connected ? 'text-green-600' : 'text-red-600'}`}>
                  {calendarStatus?.connected ? 'Connected' : 'Disconnected'}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-green-500">sync</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Auto Sync
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {syncSettings?.auto_sync ? 'Enabled' : 'Disabled'}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-purple-500">schedule</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Sync Frequency
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {syncSettings?.sync_frequency || 'Not set'}
                </p>
              </div>
            </div>

            {/* Sync Results */}
            {syncResults && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Sync Results
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">Events Created</p>
                    <p className="text-2xl font-bold text-blue-600">{syncResults.events_created}</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">Events Updated</p>
                    <p className="text-2xl font-bold text-blue-600">{syncResults.events_updated}</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">Tasks Synced</p>
                    <p className="text-2xl font-bold text-blue-600">{syncResults.tasks_synced}</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">Conflicts</p>
                    <p className="text-2xl font-bold text-blue-600">{syncResults.conflicts}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sync Actions */}
            {calendarStatus?.connected && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Sync Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleSyncCalendar('to_calendar')}
                    disabled={syncing}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Sync Tasks to Calendar
                  </button>
                  <button
                    onClick={() => handleSyncCalendar('from_calendar')}
                    disabled={syncing}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Sync Calendar to Tasks
                  </button>
                  <button
                    onClick={() => handleSyncCalendar('bidirectional')}
                    disabled={syncing}
                    className="px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    Bidirectional Sync
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Calendar Events
              </h3>
              <button
                onClick={fetchCalendarEvents}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Refresh Events
              </button>
            </div>

            <div className="space-y-3">
              {calendarEvents.map((event, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getEventColor(event)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {event.summary}
                      </h4>
                      {event.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {event.description}
                        </p>
                      )}
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <p>Start: {formatEventTime(event.start.dateTime)}</p>
                        <p>End: {formatEventTime(event.end.dateTime)}</p>
                      </div>
                    </div>
                    {event.summary?.startsWith('DTMS:') && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                        DTMS Task
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {calendarEvents.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-4">event</div>
                <p>No calendar events found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Sync History
            </h3>

            {/* Mock sync history */}
            <div className="space-y-3">
              {[
                {
                  type: 'bidirectional',
                  timestamp: new Date().toISOString(),
                  status: 'success',
                  events_created: 5,
                  events_updated: 2,
                  tasks_synced: 3
                },
                {
                  type: 'to_calendar',
                  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                  status: 'success',
                  events_created: 3,
                  events_updated: 1,
                  tasks_synced: 0
                },
                {
                  type: 'from_calendar',
                  timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                  status: 'success',
                  events_created: 0,
                  events_updated: 0,
                  tasks_synced: 2
                }
              ].map((sync, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {sync.type.replace('_', ' ').toUpperCase()} Sync
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(sync.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        sync.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {sync.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Created: {sync.events_created}</span>
                    <span>Updated: {sync.events_updated}</span>
                    <span>Tasks: {sync.tasks_synced}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Sync Settings
            </h3>

            {syncSettings && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Auto Sync
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={syncSettings.auto_sync}
                        onChange={(e) => setSyncSettings({...syncSettings, auto_sync: e.target.checked})}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Enable automatic synchronization
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sync Frequency
                    </label>
                    <select
                      value={syncSettings.sync_frequency}
                      onChange={(e) => setSyncSettings({...syncSettings, sync_frequency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="realtime">Real-time</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sync Direction
                    </label>
                    <select
                      value={syncSettings.sync_direction}
                      onChange={(e) => setSyncSettings({...syncSettings, sync_direction: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="bidirectional">Bidirectional</option>
                      <option value="to_calendar">Tasks to Calendar</option>
                      <option value="from_calendar">Calendar to Tasks</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Event Prefix
                    </label>
                    <input
                      type="text"
                      value={syncSettings.event_prefix}
                      onChange={(e) => setSyncSettings({...syncSettings, event_prefix: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Sync Options</h4>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={syncSettings.create_events}
                      onChange={(e) => setSyncSettings({...syncSettings, create_events: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Create calendar events from tasks
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={syncSettings.update_events}
                      onChange={(e) => setSyncSettings({...syncSettings, update_events: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Update existing calendar events
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={syncSettings.sync_completed_tasks}
                      onChange={(e) => setSyncSettings({...syncSettings, sync_completed_tasks: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Sync completed tasks
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleUpdateSettings(syncSettings)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Save Settings
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Google Calendar Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                close
              </button>
            </div>

            {syncSettings && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Auto Sync
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={syncSettings.auto_sync}
                        onChange={(e) => setSyncSettings({...syncSettings, auto_sync: e.target.checked})}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Enable automatic synchronization
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sync Frequency
                    </label>
                    <select
                      value={syncSettings.sync_frequency}
                      onChange={(e) => setSyncSettings({...syncSettings, sync_frequency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="realtime">Real-time</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleUpdateSettings(syncSettings)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Save Settings
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleCalendarSync;
