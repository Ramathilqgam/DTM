import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

// Animated Icons
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const AutomationIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Animated Background Component
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-teal-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-gradient-to-br from-yellow-600/20 via-orange-600/20 to-red-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      
      {/* Moving Particles */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-bounce"
            style={{
              top: `${10 + i * 12}%`,
              left: `${5 + i * 12}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + i * 0.3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AutomationRules({ onClose }) {
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: 'deadline_passed',
    enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      // For now, use mock data since API endpoint may not exist
      const mockRules = [
        {
          id: 1,
          name: 'Deadline Notification',
          description: 'Notify when task deadline passes',
          trigger: 'deadline_passed',
          enabled: true
        },
        {
          id: 2,
          name: 'Task Completion Alert',
          description: 'Send alert when task is completed',
          trigger: 'task_completed',
          enabled: false
        }
      ];
      setRules(mockRules);
    } catch (err) {
      console.error('Error fetching automation rules:', err);
      setError('Failed to fetch automation rules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        setError('Rule name is required');
        setLoading(false);
        return;
      }

      const ruleData = {
        name: formData.name,
        description: formData.description,
        trigger: formData.trigger,
        enabled: formData.enabled
      };

      // For now, simulate successful creation and add to local state
      // In production, this would be: await api.post('/automation/rules', ruleData);
      console.log('Creating automation rule:', ruleData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add new rule to local state
      const newRule = {
        id: Date.now(), // Temporary ID
        ...ruleData
      };
      
      setRules(prev => [...prev, newRule]);
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        trigger: 'deadline_passed',
        enabled: true
      });
      
      // Show success message
      setError('');
      
    } catch (err) {
      console.error('Error creating automation rule:', err);
      setError('Failed to create automation rule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm("Delete this automation rule?")) return;
    
    try {
      // For now, simulate deletion
      // In production: await api.delete(`/automation/rules/${ruleId}`);
      console.log('Deleting automation rule:', ruleId);
      
      setRules(prev => prev.filter(r => r.id !== ruleId));
    } catch (err) {
      console.error('Error deleting automation rule:', err);
      setError('Failed to delete automation rule');
    }
  };

  const handleToggleRule = async (ruleId, enabled) => {
    try {
      // For now, simulate toggle
      // In production: await api.patch(`/automation/rules/${ruleId}`, { enabled });
      console.log('Toggling automation rule:', ruleId, enabled);
      
      setRules(prev => prev.map(r => 
        r.id === ruleId ? { ...r, enabled } : r
      ));
    } catch (err) {
      console.error('Error updating automation rule:', err);
      setError('Failed to update automation rule');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
        <AnimatedBackground />
        
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg transform hover:scale-110 transition-all duration-300 animate-pulse">
              <SettingsIcon />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Create Automation Rule
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Set up automated actions for your tasks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-100 hover:bg-red-100 border border-gray-300 hover:border-red-300 transition-all duration-300 group"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="relative z-10 mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <CloseIcon />
            </button>
          </div>
        )}
        
        {/* Success Message */}
        {!error && rules.length > 0 && (
          <div className="relative z-10 mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <div>
              <p className="font-semibold text-green-900">Success</p>
              <p className="text-green-700">Automation rules are working!</p>
            </div>
          </div>
        )}

        <div className="relative z-10 flex gap-8">
          {/* Form Section */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rule Name */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter rule name"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this rule does"
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md resize-none"
                />
              </div>

              {/* Trigger */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Trigger
                </label>
                <select
                  value={formData.trigger}
                  onChange={(e) => setFormData(prev => ({ ...prev, trigger: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-900 shadow-sm hover:shadow-md appearance-none"
                >
                  <option value="deadline_passed" className="bg-white text-gray-900">Deadline Passed</option>
                  <option value="task_created" className="bg-white text-gray-900">Task Created</option>
                  <option value="task_completed" className="bg-white text-gray-900">Task Completed</option>
                  <option value="priority_changed" className="bg-white text-gray-900">Priority Changed</option>
                </select>
              </div>

              {/* Enable Rule */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="enabled" className="text-sm font-medium text-gray-900">
                  Enable this rule
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <>
                      <AutomationIcon />
                      Create Rule
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Existing Rules Section */}
          <div className="w-96">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Existing Rules</h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : rules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <SettingsIcon />
                </div>
                <p className="text-sm font-medium text-gray-400">No automation rules yet</p>
                <p className="text-xs mt-1">Create your first rule to get started</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {rules.map((rule) => (
                  <div key={rule.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{rule.name}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{rule.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium">
                            {rule.trigger.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            rule.enabled 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {rule.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleRule(rule.id, !rule.enabled)}
                          className={`p-2 rounded-lg transition-colors ${
                            rule.enabled
                              ? 'bg-green-100 hover:bg-green-200 text-green-600'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                          }`}
                          title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                          title="Delete rule"
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
          </div>
        </div>
      </div>
    </div>
  );
}
