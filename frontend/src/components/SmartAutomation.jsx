import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

const SmartAutomation = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('automation');
  const [automationRules, setAutomationRules] = useState([]);
  const [workflowRules, setWorkflowRules] = useState([]);
  const [automationHistory, setAutomationHistory] = useState([]);
  const [automationStatus, setAutomationStatus] = useState(null);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAutomationData();
  }, []);

  const fetchAutomationData = async () => {
    try {
      const [rulesResponse, workflowResponse, historyResponse, statusResponse] = await Promise.all([
        api.get('/automation/rules'),
        api.get('/automation/workflow-rules'),
        api.get('/automation/history'),
        api.get('/automation/status')
      ]);

      setAutomationRules(rulesResponse.data.rules || []);
      setWorkflowRules(workflowResponse.data.rules || []);
      setAutomationHistory(historyResponse.data.history || []);
      setAutomationStatus(statusResponse.data);
    } catch (error) {
      console.error('Error fetching automation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAutomationRule = async (ruleData) => {
    try {
      const response = await api.post('/automation/rules', ruleData);
      setAutomationRules(prev => [...prev, response.data.rule]);
      setShowCreateRule(false);
    } catch (error) {
      console.error('Error creating automation rule:', error);
    }
  };

  const handleCreateWorkflowRule = async (ruleData) => {
    try {
      const response = await api.post('/automation/workflow-rules', ruleData);
      setWorkflowRules(prev => [...prev, response.data.rule]);
      setShowCreateWorkflow(false);
    } catch (error) {
      console.error('Error creating workflow rule:', error);
    }
  };

  const handleUpdateRule = async (ruleId, ruleData) => {
    try {
      const response = await api.put(`/automation/rules/${ruleId}`, ruleData);
      setAutomationRules(prev => 
        prev.map(rule => rule.id === ruleId ? response.data.rule : rule)
      );
      setEditingRule(null);
    } catch (error) {
      console.error('Error updating rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      try {
        await api.delete(`/automation/rules/${ruleId}`);
        setAutomationRules(prev => prev.filter(rule => rule.id !== ruleId));
      } catch (error) {
        console.error('Error deleting rule:', error);
      }
    }
  };

  const handleDeleteWorkflowRule = async (ruleId) => {
    if (confirm('Are you sure you want to delete this workflow rule?')) {
      try {
        await api.delete(`/automation/workflow-rules/${ruleId}`);
        setWorkflowRules(prev => prev.filter(rule => rule.id !== ruleId));
      } catch (error) {
        console.error('Error deleting workflow rule:', error);
      }
    }
  };

  const handleManualTrigger = async () => {
    try {
      await api.post('/automation/trigger-manual');
      alert('Automation check triggered successfully');
      fetchAutomationData();
    } catch (error) {
      console.error('Error triggering automation:', error);
    }
  };

  const getTriggerIcon = (trigger) => {
    const icons = {
      'deadline_passed': 'schedule',
      'task_completed': 'check_circle',
      'task_overdue': 'warning',
      'task_due_soon': 'notifications',
      'status_change': 'swap_horiz',
      'priority_change': 'flag'
    };
    return icons[trigger] || 'settings';
  };

  const getActionIcon = (action) => {
    const icons = {
      'update_status': 'edit',
      'notify': 'notifications',
      'assign': 'person_add',
      'email': 'email',
      'create_task': 'add_task'
    };
    return icons[action] || 'settings';
  };

  const getStatusColor = (status) => {
    const colors = {
      'success': 'text-green-600',
      'failed': 'text-red-600',
      'pending': 'text-yellow-600',
      'running': 'text-blue-600'
    };
    return colors[status] || 'text-gray-600';
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
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 transform transition-all duration-700 ease-in-out hover:scale-101">
      {/* Enhanced Header */}
      <div className="p-6 border-b border-gray-700/50 backdrop-blur-xl bg-black/20 transition-all duration-500 ease-in-out">
        <div className="flex items-center justify-between">
          <div className="transform transition-all duration-500 ease-in-out hover:translate-x-1">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent bg-clip-text mb-2 transition-all duration-700 ease-in-out hover:from-blue-300 hover:to-purple-300">
              Smart Automation
            </h2>
            <p className="text-sm text-gray-400 transition-all duration-500 ease-in-out hover:text-gray-300">
              Configure automated workflows and task management rules
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleManualTrigger}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-500 ease-out shadow-lg hover:shadow-blue-500/50 hover:-translate-y-0.5 hover:scale-105 transform"
            >
              Run Now
            </button>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-xl border border-gray-600/50 transition-all duration-300 ease-in-out hover:bg-gray-700/70 hover:border-gray-500/50">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ease-in-out ${automationStatus?.scheduler_running ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-300 transition-all duration-300 ease-in-out hover:text-gray-200">
                {automationStatus?.scheduler_running ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="border-b border-gray-700/50 backdrop-blur-xl bg-black/10 transition-all duration-500 ease-in-out">
        <nav className="flex">
          {[
            { id: 'automation', label: 'Automation Rules', icon: '⚙️' },
            { id: 'workflow', label: 'Workflow Rules', icon: '🌳' },
            { id: 'history', label: 'History', icon: '📜' },
            { id: 'status', label: 'Status', icon: '📊' }
          ].map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 border-b-2 font-medium text-sm transition-all duration-500 ease-out flex items-center gap-2 transform hover:scale-105 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-blue-600/10 shadow-lg shadow-blue-500/20'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600/50 hover:bg-gray-700/30'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <span className="text-lg transition-transform duration-300 ease-in-out hover:rotate-12">{tab.icon}</span>
              <span className="transition-all duration-300 ease-in-out hover:scale-110">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'automation' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white transition-all duration-300 ease-in-out hover:text-blue-400 transform hover:scale-105">
                Automation Rules
              </h3>
              <button
                onClick={() => setShowCreateRule(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-500 ease-out shadow-lg hover:shadow-blue-500/50 hover:-translate-y-0.5 hover:scale-105 transform"
              >
                Create Rule
              </button>
            </div>

            <div className="grid gap-4">
              {automationRules.map((rule, index) => (
                <div
                  key={rule.id}
                  className="bg-gray-700/50 backdrop-blur-lg border border-gray-600/50 rounded-xl p-4 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 hover:scale-102 transform"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg transition-transform duration-300 ease-in-out hover:rotate-12 hover:scale-110">{getTriggerIcon(rule.trigger)}</span>
                        <h4 className="font-medium text-white transition-all duration-300 ease-in-out hover:text-blue-400 transform hover:scale-105">
                          {rule.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs transition-all duration-300 ease-in-out hover:scale-110 transform ${
                          rule.enabled ? 'bg-green-900/50 text-green-400 hover:bg-green-800/50' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                        }`}>
                          {rule.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3 transition-all duration-300 ease-in-out hover:text-gray-300">
                        {rule.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="transition-all duration-300 ease-in-out hover:text-gray-400">Trigger: {rule.trigger}</span>
                        <span className="transition-all duration-300 ease-in-out hover:text-gray-400">Actions: {rule.actions?.length || 0}</span>
                        <span className="transition-all duration-300 ease-in-out hover:text-gray-400">Created: {new Date(rule.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingRule(rule)}
                        className="p-2 text-gray-400 hover:text-blue-400 transition-all duration-300 ease-in-out hover:scale-110 transform"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-all duration-300 ease-in-out hover:scale-110 transform"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {automationRules.length === 0 && (
              <div className="text-center py-8 text-gray-400 transition-all duration-500 ease-in-out hover:scale-105 transform">
                <div className="text-4xl mb-4 transition-transform duration-300 ease-in-out hover:rotate-12">⚙️</div>
                <p className="transition-all duration-300 ease-in-out hover:text-gray-300">No automation rules configured yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white transition-all duration-300 ease-in-out hover:text-purple-400 transform hover:scale-105">
                Workflow Rules
              </h3>
              <button
                onClick={() => setShowCreateWorkflow(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-500 ease-out shadow-lg hover:shadow-purple-500/50 hover:-translate-y-0.5 hover:scale-105 transform"
              >
                Create Workflow
              </button>
            </div>

            <div className="grid gap-4">
              {workflowRules.map((rule, index) => (
                <div
                  key={rule.id}
                  className="bg-gray-700/50 backdrop-blur-lg border border-gray-600/50 rounded-xl p-4 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 hover:scale-102 transform"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg transition-transform duration-300 ease-in-out hover:rotate-12 hover:scale-110">{getTriggerIcon(rule.trigger)}</span>
                        <h4 className="font-medium text-white transition-all duration-300 ease-in-out hover:text-purple-400 transform hover:scale-105">
                          {rule.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs transition-all duration-300 ease-in-out hover:scale-110 transform ${
                          rule.enabled ? 'bg-green-900/50 text-green-400 hover:bg-green-800/50' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                        }`}>
                          {rule.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3 transition-all duration-300 ease-in-out hover:text-gray-300">
                        {rule.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="transition-all duration-300 ease-in-out hover:text-gray-400">Trigger: {rule.trigger}</span>
                        <span className="transition-all duration-300 ease-in-out hover:text-gray-400">Action: {rule.action?.type}</span>
                        <span className="transition-all duration-300 ease-in-out hover:text-gray-400">Created: {new Date(rule.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingRule(rule)}
                        className="p-2 text-gray-400 hover:text-purple-400 transition-all duration-300 ease-in-out hover:scale-110 transform"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteWorkflowRule(rule.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-all duration-300 ease-in-out hover:scale-110 transform"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {workflowRules.length === 0 && (
              <div className="text-center py-8 text-gray-400 transition-all duration-500 ease-in-out hover:scale-105 transform">
                <div className="text-4xl mb-4 transition-transform duration-300 ease-in-out hover:rotate-12">🌳</div>
                <p className="transition-all duration-300 ease-in-out hover:text-gray-300">No workflow rules configured yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white transition-all duration-300 ease-in-out hover:text-yellow-400 transform hover:scale-105">
              Automation History
            </h3>

            <div className="space-y-3">
              {automationHistory.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-gray-700/50 backdrop-blur-lg border border-gray-600/50 rounded-xl p-4 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-yellow-500/20 hover:-translate-y-1 hover:scale-102 transform"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg transition-transform duration-300 ease-in-out hover:rotate-12 hover:scale-110 ${getStatusColor(item.status)}`}>
                        {item.status === 'success' ? '✅' : '❌'}
                      </span>
                      <div>
                        <p className="font-medium text-white transition-all duration-300 ease-in-out hover:text-yellow-400">
                          {item.rule_name}
                        </p>
                        <p className="text-sm text-gray-400 transition-all duration-300 ease-in-out hover:text-gray-300">
                          {item.action} on {item.target}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium transition-all duration-300 ease-in-out ${getStatusColor(item.status)}`}>
                        {item.status}
                      </p>
                      <p className="text-xs text-gray-500 transition-all duration-300 ease-in-out hover:text-gray-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {automationHistory.length === 0 && (
              <div className="text-center py-8 text-gray-400 transition-all duration-500 ease-in-out hover:scale-105 transform">
                <div className="text-4xl mb-4 transition-transform duration-300 ease-in-out hover:rotate-12">📜</div>
                <p className="transition-all duration-300 ease-in-out hover:text-gray-300">No automation history available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'status' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white transition-all duration-300 ease-in-out hover:text-green-400 transform hover:scale-105">
              System Status
            </h3>

            {automationStatus && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 backdrop-blur-lg border border-gray-600/50 rounded-xl p-4 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-green-500/20 hover:-translate-y-1 hover:scale-105 transform">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full transition-all duration-300 ease-in-out ${
                      automationStatus.scheduler_running ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                    }`}></div>
                    <span className="font-medium text-white transition-all duration-300 ease-in-out hover:text-green-400">
                      Scheduler
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 transition-all duration-300 ease-in-out hover:text-gray-300">
                    {automationStatus.scheduler_running ? 'Running' : 'Stopped'}
                  </p>
                </div>

                <div className="bg-gray-700/50 backdrop-blur-lg border border-gray-600/50 rounded-xl p-4 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 hover:scale-105 transform">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-blue-400 transition-transform duration-300 ease-in-out hover:rotate-12 hover:scale-110">⚙️</span>
                    <span className="font-medium text-white transition-all duration-300 ease-in-out hover:text-blue-400">
                      Automation Rules
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 transition-all duration-300 ease-in-out hover:text-gray-300">
                    {automationStatus.total_automation_rules} rules
                  </p>
                </div>

                <div className="bg-gray-700/50 backdrop-blur-lg border border-gray-600/50 rounded-xl p-4 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 hover:scale-105 transform">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-purple-400 transition-transform duration-300 ease-in-out hover:rotate-12 hover:scale-110">🌳</span>
                    <span className="font-medium text-white transition-all duration-300 ease-in-out hover:text-purple-400">
                      Workflow Rules
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 transition-all duration-300 ease-in-out hover:text-gray-300">
                    {automationStatus.total_workflow_rules} rules
                  </p>
                </div>

                <div className="bg-gray-700/50 backdrop-blur-lg border border-gray-600/50 rounded-xl p-4 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1 hover:scale-105 transform">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-indigo-400 transition-transform duration-300 ease-in-out hover:rotate-12 hover:scale-110">📅</span>
                    <span className="font-medium text-white transition-all duration-300 ease-in-out hover:text-indigo-400">
                      Next Check
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 transition-all duration-300 ease-in-out hover:text-gray-300">
                    {automationStatus.next_check ? 
                      new Date(automationStatus.next_check).toLocaleString() : 
                      'Not scheduled'
                    }
                  </p>
                </div>
              </div>
            )}

            <div className="bg-blue-900/30 backdrop-blur-lg border border-blue-700/50 rounded-xl p-4 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1 hover:scale-102 transform">
              <h4 className="font-semibold text-blue-400 mb-2 transition-all duration-300 ease-in-out hover:text-blue-300">
                System Information
              </h4>
              <ul className="text-sm text-blue-300 space-y-1">
                <li className="transition-all duration-300 ease-in-out hover:text-blue-200 hover:translate-x-1">Automation checks run every 5 minutes</li>
                <li className="transition-all duration-300 ease-in-out hover:text-blue-200 hover:translate-x-1">Tasks are automatically marked as overdue when deadline passes</li>
                <li className="transition-all duration-300 ease-in-out hover:text-blue-200 hover:translate-x-1">Workflow rules trigger based on task events</li>
                <li className="transition-all duration-300 ease-in-out hover:text-blue-200 hover:translate-x-1">All automation actions are logged in history</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Create Rule Modal */}
      {showCreateRule && (
        <CreateRuleModal
          onClose={() => setShowCreateRule(false)}
          onSubmit={handleCreateAutomationRule}
        />
      )}

      {/* Create Workflow Modal */}
      {showCreateWorkflow && (
        <CreateWorkflowModal
          onClose={() => setShowCreateWorkflow(false)}
          onSubmit={handleCreateWorkflowRule}
        />
      )}

      {/* Edit Rule Modal */}
      {editingRule && (
        <CreateRuleModal
          rule={editingRule}
          onClose={() => setEditingRule(null)}
          onSubmit={(data) => handleUpdateRule(editingRule.id, data)}
        />
      )}
    </div>
  );
};

// Create Rule Modal Component
const CreateRuleModal = ({ rule, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    trigger: rule?.trigger || 'deadline_passed',
    conditions: rule?.conditions || {},
    actions: rule?.actions || [],
    enabled: rule?.enabled !== undefined ? rule.enabled : true
  });

  const triggers = [
    { value: 'deadline_passed', label: 'Deadline Passed' },
    { value: 'task_completed', label: 'Task Completed' },
    { value: 'task_overdue', label: 'Task Overdue' },
    { value: 'task_due_soon', label: 'Task Due Soon' },
    { value: 'status_change', label: 'Status Changed' },
    { value: 'priority_change', label: 'Priority Changed' }
  ];

  const actions = [
    { value: 'update_status', label: 'Update Status' },
    { value: 'notify', label: 'Send Notification' },
    { value: 'assign', label: 'Assign Task' },
    { value: 'email', label: 'Send Email' },
    { value: 'create_task', label: 'Create Task' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {rule ? 'Edit Rule' : 'Create Automation Rule'}
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
              Rule Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trigger
            </label>
            <select
              value={formData.trigger}
              onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {triggers.map(trigger => (
                <option key={trigger.value} value={trigger.value}>
                  {trigger.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable this rule
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {rule ? 'Update' : 'Create'} Rule
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

// Create Workflow Modal Component
const CreateWorkflowModal = ({ rule, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    trigger: rule?.trigger || 'task_completed',
    conditions: rule?.conditions || {},
    action: rule?.action || { type: 'notify', target: 'admin', message: 'Task completed' },
    enabled: rule?.enabled !== undefined ? rule.enabled : true
  });

  const triggers = [
    { value: 'task_completed', label: 'Task Completed' },
    { value: 'task_overdue', label: 'Task Overdue' },
    { value: 'task_due_soon', label: 'Task Due Soon' },
    { value: 'status_change', label: 'Status Changed' }
  ];

  const actionTypes = [
    { value: 'notify', label: 'Send Notification' },
    { value: 'email', label: 'Send Email' },
    { value: 'update_status', label: 'Update Status' },
    { value: 'assign', label: 'Assign Task' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {rule ? 'Edit Workflow' : 'Create Workflow Rule'}
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
              Workflow Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trigger Event
            </label>
            <select
              value={formData.trigger}
              onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {triggers.map(trigger => (
                <option key={trigger.value} value={trigger.value}>
                  {trigger.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Action Type
            </label>
            <select
              value={formData.action.type}
              onChange={(e) => setFormData({ 
                ...formData, 
                action: { ...formData.action, type: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {actionTypes.map(action => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target/Message
            </label>
            <input
              type="text"
              value={formData.action.target || formData.action.message}
              onChange={(e) => {
                if (formData.action.type === 'notify' || formData.action.type === 'email') {
                  setFormData({ 
                    ...formData, 
                    action: { ...formData.action, target: e.target.value }
                  });
                } else {
                  setFormData({ 
                    ...formData, 
                    action: { ...formData.action, message: e.target.value }
                  });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder={formData.action.type === 'notify' ? 'Target user' : 'Message'}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable this workflow
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {rule ? 'Update' : 'Create'} Workflow
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

export default SmartAutomation;
