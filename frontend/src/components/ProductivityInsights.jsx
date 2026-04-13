import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

const ProductivityInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProductivityInsights();
  }, []);

  const fetchProductivityInsights = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ai/productivity-insights');
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching productivity insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
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

  if (!insights) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-500">No productivity insights available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Productivity Insights</h2>
            <p className="text-sm text-gray-600">Weekly analysis and personalized recommendations</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(insights.productivity_score)}`}>
              {insights.productivity_score}%
            </div>
            <p className="text-sm text-gray-500">Productivity Score</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {[
            { id: 'overview', label: 'Weekly Overview' },
            { id: 'time', label: 'Time Analysis' },
            { id: 'recommendations', label: 'Recommendations' },
            { id: 'achievements', label: 'Achievements' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Week Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {insights.weekly_report?.week_overview?.total_tasks || 0}
                </div>
                <p className="text-sm text-blue-800">Total Tasks</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {insights.weekly_report?.week_overview?.completed_tasks || 0}
                </div>
                <p className="text-sm text-green-800">Completed</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(insights.weekly_report?.week_overview?.completion_rate || 0)}%
                </div>
                <p className="text-sm text-purple-800">Completion Rate</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {insights.weekly_report?.productivity_trends?.streak_days?.current_streak || 0}
                </div>
                <p className="text-sm text-orange-800">Day Streak</p>
              </div>
            </div>

            {/* Daily Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Performance</h3>
              <div className="space-y-3">
                {insights.weekly_report?.daily_breakdown?.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{day.day}</div>
                      <div className="text-sm text-gray-500">{day.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">{day.tasks_completed} tasks</div>
                      <div className="text-sm text-gray-500">Score: {day.productivity_score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Priority Analysis */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">By Priority</h4>
                  {Object.entries(insights.weekly_report?.task_analysis?.by_priority?.completion_rates || {}).map(([priority, rate]) => (
                    <div key={priority} className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 capitalize">{priority}</span>
                      <span className="text-sm font-medium">{Math.round(rate)}%</span>
                    </div>
                  ))}
                </div>

                {/* Category Analysis */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">By Category</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Object.entries(insights.weekly_report?.task_analysis?.by_category?.completion_rates || {}).map(([category, rate]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">{category}</span>
                        <span className="text-sm font-medium">{Math.round(rate)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulty Analysis */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">By Difficulty</h4>
                  {Object.entries(insights.weekly_report?.task_analysis?.by_difficulty?.completion_rates || {}).map(([difficulty, rate]) => (
                    <div key={difficulty} className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 capitalize">{difficulty}</span>
                      <span className="text-sm font-medium">{Math.round(rate)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'time' && (
          <div className="space-y-6">
            {/* Time Management Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Work Distribution</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Morning (6-12)</span>
                    <span className="text-sm font-medium">{insights.time_analysis?.work_distribution?.morning_productivity || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Afternoon (12-18)</span>
                    <span className="text-sm font-medium">{insights.time_analysis?.work_distribution?.afternoon_productivity || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Evening (18-24)</span>
                    <span className="text-sm font-medium">{insights.time_analysis?.work_distribution?.evening_productivity || 0}%</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {insights.time_analysis?.work_distribution?.recommended_schedule || 'Focus on important tasks during your peak hours'}
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Deadline Management</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">On-time Completion</span>
                    <span className="text-sm font-medium">{insights.time_analysis?.deadline_management?.on_time_completion_rate || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overdue Tasks</span>
                    <span className="text-sm font-medium text-red-600">{insights.time_analysis?.deadline_management?.overdue_tasks || 0}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    insights.time_analysis?.deadline_management?.deadline_adherence === 'good' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {insights.time_analysis?.deadline_management?.deadline_adherence || 'Good'} Adherence
                  </span>
                </div>
              </div>
            </div>

            {/* Peak Hours */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Peak Productivity Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Most Productive Hours</h4>
                  <div className="flex flex-wrap gap-2">
                    {insights.time_analysis?.optimal_work_times?.peak_productivity_hours?.map((hour) => (
                      <span key={hour} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        {hour}:00
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Lower Energy Hours</h4>
                  <div className="flex flex-wrap gap-2">
                    {insights.time_analysis?.optimal_work_times?.low_energy_hours?.map((hour) => (
                      <span key={hour} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                        {hour}:00
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Time Wasters */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Potential Time Wasters</h3>
              <div className="space-y-2">
                {insights.time_analysis?.time_wasters?.map((waster, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-red-50 rounded">
                    <span className="text-red-600">warning</span>
                    <span className="text-sm text-red-800">{waster}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {Object.entries(insights.improvements || {}).map(([category, recommendations]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
                  {category.replace('_', ' ')}
                </h3>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{rec.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rec.difficulty === 'low' ? 'bg-green-100 text-green-800' :
                          rec.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rec.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600 font-medium">Benefit: {rec.benefit}</span>
                        <span className="text-gray-500">Implementation: {rec.implementation_time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {/* Weekly Achievements */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.weekly_report?.achievements?.map((achievement, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-800">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-orange-600">+{achievement.points} points</span>
                    </div>
                  </div>
                ))}
              </div>
              {(!insights.weekly_report?.achievements || insights.weekly_report.achievements.length === 0) && (
                <p className="text-gray-500 text-center py-8">Complete more tasks to unlock achievements!</p>
              )}
            </div>

            {/* Areas for Improvement */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Areas for Improvement</h3>
              <div className="space-y-3">
                {insights.weekly_report?.areas_for_improvement?.map((area, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-orange-600 mt-1">trending_up</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-1">{area.area}</h4>
                        <p className="text-sm text-gray-600 mb-2">{area.issue}</p>
                        <div className="p-2 bg-blue-50 rounded">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Suggestion:</span> {area.suggestion}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        area.priority === 'high' ? 'bg-red-100 text-red-800' :
                        area.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {area.priority}
                      </span>
                    </div>
                  </div>
                ))}
                {(!insights.weekly_report?.areas_for_improvement || insights.weekly_report.areas_for_improvement.length === 0) && (
                  <p className="text-green-600 text-center py-8">Great job! No major areas for improvement identified.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Report generated: {new Date(insights.generated_at).toLocaleString()}
          </p>
          <button
            onClick={fetchProductivityInsights}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh Insights
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductivityInsights;
