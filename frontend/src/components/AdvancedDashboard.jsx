import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

const AdvancedDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [charts, setCharts] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [activeTab, setActiveTab] = useState('overview');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/dashboard/dashboard/overview?days=${timeRange}`);
      setDashboardData(response.data);
      setMetrics(response.data.metrics);
      setCharts(response.data.charts);
      setWidgets(response.data.widgets);
      setGoals(response.data.goals);
      setInsights(response.data.insights);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedMetrics = async () => {
    try {
      const response = await api.get(`/dashboard/dashboard/metrics?days=${timeRange}`);
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching detailed metrics:', error);
    }
  };

  const fetchChartSpecificData = async (chartType) => {
    try {
      const response = await api.get(`/dashboard/dashboard/charts?type=${chartType}&days=${timeRange}`);
      setCharts(response.data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const handleCreateGoal = async (goalData) => {
    try {
      await api.post('/dashboard/dashboard/goals', goalData);
      fetchDashboardData();
      setShowGoalForm(false);
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Error creating goal');
    }
  };

  const handleExportData = async () => {
    try {
      const response = await api.get(`/dashboard/dashboard/export?format=${exportFormat}&days=${timeRange}`);
      
      if (exportFormat === 'json') {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (exportFormat === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
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
            <h2 className="text-xl font-bold text-gray-800 mb-2">Advanced Dashboard</h2>
            <p className="text-sm text-gray-600">Comprehensive analytics and performance insights</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
            <button
              onClick={() => setShowGoalForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Set Goal
            </button>
            <div className="flex items-center gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
              <button
                onClick={handleExportData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {[
            { id: 'overview', label: 'Overview', icon: 'dashboard' },
            { id: 'metrics', label: 'Metrics', icon: 'analytics' },
            { id: 'charts', label: 'Charts', icon: 'bar_chart' },
            { id: 'goals', label: 'Goals', icon: 'flag' },
            { id: 'insights', label: 'Insights', icon: 'lightbulb' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'metrics') fetchDetailedMetrics();
                if (tab.id === 'charts') fetchChartSpecificData('all');
              }}
              className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Tasks</p>
                    <p className="text-2xl font-bold text-blue-900">{dashboardData.summary.total_tasks}</p>
                  </div>
                  <div className="text-blue-500 text-2xl">assignment</div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Completed</p>
                    <p className="text-2xl font-bold text-green-900">{dashboardData.summary.completed_tasks}</p>
                  </div>
                  <div className="text-green-500 text-2xl">check_circle</div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Productivity Score</p>
                    <p className="text-2xl font-bold text-purple-900">{dashboardData.summary.productivity_score}</p>
                  </div>
                  <div className="text-purple-500 text-2xl">speed</div>
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Current Streak</p>
                    <p className="text-2xl font-bold text-orange-900">{dashboardData.summary.current_streak}</p>
                  </div>
                  <div className="text-orange-500 text-2xl">local_fire_department</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tasks Today</span>
                    <span className="font-medium">{dashboardData.widgets.quick_stats.tasks_today}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed Today</span>
                    <span className="font-medium">{dashboardData.widgets.quick_stats.tasks_completed_today}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Productivity Today</span>
                    <span className="font-medium">{dashboardData.widgets.quick_stats.productivity_today}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Logged</span>
                    <span className="font-medium">{dashboardData.widgets.quick_stats.time_logged_today}h</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {dashboardData.widgets.recent_activity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{activity.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Deadlines</h3>
                <div className="space-y-3">
                  {dashboardData.widgets.upcoming_deadlines.map((deadline, index) => (
                    <div key={index} className="border-l-4 border-red-500 pl-3">
                      <p className="text-sm font-medium text-gray-800">{deadline.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(deadline.deadline).toLocaleDateString()}
                      </p>
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                        {deadline.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mini Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Completion Trend</h3>
                <div className="h-40 flex items-end justify-between gap-2">
                  {charts?.completion_trend?.slice(-7).map((data, index) => (
                    <div key={index} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${(data.completed / 10) * 100}%` }}>
                      <div className="text-xs text-white text-center pt-1">{data.completed}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  {charts?.completion_trend?.slice(-7).map((data, index) => (
                    <span key={index}>{new Date(data.date).toLocaleDateString('en', { weekday: 'short' })}</span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Distribution</h3>
                <div className="space-y-3">
                  {charts?.category_distribution?.map((category, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-24">{category.category}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-500 h-4 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{category.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && metrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Task Metrics */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Tasks</span>
                    <span className="font-medium">{metrics.task_metrics.total_tasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-medium">{metrics.task_metrics.completion_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Completion Time</span>
                    <span className="font-medium">{metrics.task_metrics.average_completion_time} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tasks per Day</span>
                    <span className="font-medium">{metrics.task_metrics.tasks_per_day}</span>
                  </div>
                </div>
              </div>

              {/* Time Metrics */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Time Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Hours</span>
                    <span className="font-medium">{metrics.time_metrics.total_hours_logged}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Average</span>
                    <span className="font-medium">{metrics.time_metrics.average_daily_hours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Focus Sessions</span>
                    <span className="font-medium">{metrics.time_metrics.focus_sessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Peak Hour</span>
                    <span className="font-medium">{metrics.time_metrics.most_productive_hour}:00</span>
                  </div>
                </div>
              </div>

              {/* Productivity Metrics */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Productivity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overall Score</span>
                    <span className="font-medium">{metrics.productivity_metrics.overall_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Task Efficiency</span>
                    <span className="font-medium">{metrics.productivity_metrics.task_completion_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Efficiency</span>
                    <span className="font-medium">{metrics.productivity_metrics.time_efficiency}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quality Score</span>
                    <span className="font-medium">{metrics.productivity_metrics.quality_score}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Metrics */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">vs Previous Period</h4>
                  <div className="space-y-2">
                    {Object.entries(metrics.comparison_metrics.vs_previous_period).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                        <span className={`font-medium ${value.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">vs Team Average</h4>
                  <div className="space-y-2">
                    {Object.entries(metrics.comparison_metrics.vs_team_average).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                        <span className={`font-medium ${value.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">vs Goals</h4>
                  <div className="space-y-2">
                    {Object.entries(metrics.comparison_metrics.vs_goals).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                        <span className={`font-medium ${parseInt(value) >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && charts && (
          <div className="space-y-6">
            {/* Chart Type Selector */}
            <div className="flex gap-2 mb-4">
              {['all', 'completion', 'category', 'priority', 'weekly', 'productivity', 'time'].map((type) => (
                <button
                  key={type}
                  onClick={() => fetchChartSpecificData(type)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors capitalize"
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Completion Trend */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Completion Trend</h3>
                <div className="h-64 flex items-end justify-between gap-1">
                  {charts.completion_trend?.map((data, index) => (
                    <div key={index} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${(data.completed / 15) * 100}%` }}>
                      <div className="text-xs text-white text-center pt-1">{data.completed}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  {charts.completion_trend?.filter((_, i) => i % 5 === 0).map((data, index) => (
                    <span key={index}>{new Date(data.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                  ))}
                </div>
              </div>

              {/* Category Distribution */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Distribution</h3>
                <div className="space-y-3">
                  {charts.category_distribution?.map((category, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-28">{category.category}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-6">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${category.percentage}%` }}
                        >
                          <span className="text-xs text-white font-medium">{category.percentage}%</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{category.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Analysis */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Priority Analysis</h3>
                <div className="space-y-4">
                  {charts.priority_analysis?.map((priority, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full ${
                        priority.priority === 'high' ? 'bg-red-500' :
                        priority.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{priority.priority}</span>
                          <span className="text-sm text-gray-600">{priority.count} tasks</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              priority.priority === 'high' ? 'bg-red-500' :
                              priority.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                            }`}
                            style={{ width: `${priority.completion_rate}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{priority.completion_rate}% completed</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Pattern */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Productivity Pattern</h3>
                <div className="space-y-3">
                  {charts.weekly_pattern?.map((day, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-20">{day.day}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full"
                          style={{ width: `${(day.tasks_completed / 15) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">{day.tasks_completed}</span>
                      <span className="text-sm text-gray-500 w-16">{day.productivity_score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            {/* Goal Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal) => (
                <div key={goal.id} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{goal.title}</h3>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      goal.status === 'exceeded' ? 'bg-green-100 text-green-800' :
                      goal.status === 'on_track' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {goal.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{goal.current} / {goal.target}</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          goal.progress >= 100 ? 'bg-green-500' :
                          goal.progress >= 75 ? 'bg-blue-500' :
                          goal.progress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${Math.min(100, goal.progress)}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{goal.progress.toFixed(1)}% complete</div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                    <span>{Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days left</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Goal Creation Form */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Goal</h3>
              <button
                onClick={() => setShowGoalForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create Goal
              </button>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {insights.map((insight, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-500 text-2xl">
                      {insight.type === 'productivity' ? 'trending_up' :
                       insight.type === 'improvement' ? 'show_chart' : 'psychology'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-2">{insight.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {Math.round(insight.confidence * 100)}% confidence
                        </span>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Goal Creation Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Create New Goal</h3>
              <button
                onClick={() => setShowGoalForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                close
              </button>
            </div>

            <GoalForm
              onSubmit={handleCreateGoal}
              onCancel={() => setShowGoalForm(false)}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Advanced dashboard provides comprehensive insights into your productivity and performance
          </p>
          <button
            onClick={fetchDashboardData}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

// Goal Form Component
const GoalForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target: '',
    metric: 'tasks_completed',
    deadline: ''
  });

  const metrics = [
    { value: 'tasks_completed', label: 'Tasks Completed' },
    { value: 'productivity_score', label: 'Productivity Score' },
    { value: 'completion_rate', label: 'Completion Rate' },
    { value: 'time_logged', label: 'Time Logged (hours)' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      target: parseInt(formData.target)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title *</label>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target *</label>
          <input
            type="number"
            value={formData.target}
            onChange={(e) => setFormData({ ...formData, target: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Metric *</label>
          <select
            value={formData.metric}
            onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            {metrics.map(metric => (
              <option key={metric.value} value={metric.value}>{metric.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
        <input
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Create Goal
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

export default AdvancedDashboard;
