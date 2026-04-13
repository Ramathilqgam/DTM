import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function AITaskSuggestions({ tasks, userRole }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateSuggestions();
  }, [tasks]);

  const generateSuggestions = async () => {
    setLoading(true);
    
    // Auto-priority detection
    const highPriorityTasks = tasks?.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      const now = new Date();
      const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);
      return hoursUntilDue < 24 && task.status !== 'completed';
    });

    // Pending overload detection
    const pendingCount = tasks?.filter(t => t.status === 'pending').length || 0;
    
    const newSuggestions = [];

    // High priority alert
    if (highPriorityTasks.length > 0) {
      newSuggestions.push({
        type: 'urgent',
        icon: '🔥',
        title: 'Urgent Tasks Detected',
        message: `${highPriorityTasks.length} task${highPriorityTasks.length > 1 ? 's' : ''} due within 24 hours`,
        action: 'Focus on these first',
        tasks: highPriorityTasks.slice(0, 3)
      });
    }

    // Pending overload alert
    if (pendingCount > 5) {
      newSuggestions.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Task Overload',
        message: `You have ${pendingCount} pending tasks`,
        action: 'Consider delegating or postponing',
        priority: 'high'
      });
    }

    // Smart scheduling suggestion
    const hour = new Date().getHours();
    let bestTime = 'Morning';
    if (hour >= 12 && hour < 17) bestTime = 'Afternoon';
    else if (hour >= 17) bestTime = 'Evening';

    if (tasks?.filter(t => t.status === 'pending').length > 0) {
      const nextTask = tasks
        .filter(t => t.status === 'pending')
        .sort((a, b) => {
          // Sort by priority first, then by due date
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          if (priorityDiff !== 0) return -priorityDiff;
          
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        })[0];

      if (nextTask) {
        newSuggestions.push({
          type: 'suggestion',
          icon: '💡',
          title: 'AI Recommendation',
          message: `Best time to complete "${nextTask.title}": ${bestTime}`,
          action: 'Start with this task',
          task: nextTask,
          reasoning: `Based on your activity patterns and task priority`
        });
      }
    }

    // Productivity boost suggestion
    const completedToday = tasks?.filter(t => {
      const today = new Date().toDateString();
      const taskDate = new Date(t.updated_at || t.created_at).toDateString();
      return t.status === 'completed' && taskDate === today;
    }).length || 0;

    if (completedToday === 0 && pendingCount > 0) {
      newSuggestions.push({
        type: 'motivation',
        icon: '🚀',
        title: 'Start Strong Today',
        message: 'Complete one task to build momentum',
        action: 'Choose a quick win task',
        priority: 'medium'
      });
    }

    setSuggestions(newSuggestions.slice(0, 3)); // Limit to top 3 suggestions
    setLoading(false);
  };

  if (suggestions.length === 0 && !loading) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-green-900/30 to-green-950/20 border border-green-700/30">
        <div className="text-center">
          <span className="text-4xl mb-4">🎉</span>
          <h3 className="text-lg font-bold text-green-400 mb-2">All Caught Up!</h3>
          <p className="text-sm text-gray-400">No immediate suggestions. You're doing great!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 to-purple-950/20 border border-purple-700/30">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🤖</span>
        <div>
          <h3 className="text-xl font-bold">AI Task Assistant</h3>
          <p className="text-sm text-gray-400">Smart recommendations for your productivity</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-500 rounded-full animate-spin" />
          <span className="ml-3 text-gray-400">Analyzing your tasks...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-all duration-300 hover:scale-102 ${
                suggestion.type === 'urgent' ? 'bg-red-950/40 border-red-700/50 hover:border-red-600' :
                suggestion.type === 'warning' ? 'bg-orange-950/40 border-orange-700/50 hover:border-orange-600' :
                suggestion.type === 'motivation' ? 'bg-green-950/40 border-green-700/50 hover:border-green-600' :
                'bg-blue-950/40 border-blue-700/50 hover:border-blue-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{suggestion.icon}</span>
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${
                    suggestion.type === 'urgent' ? 'text-red-400' :
                    suggestion.type === 'warning' ? 'text-orange-400' :
                    suggestion.type === 'motivation' ? 'text-green-400' :
                    'text-blue-400'
                  }`}>
                    {suggestion.title}
                  </h4>
                  <p className="text-sm text-gray-300 mb-2">{suggestion.message}</p>
                  
                  {suggestion.task && (
                    <div className="p-3 rounded-lg bg-black/20 mb-2">
                      <p className="font-medium text-white mb-1">{suggestion.task.title}</p>
                      <p className="text-xs text-gray-400">
                        Priority: {suggestion.task.priority} • 
                        Due: {suggestion.task.due_date ? new Date(suggestion.task.due_date).toLocaleDateString() : 'No deadline'}
                      </p>
                    </div>
                  )}

                  {suggestion.tasks && (
                    <div className="space-y-2 mb-2">
                      {suggestion.tasks.map((task, taskIndex) => (
                        <div key={taskIndex} className="p-2 rounded bg-black/20">
                          <p className="text-sm text-white">{task.title}</p>
                          <p className="text-xs text-gray-400">
                            Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No deadline'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{suggestion.reasoning || suggestion.action}</span>
                    {suggestion.type === 'suggestion' && (
                      <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors">
                        Start Task
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
