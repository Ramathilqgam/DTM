import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

const SlackDiscordIntegration = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('config');
  const [integrationConfig, setIntegrationConfig] = useState(null);
  const [messageTemplates, setMessageTemplates] = useState([]);
  const [automationRules, setAutomationRules] = useState([]);
  const [messageLogs, setMessageLogs] = useState([]);
  const [integrationStats, setIntegrationStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testingIntegration, setTestingIntegration] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showTestMessage, setShowTestMessage] = useState(false);

  useEffect(() => {
    fetchIntegrationData();
  }, []);

  const fetchIntegrationData = async () => {
    try {
      const [configResponse, templatesResponse, rulesResponse, logsResponse, statsResponse] = await Promise.all([
        api.get('/integrations/config'),
        api.get('/integrations/templates'),
        api.get('/integrations/automation-rules'),
        api.get('/integrations/logs'),
        api.get('/integrations/stats')
      ]);

      setIntegrationConfig(configResponse.data);
      setMessageTemplates(templatesResponse.data.templates);
      setAutomationRules(rulesResponse.data.rules);
      setMessageLogs(logsResponse.data.logs);
      setIntegrationStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching integration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (platform, configData) => {
    try {
      const response = await api.post('/integrations/config', {
        platform,
        config: configData
      });
      setIntegrationConfig(prev => ({
        ...prev,
        [platform]: response.data.config
      }));
      alert(`${platform.charAt(0).toUpperCase() + platform.slice(1)} configuration saved successfully`);
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save integration configuration');
    }
  };

  const handleTestIntegration = async (platform) => {
    setTestingIntegration(true);
    try {
      const response = await api.post('/integrations/test', { platform });
      if (response.data.success) {
        alert(`Test message sent to ${platform.charAt(0).toUpperCase() + platform.slice(1)} successfully`);
      } else {
        alert(`Failed to send test message: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error testing integration:', error);
      alert('Failed to send test message');
    } finally {
      setTestingIntegration(false);
    }
  };

  const handleSendMessage = async (platform, messageData) => {
    try {
      const response = await api.post('/integrations/send', {
        platform,
        message: messageData
      });
      if (response.data.success) {
        alert('Message sent successfully');
        fetchIntegrationData();
      } else {
        alert('Failed to send message: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const handleSendTemplateMessage = async (platform, templateData) => {
    try {
      const response = await api.post('/integrations/send-template', {
        platform,
        template_name: templateData.template_name,
        context: templateData.context
      });
      if (response.data.success) {
        alert('Template message sent successfully');
        fetchIntegrationData();
      } else {
        alert('Failed to send template message: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error sending template message:', error);
      alert('Failed to send template message');
    }
  };

  const handleUpdateAutomationRule = async (ruleId, ruleData) => {
    try {
      const response = await api.put(`/integrations/automation-rules/${ruleId}`, ruleData);
      if (response.data.success) {
        alert('Automation rule updated successfully');
        fetchIntegrationData();
      }
    } catch (error) {
      console.error('Error updating rule:', error);
      alert('Failed to update automation rule');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return 'check_circle';
      case 'failed': return 'error';
      case 'pending': return 'schedule';
      default: return 'help';
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'slack': return 'slack';
      case 'discord': return 'discord';
      default: return 'chat';
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'slack': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'discord': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
              Slack & Discord Integration
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure real-time alerts and notifications for Slack and Discord
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                integrationConfig?.slack?.enabled ? 'bg-purple-500' : 'bg-gray-500'
              }`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Slack</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                integrationConfig?.discord?.enabled ? 'bg-blue-500' : 'bg-gray-500'
              }`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Discord</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          {[
            { id: 'config', label: 'Configuration', icon: 'settings' },
            { id: 'templates', label: 'Templates', icon: 'description' },
            { id: 'automation', label: 'Automation', icon: 'auto_awesome' },
            { id: 'logs', label: 'Logs', icon: 'history' },
            { id: 'stats', label: 'Statistics', icon: 'bar_chart' }
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
        {activeTab === 'config' && (
          <div className="space-y-6">
            {/* Slack Configuration */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-purple-500">slack</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Slack Integration
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    integrationConfig?.slack?.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {integrationConfig?.slack?.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <button
                  onClick={() => handleTestIntegration('slack')}
                  disabled={testingIntegration}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  Test Slack
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={integrationConfig?.slack?.webhook_url || ''}
                    onChange={(e) => setIntegrationConfig(prev => ({
                      ...prev,
                      slack: { ...prev.slack, webhook_url: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Channel
                  </label>
                  <input
                    type="text"
                    value={integrationConfig?.slack?.channel || '#general'}
                    onChange={(e) => setIntegrationConfig(prev => ({
                      ...prev,
                      slack: { ...prev.slack, channel: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="#general"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <input
                  type="checkbox"
                  checked={integrationConfig?.slack?.enabled || false}
                  onChange={(e) => setIntegrationConfig(prev => ({
                    ...prev,
                    slack: { ...prev.slack, enabled: e.target.checked }
                  }))}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Slack Integration
                </label>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleSaveConfig('slack', integrationConfig?.slack)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Save Slack Config
                </button>
              </div>
            </div>

            {/* Discord Configuration */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-blue-500">discord</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Discord Integration
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    integrationConfig?.discord?.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {integrationConfig?.discord?.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <button
                  onClick={() => handleTestIntegration('discord')}
                  disabled={testingIntegration}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Test Discord
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={integrationConfig?.discord?.webhook_url || ''}
                    onChange={(e) => setIntegrationConfig(prev => ({
                      ...prev,
                      discord: { ...prev.discord, webhook_url: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="https://discord.com/api/webhooks/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Channel
                  </label>
                  <input
                    type="text"
                    value={integrationConfig?.discord?.channel || 'general'}
                    onChange={(e) => setIntegrationConfig(prev => ({
                      ...prev,
                      discord: { ...prev.discord, channel: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="general"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <input
                  type="checkbox"
                  checked={integrationConfig?.discord?.enabled || false}
                  onChange={(e) => setIntegrationConfig(prev => ({
                    ...prev,
                    discord: { ...prev.discord, enabled: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Discord Integration
                </label>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleSaveConfig('discord', integrationConfig?.discord)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Save Discord Config
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Message Templates
              </h3>
              <button
                onClick={() => setShowTemplateEditor(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create Template
              </button>
            </div>

            <div className="grid gap-4">
              {Object.entries(messageTemplates).map(([platform, templates]) => (
                <div key={platform} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-lg ${platform === 'slack' ? 'text-purple-500' : 'text-blue-500'}`}>
                      {getPlatformIcon(platform)}
                    </span>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {platform.charAt(0).toUpperCase() + platform.slice(1)} Templates
                    </h4>
                  </div>
                  <div className="grid gap-3">
                    {templates.map((template) => (
                      <div
                        key={template}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                              {template.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Template for {template} notifications
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const testData = {
                                  template_name: template,
                                  context: {
                                    task: { title: 'Test Task', priority: 'high', assignee: 'Test User' },
                                    user: { name: 'Test User' }
                                  }
                                };
                                handleSendTemplateMessage(platform, testData);
                              }}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            >
                              send
                            </button>
                            <button
                              onClick={() => setEditingTemplate({ platform, name: template })}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'automation' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Automation Rules
            </h3>

            <div className="space-y-4">
              {automationRules.map((rule) => (
                <div
                  key={rule.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-lg ${rule.platform === 'slack' ? 'text-purple-500' : 'text-blue-500'}`}>
                          {getPlatformIcon(rule.platform)}
                        </span>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {rule.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Trigger: {rule.trigger.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Template: {rule.template.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span>Channel: {rule.channel}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const updatedRule = { ...rule, enabled: !rule.enabled };
                          handleUpdateAutomationRule(rule.id, updatedRule);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {rule.enabled ? 'pause' : 'play_arrow'}
                      </button>
                      <button
                        onClick={() => setEditingTemplate({ platform: rule.platform, name: rule.template })}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Message Logs
            </h3>

            <div className="space-y-3">
              {messageLogs.map((log) => (
                <div
                  key={log.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg ${getPlatformColor(log.platform)}`}>
                        {getPlatformIcon(log.platform)}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {log.message}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {log.platform} - {log.channel}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(log.sent_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {log.error && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                      Error: {log.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Integration Statistics
            </h3>

            {integrationStats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Slack Stats */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl text-purple-500">slack</span>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        Slack Statistics
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Sent</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {integrationStats.slack.total_sent}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
                        <p className="text-2xl font-bold text-red-600">
                          {integrationStats.slack.total_failed}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                        <p className="text-2xl font-bold text-green-600">
                          {integrationStats.slack.success_rate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Last Sent</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(integrationStats.slack.last_sent).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Discord Stats */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl text-blue-500">discord</span>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        Discord Statistics
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Sent</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {integrationStats.discord.total_sent}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
                        <p className="text-2xl font-bold text-red-600">
                          {integrationStats.discord.total_failed}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                        <p className="text-2xl font-bold text-green-600">
                          {integrationStats.discord.success_rate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Last Sent</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(integrationStats.discord.last_sent).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Statistics */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Daily Statistics
                  </h4>
                  <div className="space-y-2">
                    {integrationStats.daily_stats.map((stat) => (
                      <div key={stat.date} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(stat.date).toLocaleDateString()}
                        </span>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-purple-500">slack</span>
                            <span className="text-sm font-medium">{stat.slack_sent}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-500">discord</span>
                            <span className="text-sm font-medium">{stat.discord_sent}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Test Message Modal */}
      {showTestMessage && (
        <TestMessageModal
          onClose={() => setShowTestMessage(false)}
          onSubmit={handleSendMessage}
        />
      )}

      {/* Template Editor Modal */}
      {showTemplateEditor && (
        <TemplateEditorModal
          template={editingTemplate}
          onClose={() => {
            setShowTemplateEditor(false);
            setEditingTemplate(null);
          }}
          onSubmit={(template) => {
            // Handle template save
            setShowTemplateEditor(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
};

// Test Message Modal Component
const TestMessageModal = ({ onClose, onSubmit }) => {
  const [messageData, setMessageData] = useState({
    platform: 'slack',
    text: 'Test message from DTMS',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Test Message*\nThis is a test message to verify your integration is working correctly.'
        }
      }
    ]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(messageData.platform, messageData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Send Test Message
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Platform
            </label>
            <select
              value={messageData.platform}
              onChange={(e) => setMessageData({ ...messageData, platform: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="slack">Slack</option>
              <option value="discord">Discord</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <textarea
              value={messageData.text}
              onChange={(e) => setMessageData({ ...messageData, text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Send Test Message
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Template Editor Modal Component
const TemplateEditorModal = ({ template, onClose, onSubmit }) => {
  const [templateData, setTemplateData] = useState({
    platform: template?.platform || 'slack',
    name: template?.name || '',
    content: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(templateData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {template ? 'Edit Template' : 'Create Template'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Platform
            </label>
            <select
              value={templateData.platform}
              onChange={(e) => setTemplateData({ ...templateData, platform: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="slack">Slack</option>
              <option value="discord">Discord</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={templateData.name}
              onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Template Content (JSON)
            </label>
            <textarea
              value={templateData.content}
              onChange={(e) => setTemplateData({ ...templateData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
              rows={10}
              placeholder='{"text": "Hello {{user.name}}", "blocks": [...]}'
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {template ? 'Update' : 'Create'} Template
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SlackDiscordIntegration;
