import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

const AITaskAssistant = ({ onTasksGenerated }) => {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [context, setContext] = useState('general');
  const [loading, setLoading] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const contexts = [
    { value: 'general', label: 'General', icon: 'target' },
    { value: 'interview', label: 'Interview Prep', icon: 'briefcase' },
    { value: 'project', label: 'Project Development', icon: 'code' },
    { value: 'learning', label: 'Learning/Education', icon: 'book' },
    { value: 'fitness', label: 'Fitness/Health', icon: 'heart' },
    { value: 'business', label: 'Business/Startup', icon: 'chart' }
  ];

  const handleGenerateTasks = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const response = await api.post('/ai/task-assistant', {
        input_text: inputText,
        context: context
      });

      setGeneratedTasks(response.data.generated_tasks);
      setSuggestions(response.data.suggestions);
      setShowResults(true);
      
      // Notify parent component if callback provided
      if (onTasksGenerated) {
        onTasksGenerated(response.data.generated_tasks);
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (task) => {
    try {
      const response = await api.post('/tasks', {
        title: task.title,
        description: task.description,
        priority: task.suggested_priority,
        deadline: task.suggested_deadline,
        estimated_time: task.estimated_time,
        category: task.category,
        difficulty: task.difficulty
      });

      // Show success feedback
      const taskElement = document.getElementById(`task-${task.title.replace(/\s+/g, '-')}`);
      if (taskElement) {
        taskElement.classList.add('bg-green-100', 'border-green-500');
        setTimeout(() => {
          taskElement.classList.add('opacity-50');
        }, 1000);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleAddAllTasks = async () => {
    for (const task of generatedTasks) {
      await handleAddTask(task);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || colors.medium;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      high: 'text-purple-600',
      medium: 'text-blue-600',
      low: 'text-gray-600'
    };
    return colors[difficulty] || colors.medium;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      planning: 'plan',
      research: 'search',
      setup: 'settings',
      development: 'code',
      design: 'palette',
      practice: 'repeat',
      preparation: 'checklist',
      logistics: 'truck',
      learning: 'school',
      networking: 'people',
      exercise: 'fitness',
      tracking: 'trending_up',
      immersion: 'headphones',
      organization: 'folder',
      action: 'play_arrow'
    };
    return icons[category] || 'task';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Task Assistant</h2>
        <p className="text-gray-600">Describe your goal and I'll break it down into actionable tasks with deadlines and priorities.</p>
      </div>

      {/* Input Section */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What do you want to accomplish?
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Example: 'Prepare for software engineering interview' or 'Build a mobile app for tracking habits'"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Context (optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {contexts.map((ctx) => (
              <button
                key={ctx.value}
                onClick={() => setContext(ctx.value)}
                className={`p-2 rounded-lg border transition-all ${
                  context === ctx.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="text-lg mr-1">{ctx.icon}</span>
                <span className="text-sm">{ctx.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerateTasks}
          disabled={!inputText.trim() || loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Tasks...
            </span>
          ) : (
            'Generate Tasks with AI'
          )}
        </button>
      </div>

      {/* Results Section */}
      {showResults && (
        <div className="space-y-6">
          {/* Generated Tasks */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Generated Tasks ({generatedTasks.length})
              </h3>
              <button
                onClick={handleAddAllTasks}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add All Tasks
              </button>
            </div>

            <div className="space-y-3">
              {generatedTasks.map((task, index) => (
                <div
                  key={index}
                  id={`task-${task.title.replace(/\s+/g, '-')}`}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">{task.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.suggested_priority)}`}>
                          {task.suggested_priority} priority
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                          {task.difficulty} difficulty
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {getCategoryIcon(task.category)} {task.category}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {task.estimated_time}
                        </span>
                      </div>

                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Suggested deadline:</span> {task.suggested_deadline}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddTask(task)}
                      className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Add Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Suggestions</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">lightbulb</span>
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AITaskAssistant;
