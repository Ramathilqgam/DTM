import React, { useState, useEffect } from 'react';

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TaskIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

function AnimatedFormBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-teal-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-gradient-to-br from-green-600/20 via-emerald-600/20 to-teal-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
    </div>
  );
}

export default function CreateTeamTaskForm({ initialData, onTaskCreated, onClose, teamMembers = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    collaboration_type: 'individual',
    assigned_to: [],
    priority: 'medium',
    category: 'general',
    estimated_duration: '',
    due_date: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const collaborationTypes = [
    { value: 'individual', label: 'Individual', description: 'Single person responsible', color: 'blue' },
    { value: 'collaborative', label: 'Collaborative', description: 'Multiple people work together', color: 'green' },
    { value: 'review_required', label: 'Review Required', description: 'Work needs review before completion', color: 'orange' },
    { value: 'parallel', label: 'Parallel', description: 'Multiple people work on different aspects', color: 'purple' },
    { value: 'sequential', label: 'Sequential', description: 'Work passes from person to person', color: 'red' }
  ];

  const categories = [
    'general', 'development', 'design', 'testing', 'documentation', 'marketing', 'research', 'planning'
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        collaboration_type: initialData.collaboration_type || 'individual',
        assigned_to: initialData.assigned_to || [],
        priority: initialData.priority || 'medium',
        category: initialData.category || 'general',
        estimated_duration: initialData.estimated_duration || '',
        due_date: initialData.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '',
        tags: initialData.tags ? initialData.tags.join(', ') : ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleAssignedToChange = (memberId) => {
    setFormData(prev => ({
      ...prev,
      assigned_to: prev.assigned_to.includes(memberId)
        ? prev.assigned_to.filter(id => id !== memberId)
        : [...prev.assigned_to, memberId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.title.trim()) {
        setError('Task title is required');
        setLoading(false);
        return;
      }

      const taskData = {
        title: formData.title,
        description: formData.description,
        collaboration_type: formData.collaboration_type,
        assigned_to: formData.assigned_to,
        priority: formData.priority,
        category: formData.category,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      await onTaskCreated(taskData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-3xl mx-auto border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto">
      <AnimatedFormBackground />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl shadow-lg transform hover:scale-110 transition-all duration-300 animate-pulse">
            <TaskIcon />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Edit Team Task' : 'Create Team Task'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {initialData ? 'Update team task details' : 'Assign work to your team members'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-red-100 hover:to-red-200 border border-gray-300 hover:border-red-300 transition-all duration-300 group"
        >
          <CloseIcon />
        </button>
      </div>

      {error && (
        <div className="relative z-10 mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <div>
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
        {/* Task Title */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Task Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the task and requirements"
            rows={4}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md resize-none"
          />
        </div>

        {/* Collaboration Type */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            Collaboration Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {collaborationTypes.map((type) => (
              <label
                key={type.value}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  formData.collaboration_type === type.value
                    ? `border-${type.color}-500 bg-${type.color}-50`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="collaboration_type"
                  value={type.value}
                  checked={formData.collaboration_type === type.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                    formData.collaboration_type === type.value
                      ? `border-${type.color}-500 bg-${type.color}-500`
                      : 'border-gray-300'
                  }`}>
                    {formData.collaboration_type === type.value && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Assign to Team Members */}
        {teamMembers.length > 0 && (
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <UsersIcon />
              Assign to Team Members
            </label>
            <div className="bg-gray-50 rounded-xl p-4 max-h-40 overflow-y-auto">
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <label key={member.user_id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.assigned_to.includes(member.user_id)}
                      onChange={() => handleAssignedToChange(member.user_id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.email}</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium capitalize">
                      {member.role}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Priority, Category, Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-gray-900 shadow-sm hover:shadow-md"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-gray-900 shadow-sm hover:shadow-md"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="capitalize">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              Duration (min)
            </label>
            <input
              type="number"
              name="estimated_duration"
              value={formData.estimated_duration}
              onChange={handleChange}
              placeholder="60"
              min="1"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md"
            />
          </div>
        </div>

        {/* Due Date and Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Due Date
            </label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-gray-900 shadow-sm hover:shadow-md"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="frontend, urgent, bug"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md"
            />
            <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-8">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:via-cyan-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {loading ? (
              <span className="flex items-center justify-center gap-3 relative z-10">
                <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                {initialData ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3 relative z-10">
                <TaskIcon />
                {initialData ? 'Update Task' : 'Create Task'}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center gap-2 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2">
              <CloseIcon />
              Cancel
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
