import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

const SmartSuggestions = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('immediate');

  useEffect(() => {
    fetchSmartSuggestions();
  }, []);

  const fetchSmartSuggestions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ai/smart-suggestions');
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching smart suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      high: 'bg-red-900/30 text-red-300 border-red-700/50',
      medium: 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50',
      low: 'bg-green-900/30 text-green-300 border-green-700/50'
    };
    return colors[urgency] || colors.medium;
  };

  const getInsightTypeColor = (type) => {
    const colors = {
      strength: 'bg-green-900/30 border-green-700/50 text-green-300',
      improvement: 'bg-orange-900/30 border-orange-700/50 text-orange-300',
      pattern: 'bg-blue-900/30 border-blue-700/50 text-blue-300'
    };
    return colors[type] || colors.pattern;
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!suggestions) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-800">
        <p className="text-gray-400">No suggestions available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white mb-2">Smart Suggestions</h2>
        <p className="text-sm text-gray-400">Personalized recommendations based on your task patterns and productivity</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex -mb-px">
          {[
            { id: 'immediate', label: 'Immediate Actions', count: suggestions.suggestions?.immediate_actions?.length || 0 },
            { id: 'skills', label: 'Skill Development', count: suggestions.suggestions?.skill_development?.length || 0 },
            { id: 'productivity', label: 'Productivity', count: suggestions.suggestions?.productivity_boosters?.length || 0 },
            { id: 'insights', label: 'Insights', count: suggestions.insights?.length || 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'immediate' && (
          <div className="space-y-4">
            {suggestions.suggestions?.immediate_actions?.length > 0 ? (
              suggestions.suggestions.immediate_actions.map((suggestion, index) => (
                <div key={index} className="border border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-800/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">{suggestion.title}</h3>
                      <p className="text-sm text-gray-300 mb-3">{suggestion.description}</p>
                      {suggestion.action && (
                        <div className="bg-blue-900/30 border border-blue-700/50 rounded p-3">
                          <p className="text-sm text-blue-300">
                            <span className="font-medium">Action:</span> {suggestion.action}
                          </p>
                        </div>
                      )}
                    </div>
                    {suggestion.urgency && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${getUrgencyColor(suggestion.urgency)}`}>
                        {suggestion.urgency}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No immediate actions needed. Great job staying on top of your tasks!</p>
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-4">
            {suggestions.suggestions?.skill_development?.length > 0 ? (
              suggestions.suggestions.skill_development.map((suggestion, index) => (
                <div key={index} className="border border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-800/50">
                  <h3 className="font-semibold text-white mb-2">{suggestion.title}</h3>
                  <p className="text-sm text-gray-300 mb-3">{suggestion.description}</p>
                  
                  {suggestion.next_step && (
                    <div className="mb-3">
                      <span className="font-medium text-sm text-gray-300">Next Step:</span>
                      <p className="text-sm text-gray-400">{suggestion.next_step}</p>
                    </div>
                  )}
                  
                  {suggestion.estimated_time && (
                    <div className="flex items-center text-sm text-gray-400">
                      <span className="mr-1">clock</span>
                      {suggestion.estimated_time}
                    </div>
                  )}
                  
                  {suggestion.suggested_areas && (
                    <div className="mt-3">
                      <span className="font-medium text-sm text-gray-300">Suggested Areas:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {suggestion.suggested_areas.map((area, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs border border-purple-700/50">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400">Continue your current learning path. You're doing great!</p>
            )}
          </div>
        )}

        {activeTab === 'productivity' && (
          <div className="space-y-4">
            {suggestions.suggestions?.productivity_boosters?.length > 0 ? (
              suggestions.suggestions.productivity_boosters.map((suggestion, index) => (
                <div key={index} className="border border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-800/50">
                  <h3 className="font-semibold text-white mb-2">{suggestion.title}</h3>
                  <p className="text-sm text-gray-300 mb-3">{suggestion.description}</p>
                  
                  {suggestion.strategy && (
                    <div className="bg-green-900/30 border border-green-700/50 rounded p-3 mb-3">
                      <p className="text-sm text-green-300">
                        <span className="font-medium">Strategy:</span> {suggestion.strategy}
                      </p>
                    </div>
                  )}
                  
                  {suggestion.expected_improvement && (
                    <div className="text-sm text-green-400 font-medium">
                      Expected improvement: {suggestion.expected_improvement}
                    </div>
                  )}
                  
                  {suggestion.benefit && (
                    <div className="text-sm text-blue-400 font-medium">
                      Benefit: {suggestion.benefit}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400">Your productivity is on track! Keep up the good work.</p>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            {suggestions.insights?.length > 0 ? (
              suggestions.insights.map((insight, index) => (
                <div key={index} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getInsightTypeColor(insight.type)}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 mt-1">
                      {insight.type === 'strength' && <span className="text-green-400 text-sm">star</span>}
                      {insight.type === 'improvement' && <span className="text-orange-400 text-sm">trending_up</span>}
                      {insight.type === 'pattern' && <span className="text-blue-400 text-sm">analytics</span>}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-white">{insight.message}</h3>
                      <p className="text-sm text-gray-300">{insight.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Not enough data yet to generate insights. Keep completing tasks!</p>
            )}
          </div>
        )}

        {/* Personalized Recommendations */}
        {suggestions.recommendations?.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="font-semibold text-white mb-4">Personalized Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.recommendations.map((rec, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-300 mb-2">{rec.title}</h4>
                  <p className="text-sm text-blue-400 mb-2">{rec.message}</p>
                  <p className="text-sm text-blue-500">{rec.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-800 border-t border-gray-700 rounded-b-lg">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Last updated: {new Date(suggestions.timestamp).toLocaleString()}
          </p>
          <button
            onClick={fetchSmartSuggestions}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
          >
            Refresh Suggestions
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartSuggestions;
