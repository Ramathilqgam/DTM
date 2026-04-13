import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

const EmailIntegration = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('config');
  const [emailConfig, setEmailConfig] = useState(null);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [automationRules, setAutomationRules] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [emailStats, setEmailStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testingEmail, setTestingEmail] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showTestEmail, setShowTestEmail] = useState(false);

  useEffect(() => {
    fetchEmailData();
  }, []);

  const fetchEmailData = async () => {
    try {
      const [configResponse, templatesResponse, rulesResponse, logsResponse, statsResponse] = await Promise.all([
        api.get('/email/config'),
        api.get('/email/templates'),
        api.get('/email/automation-rules'),
        api.get('/email/logs'),
        api.get('/email/stats')
      ]);

      setEmailConfig(configResponse.data);
      setEmailTemplates(Object.entries(templatesResponse.data.templates));
      setAutomationRules(rulesResponse.data.rules);
      setEmailLogs(logsResponse.data.logs);
      setEmailStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching email data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (configData) => {
    try {
      const response = await api.post('/email/config', configData);
      setEmailConfig(response.data);
      alert('Email configuration saved successfully');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save email configuration');
    }
  };

  const handleTestEmail = async (testData) => {
    setTestingEmail(true);
    try {
      const response = await api.post('/email/test', testData);
      if (response.data.success) {
        alert('Test email sent successfully');
      } else {
        alert('Failed to send test email: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error testing email:', error);
      alert('Failed to send test email');
    } finally {
      setTestingEmail(false);
      setShowTestEmail(false);
    }
  };

  const handleSendEmail = async (emailData) => {
    try {
      const response = await api.post('/email/send', emailData);
      if (response.data.success) {
        alert('Email sent successfully');
        fetchEmailData();
      } else {
        alert('Failed to send email: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    }
  };

  const handleSendTemplateEmail = async (templateData) => {
    try {
      const response = await api.post('/email/send-template', templateData);
      if (response.data.success) {
        alert('Template email sent successfully');
        fetchEmailData();
      } else {
        alert('Failed to send template email: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error sending template email:', error);
      alert('Failed to send template email');
    }
  };

  const handleUpdateAutomationRule = async (ruleId, ruleData) => {
    try {
      const response = await api.put(`/email/automation-rules/${ruleId}`, ruleData);
      if (response.data.success) {
        alert('Automation rule updated successfully');
        fetchEmailData();
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
              Email Integration
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure email notifications and automated email workflows
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              emailConfig?.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                emailConfig?.enabled ? 'bg-green-500' : 'bg-gray-500'
              }`}></div>
              <span className="text-sm font-medium">
                {emailConfig?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <button
              onClick={() => setShowTestEmail(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Test Email
            </button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  SMTP Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      SMTP Server
                    </label>
                    <input
                      type="text"
                      value={emailConfig?.smtp_server || ''}
                      onChange={(e) => setEmailConfig({...emailConfig, smtp_server: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={emailConfig?.smtp_port || 587}
                      onChange={(e) => setEmailConfig({...emailConfig, smtp_port: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username
                    </label>
                    <input
                      type="email"
                      value={emailConfig?.username || ''}
                      onChange={(e) => setEmailConfig({...emailConfig, username: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={emailConfig?.password || ''}
                      onChange={(e) => setEmailConfig({...emailConfig, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Your password or app password"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Email Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={emailConfig?.from_email || ''}
                      onChange={(e) => setEmailConfig({...emailConfig, from_email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="noreply@yourdomain.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={emailConfig?.from_name || ''}
                      onChange={(e) => setEmailConfig({...emailConfig, from_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="DTMS"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={emailConfig?.use_tls || false}
                        onChange={(e) => setEmailConfig({...emailConfig, use_tls: e.target.checked})}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Use TLS
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={emailConfig?.use_ssl || false}
                        onChange={(e) => setEmailConfig({...emailConfig, use_ssl: e.target.checked})}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Use SSL
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={emailConfig?.enabled || false}
                        onChange={(e) => setEmailConfig({...emailConfig, enabled: e.target.checked})}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enable Email Integration
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleSaveConfig(emailConfig)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Save Configuration
              </button>
              <button
                onClick={() => setShowTestEmail(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Send Test Email
              </button>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Email Templates
              </h3>
              <button
                onClick={() => setShowTemplateEditor(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create Template
              </button>
            </div>

            <div className="grid gap-4">
              {emailTemplates.map(([name, template]) => (
                <div
                  key={name}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Subject: {template.subject}
                      </p>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span>Variables: {template.subject.match(/\{\{(\w+)\}\}/g)?.join(', ') || 'None'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingTemplate(name)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        edit
                      </button>
                      <button
                        onClick={() => {
                          const testData = {
                            template_name: name,
                            to_email: 'test@example.com',
                            context: {
                              user: { name: 'Test User' },
                              task: { title: 'Test Task', description: 'Test Description', priority: 'high' }
                            }
                          };
                          handleSendTemplateEmail(testData);
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      >
                        send
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'automation' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Email Automation Rules
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
                        <span>Recipients: {rule.recipients.join(', ')}</span>
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
                        onClick={() => setEditingTemplate(rule.template)}
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
              Email Logs
            </h3>

            <div className="space-y-3">
              {emailLogs.map((log) => (
                <div
                  key={log.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {log.subject}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          To: {log.to_email}
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
              Email Statistics
            </h3>

            {emailStats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-blue-500">send</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Total Sent
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {emailStats.total_sent}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-red-500">error</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Failed
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {emailStats.total_failed}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-green-500">trending_up</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Success Rate
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {emailStats.success_rate}%
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-purple-500">schedule</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Last Sent
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {new Date(emailStats.last_sent).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Templates Used
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(emailStats.templates_used).map(([template, count]) => (
                        <div key={template} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {template.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Daily Statistics
                    </h4>
                    <div className="space-y-2">
                      {emailStats.daily_stats.map((stat) => (
                        <div key={stat.date} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {new Date(stat.date).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            <span className="text-green-600">{stat.sent}</span>
                            <span className="text-red-600">{stat.failed}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Test Email Modal */}
      {showTestEmail && (
        <TestEmailModal
          onClose={() => setShowTestEmail(false)}
          onSubmit={handleTestEmail}
          testing={testingEmail}
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

// Test Email Modal Component
const TestEmailModal = ({ onClose, onSubmit, testing }) => {
  const [testData, setTestData] = useState({
    to_email: '',
    subject: 'Test Email from DTMS',
    message: 'This is a test email to verify your email configuration.'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(testData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Send Test Email
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
              To Email
            </label>
            <input
              type="email"
              value={testData.to_email}
              onChange={(e) => setTestData({ ...testData, to_email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={testData.subject}
              onChange={(e) => setTestData({ ...testData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <textarea
              value={testData.message}
              onChange={(e) => setTestData({ ...testData, message: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={testing}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {testing ? 'Sending...' : 'Send Test Email'}
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
    name: template || '',
    subject: '',
    html_content: '',
    text_content: ''
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
              Subject
            </label>
            <input
              type="text"
              value={templateData.subject}
              onChange={(e) => setTemplateData({ ...templateData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Use {{variable}} for dynamic content"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              HTML Content
            </label>
            <textarea
              value={templateData.html_content}
              onChange={(e) => setTemplateData({ ...templateData, html_content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={6}
              placeholder="HTML email content with {{variable}} placeholders"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Text Content
            </label>
            <textarea
              value={templateData.text_content}
              onChange={(e) => setTemplateData({ ...templateData, text_content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={4}
              placeholder="Plain text email content with {{variable}} placeholders"
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

export default EmailIntegration;
