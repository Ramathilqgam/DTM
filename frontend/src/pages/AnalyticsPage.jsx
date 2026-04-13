import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/analytics/dashboard?timeRange=${timeRange}`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const response = await api.post('/analytics/generate-report', { timeRange });
      // Create download link for the report
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${timeRange}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num) => {
    return `${num.toFixed(1)}%`;
  };

  const timeRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#16213e] text-white">
      {/* Header */}
      <div className="border-b border-zinc-800/50 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-xl font-bold">
                📊
              </div>
              <div>
                <h1 className="text-2xl font-bold">Advanced Analytics & Reports</h1>
                <p className="text-sm text-gray-400">Comprehensive insights into your productivity and performance</p>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <Link to="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link to="/tasks" className="text-zinc-400 hover:text-white transition-colors">
                Tasks
              </Link>
              <Link to="/ai-assistant" className="text-zinc-400 hover:text-white transition-colors">
                AI Assistant
              </Link>
              <Link to="/skill-development" className="text-zinc-400 hover:text-white transition-colors">
                Skills
              </Link>
              <Link to="/collaboration" className="text-zinc-400 hover:text-white transition-colors">
                Collaboration
              </Link>
              <Link to="/gamification" className="text-zinc-400 hover:text-white transition-colors">
                Gamification
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeRange === range.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button
            onClick={generateReport}
            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
          >
            📥 Generate Report
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-zinc-900/50 p-1 rounded-xl">
          {['overview', 'productivity', 'tasks', 'skills', 'team', 'trends'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              {tab === 'overview' && '📈 Overview'}
              {tab === 'productivity' && '⚡ Productivity'}
              {tab === 'tasks' && '📋 Tasks'}
              {tab === 'skills' && '🚀 Skills'}
              {tab === 'team' && '👥 Team'}
              {tab === 'trends' && '📊 Trends'}
            </button>
          ))}
        </div>

        {/* Content */}
        {analyticsData && (
          <div className="space-y-8">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/20 border border-blue-700/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Total Tasks</h3>
                    <span className="text-2xl font-bold text-blue-400">{formatNumber(analyticsData.stats?.total || 0)}</span>
                  </div>
                  <div className="text-sm text-zinc-300">
                    <div className="flex justify-between mb-2">
                      <span>Completed</span>
                      <span className="text-green-400">{formatNumber(analyticsData.stats?.completed || 0)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>In Progress</span>
                      <span className="text-yellow-400">{formatNumber(analyticsData.stats?.in_progress || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending</span>
                      <span className="text-orange-400">{formatNumber(analyticsData.stats?.pending || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-900/30 to-green-950/20 border border-green-700/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Completion Rate</h3>
                    <span className="text-2xl font-bold text-green-400">{formatPercentage(analyticsData.stats?.completion_rate || 0)}</span>
                  </div>
                  <div className="w-full bg-green-700/50 rounded-full h-2 mt-4">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${analyticsData.stats?.completion_rate || 0}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/30 to-purple-950/20 border border-purple-700/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Productivity Score</h3>
                    <span className="text-2xl font-bold text-purple-400">{formatPercentage(analyticsData.stats?.productivity || 0)}</span>
                  </div>
                  <div className="text-sm text-zinc-300 space-y-2">
                    <div className="flex justify-between">
                      <span>This Week</span>
                      <span className="text-purple-400">+{analyticsData.stats?.weekly_productivity || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Month</span>
                      <span className="text-purple-400">+{analyticsData.stats?.monthly_productivity || 0}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-900/30 to-orange-950/20 border border-orange-700/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Active Hours</h3>
                    <span className="text-2xl font-bold text-orange-400">{formatNumber(analyticsData.stats?.active_hours || 0)}h</span>
                  </div>
                  <div className="text-sm text-zinc-300">
                    <div className="flex justify-between">
                      <span>Daily Average</span>
                      <span className="text-orange-400">{formatNumber(analyticsData.stats?.daily_average || 0)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peak Time</span>
                      <span className="text-orange-400">{analyticsData.stats?.peak_time || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'productivity' && (
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">⚡ Productivity Analysis</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Time Distribution</h4>
                      <div className="space-y-3">
                        {['Morning', 'Afternoon', 'Evening', 'Night'].map((period) => (
                          <div key={period} className="flex items-center justify-between">
                            <span className="text-zinc-300">{period}</span>
                            <div className="flex-1 bg-zinc-700 rounded-full h-2">
                              <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                                style={{ width: `${Math.random() * 40 + 20}%` }}
                              />
                            </div>
                            <span className="text-zinc-300 text-sm">{Math.floor(Math.random() * 8 + 2)}h</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Focus Patterns</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-300">Most Productive Day</span>
                          <span className="text-green-400">Wednesday</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-300">Best Focus Period</span>
                          <span className="text-green-400">9:00 - 11:00 AM</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-300">Average Session Length</span>
                          <span className="text-green-400">45 minutes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Efficiency Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-zinc-800 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">87%</div>
                      <div className="text-sm text-zinc-300">Task Efficiency</div>
                    </div>
                    <div className="text-center p-4 bg-zinc-800 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">92%</div>
                      <div className="text-sm text-zinc-300">Time Utilization</div>
                    </div>
                    <div className="text-center p-4 bg-zinc-800 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">4.2h</div>
                      <div className="text-sm text-zinc-300">Deep Work Sessions</div>
                    </div>
                    <div className="text-center p-4 bg-zinc-800 rounded-lg">
                      <div className="text-2xl font-bold text-orange-400">23</div>
                      <div className="text-sm text-zinc-300">Tasks/Day Average</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">📋 Task Analytics</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Task Completion Trends</h4>
                      <div className="h-48 bg-zinc-800 rounded-lg p-4 flex items-end gap-1">
                        {[65, 78, 82, 91, 87, 92, 88, 95, 89, 91, 94].map((height, idx) => (
                          <div
                            key={idx}
                            className="flex-1 bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-400"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-zinc-400">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, idx) => (
                          <span key={idx} className="flex-1 text-center">{day}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Priority Distribution</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-red-400">High Priority</span>
                          <div className="flex-1 bg-zinc-700 rounded-full h-2">
                            <div 
                              className="h-full bg-red-500 rounded-full transition-all duration-300"
                              style={{ width: '25%' }}
                            />
                          </div>
                          <span className="text-zinc-300 text-sm">25%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-yellow-400">Medium Priority</span>
                          <div className="flex-1 bg-zinc-700 rounded-full h-2">
                            <div 
                              className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                              style={{ width: '45%' }}
                            />
                          </div>
                          <span className="text-zinc-300 text-sm">45%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-green-400">Low Priority</span>
                          <div className="flex-1 bg-zinc-700 rounded-full h-2">
                            <div 
                              className="h-full bg-green-500 rounded-full transition-all duration-300"
                              style={{ width: '30%' }}
                            />
                          </div>
                          <span className="text-zinc-300 text-sm">30%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">🚀 Skill Development Progress</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {['Technical', 'Soft Skills', 'Business', 'Personal'].map((category) => (
                      <div key={category} className="bg-zinc-800 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-white mb-4">{category}</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-300">Current Level</span>
                            <span className="text-indigo-400 font-semibold">Intermediate</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-300">Progress</span>
                            <span className="text-green-400 font-semibold">67%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-300">Tasks Completed</span>
                            <span className="text-green-400 font-semibold">12</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-300">Time Invested</span>
                            <span className="text-blue-400 font-semibold">24h</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">👥 Team Performance</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Team Overview</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-300">Total Members</span>
                          <span className="text-white font-semibold">12</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-300">Active Now</span>
                          <span className="text-green-400 font-semibold">8</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-300">Avg. Productivity</span>
                          <span className="text-blue-400 font-semibold">78%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Top Performers</h4>
                      <div className="space-y-3">
                        {[
                          { name: 'Sarah Chen', score: 94, tasks: 45, avatar: 'SC' },
                          { name: 'Mike Johnson', score: 87, tasks: 38, avatar: 'MJ' },
                          { name: 'Emma Davis', score: 82, tasks: 32, avatar: 'ED' }
                        ].map((member, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                            <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center text-sm font-bold">
                              {member.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-semibold">{member.name}</span>
                                <span className="text-green-400 font-bold">{member.score}%</span>
                              </div>
                              <div className="text-sm text-zinc-400">
                                {member.tasks} tasks completed
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">📊 Performance Trends</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Monthly Progress</h4>
                      <div className="h-48 bg-zinc-800 rounded-lg p-4 flex items-end gap-1">
                        {[45, 52, 48, 65, 72, 68, 81, 85, 92, 88, 95].map((height, idx) => (
                          <div
                            key={idx}
                            className="flex-1 bg-purple-500 rounded-t-sm transition-all duration-300 hover:bg-purple-400"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-zinc-400">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => (
                          <span key={idx} className="flex-1 text-center">{month}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Key Insights</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">📈</span>
                            <span className="text-green-300">Productivity increased by 23% this month</span>
                          </div>
                        </div>
                        <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-400">🎯</span>
                            <span className="text-blue-300">Best performance on Wednesdays</span>
                          </div>
                        </div>
                        <div className="p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-purple-400">⚡</span>
                            <span className="text-purple-300">Peak hours: 9 AM - 12 PM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

