import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

const PriorityMatrix = () => {
  const { user } = useAuth();
  const [matrixData, setMatrixData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [insights, setInsights] = useState(null);
  const [activeView, setActiveView] = useState('matrix');

  useEffect(() => {
    fetchMatrixData();
  }, []);

  const fetchMatrixData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/priority-matrix/matrix');
      setMatrixData(response.data);
    } catch (error) {
      console.error('Error fetching priority matrix data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await api.get('/priority-matrix/matrix-insights');
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const handleTaskClick = async (task) => {
    try {
      const response = await api.post('/priority-matrix/analyze-task', {
        task_id: task.id
      });
      setSelectedTask(response.data);
    } catch (error) {
      console.error('Error analyzing task:', error);
    }
  };

  const handleMoveTask = async (taskId, newQuadrant) => {
    try {
      await api.post('/priority-matrix/update-task-quadrant', {
        task_id: taskId,
        quadrant: newQuadrant
      });
      fetchMatrixData(); // Refresh data
      setSelectedTask(null); // Close detail view
    } catch (error) {
      console.error('Error moving task:', error);
      alert('Error moving task');
    }
  };

  const getQuadrantColor = (quadrant) => {
    const colors = {
      urgent_important: 'bg-red-50 border-red-200',
      important_not_urgent: 'bg-blue-50 border-blue-200',
      urgent_not_important: 'bg-orange-50 border-orange-200',
      not_urgent_not_important: 'bg-gray-50 border-gray-200'
    };
    return colors[quadrant] || colors.not_urgent_not_important;
  };

  const getQuadrantHeaderColor = (quadrant) => {
    const colors = {
      urgent_important: 'bg-red-500 text-white',
      important_not_urgent: 'bg-blue-500 text-white',
      urgent_not_important: 'bg-orange-500 text-white',
      not_urgent_not_important: 'bg-gray-500 text-white'
    };
    return colors[quadrant] || colors.not_urgent_not_important;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!matrixData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-500">No priority matrix data available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Eisenhower Priority Matrix</h2>
            <p className="text-sm text-gray-600">Organize tasks by urgency and importance</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-600">
              {matrixData.summary?.total_tasks || 0}
            </div>
            <p className="text-sm text-gray-500">Total Tasks</p>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {[
            { id: 'matrix', label: 'Matrix View', icon: 'grid_view' },
            { id: 'insights', label: 'Insights', icon: 'insights' },
            { id: 'summary', label: 'Summary', icon: 'summarize' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveView(tab.id);
                if (tab.id === 'insights') fetchInsights();
              }}
              className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeView === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeView === 'matrix' && (
          <div className="space-y-6">
            {/* Matrix Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Urgent & Important */}
              <div className={`border-2 rounded-lg p-4 ${getQuadrantColor('urgent_important')}`}>
                <div className={`rounded-t p-3 mb-3 ${getQuadrantHeaderColor('urgent_important')}`}>
                  <h3 className="font-bold text-lg">{matrixData.quadrants.urgent_important.name}</h3>
                  <p className="text-sm opacity-90">{matrixData.quadrants.urgent_important.action}</p>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {matrixData.matrix.urgent_important.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className="bg-white rounded p-3 cursor-pointer hover:shadow-md transition-shadow border"
                    >
                      <div className="font-medium text-gray-800">{task.title}</div>
                      <div className="text-sm text-gray-600">
                        {task.deadline && `Due: ${new Date(task.deadline).toLocaleDateString()}`}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          U: {task.urgency_score.toFixed(2)} | I: {task.importance_score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {matrixData.matrix.urgent_important.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No tasks in this quadrant</p>
                  )}
                </div>
              </div>

              {/* Important & Not Urgent */}
              <div className={`border-2 rounded-lg p-4 ${getQuadrantColor('important_not_urgent')}`}>
                <div className={`rounded-t p-3 mb-3 ${getQuadrantHeaderColor('important_not_urgent')}`}>
                  <h3 className="font-bold text-lg">{matrixData.quadrants.important_not_urgent.name}</h3>
                  <p className="text-sm opacity-90">{matrixData.quadrants.important_not_urgent.action}</p>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {matrixData.matrix.important_not_urgent.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className="bg-white rounded p-3 cursor-pointer hover:shadow-md transition-shadow border"
                    >
                      <div className="font-medium text-gray-800">{task.title}</div>
                      <div className="text-sm text-gray-600">
                        {task.deadline && `Due: ${new Date(task.deadline).toLocaleDateString()}`}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          U: {task.urgency_score.toFixed(2)} | I: {task.importance_score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {matrixData.matrix.important_not_urgent.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No tasks in this quadrant</p>
                  )}
                </div>
              </div>

              {/* Urgent & Not Important */}
              <div className={`border-2 rounded-lg p-4 ${getQuadrantColor('urgent_not_important')}`}>
                <div className={`rounded-t p-3 mb-3 ${getQuadrantHeaderColor('urgent_not_important')}`}>
                  <h3 className="font-bold text-lg">{matrixData.quadrants.urgent_not_important.name}</h3>
                  <p className="text-sm opacity-90">{matrixData.quadrants.urgent_not_important.action}</p>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {matrixData.matrix.urgent_not_important.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className="bg-white rounded p-3 cursor-pointer hover:shadow-md transition-shadow border"
                    >
                      <div className="font-medium text-gray-800">{task.title}</div>
                      <div className="text-sm text-gray-600">
                        {task.deadline && `Due: ${new Date(task.deadline).toLocaleDateString()}`}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          U: {task.urgency_score.toFixed(2)} | I: {task.importance_score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {matrixData.matrix.urgent_not_important.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No tasks in this quadrant</p>
                  )}
                </div>
              </div>

              {/* Not Urgent & Not Important */}
              <div className={`border-2 rounded-lg p-4 ${getQuadrantColor('not_urgent_not_important')}`}>
                <div className={`rounded-t p-3 mb-3 ${getQuadrantHeaderColor('not_urgent_not_important')}`}>
                  <h3 className="font-bold text-lg">{matrixData.quadrants.not_urgent_not_important.name}</h3>
                  <p className="text-sm opacity-90">{matrixData.quadrants.not_urgent_not_important.action}</p>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {matrixData.matrix.not_urgent_not_important.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className="bg-white rounded p-3 cursor-pointer hover:shadow-md transition-shadow border"
                    >
                      <div className="font-medium text-gray-800">{task.title}</div>
                      <div className="text-sm text-gray-600">
                        {task.deadline && `Due: ${new Date(task.deadline).toLocaleDateString()}`}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          U: {task.urgency_score.toFixed(2)} | I: {task.importance_score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {matrixData.matrix.not_urgent_not_important.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No tasks in this quadrant</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(matrixData.matrix).map(([quadrant, tasks]) => (
                <div key={quadrant} className="text-center">
                  <div className="text-2xl font-bold" style={{ color: matrixData.quadrants[quadrant].color }}>
                    {tasks.length}
                  </div>
                  <p className="text-sm text-gray-600">{matrixData.quadrants[quadrant].name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'insights' && insights && (
          <div className="space-y-6">
            {/* Distribution Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Distribution Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">Balance Score</h4>
                  <div className="text-2xl font-bold text-purple-600">
                    {insights.distribution_analysis?.balance_score?.toFixed(1) || 0}%
                  </div>
                  <p className="text-sm text-purple-600">How well-balanced your tasks are</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Focus Efficiency</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {insights.productivity_patterns?.focus_efficiency?.toFixed(1) || 0}%
                  </div>
                  <p className="text-sm text-blue-600">Focus on important tasks</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h3>
              <div className="space-y-3">
                {matrixData.recommendations.map((rec, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-1">{rec.message}</h4>
                        <p className="text-sm text-gray-600">Action: {rec.action.replace('_', ' ')}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                  </div>
                ))}
                {matrixData.recommendations.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Great job! Your task distribution looks optimal.</p>
                )}
              </div>
            </div>

            {/* Time Management Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Time Management Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Strategic Tasks</h4>
                  <div className="text-xl font-bold text-blue-600">
                    {insights.time_management?.strategic_tasks || 0}
                  </div>
                  <p className="text-sm text-gray-600">Important but not urgent</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Delegation Opportunities</h4>
                  <div className="text-xl font-bold text-orange-600">
                    {insights.productivity_patterns?.delegation_opportunities || 0}
                  </div>
                  <p className="text-sm text-gray-600">Tasks you could delegate</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'summary' && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {matrixData.matrix.urgent_important.length}
                </div>
                <p className="text-sm text-red-800">Do First</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {matrixData.matrix.important_not_urgent.length}
                </div>
                <p className="text-sm text-blue-800">Schedule</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {matrixData.matrix.urgent_not_important.length}
                </div>
                <p className="text-sm text-orange-800">Delegate</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {matrixData.matrix.not_urgent_not_important.length}
                </div>
                <p className="text-sm text-gray-800">Eliminate</p>
              </div>
            </div>

            {/* Key Priorities */}
            {matrixData.summary?.key_priorities?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Priorities (Do First)</h3>
                <div className="space-y-2">
                  {matrixData.summary.key_priorities.map((priority, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <span className="text-red-600">priority_high</span>
                      <span className="font-medium text-gray-800">{priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Workload Status */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Workload Assessment</h3>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-purple-800">Current Status</h4>
                    <p className="text-sm text-purple-600 capitalize">
                      {matrixData.summary?.workload_status || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      {matrixData.summary?.productivity_score?.toFixed(1) || 0}%
                    </div>
                    <p className="text-sm text-purple-600">Productivity Score</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Allocation Suggestions */}
            {matrixData.summary?.time_allocation && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Suggested Time Allocation</h3>
                <div className="space-y-2">
                  {Object.entries(matrixData.summary.time_allocation).map(([quadrant, percentage]) => (
                    <div key={quadrant} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-800 capitalize">
                        {quadrant.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-purple-600">{percentage}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Task Analysis</h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                close
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800">{selectedTask.task?.title}</h4>
                <p className="text-sm text-gray-600">{selectedTask.task?.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Urgency Score</div>
                  <div className="text-lg font-bold text-red-600">
                    {selectedTask.urgency_score?.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Importance Score</div>
                  <div className="text-lg font-bold text-blue-600">
                    {selectedTask.importance_score?.toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">Current Quadrant</div>
                <div className={`px-3 py-2 rounded-lg text-center font-medium ${getQuadrantHeaderColor(selectedTask.quadrant)}`}>
                  {matrixData.quadrants[selectedTask.quadrant]?.name}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">Suggested Action</div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-purple-800 font-medium">
                    {selectedTask.analysis?.suggested_action}
                  </p>
                  <p className="text-purple-600 text-sm">
                    Timeframe: {selectedTask.analysis?.time_frame}
                  </p>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">Move to Different Quadrant</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(matrixData.quadrants).map(([quadrant, info]) => (
                    <button
                      key={quadrant}
                      onClick={() => handleMoveTask(selectedTask.task_id, quadrant)}
                      disabled={quadrant === selectedTask.quadrant}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                        quadrant === selectedTask.quadrant
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {info.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Focus on urgent & important tasks first, schedule important tasks, delegate urgent tasks, eliminate low-value tasks
          </p>
          <button
            onClick={fetchMatrixData}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Refresh Matrix
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriorityMatrix;
