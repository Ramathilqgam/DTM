import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

// Animated Icons
const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

// Animated Background Component
function AnimatedFormBackground() {
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

export default function NewTaskForm({ initialData, onTaskCreated, onClose, users = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'medium',
        status: initialData.status || 'pending',
        due_date: initialData.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : ''
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
        priority: formData.priority,
        status: formData.status,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
      };

      if (initialData) {
        await api.put(`/tasks/${initialData.id}`, taskData);
      } else {
        await api.post('/tasks/', taskData);
      }
      
      onTaskCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-2xl mx-auto border border-gray-200 overflow-hidden">
      <AnimatedFormBackground />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg transform hover:scale-110 transition-all duration-300 animate-pulse">
            <SparklesIcon />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {initialData ? 'Update task details' : 'Fill in the details to create a new task'}
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
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            Task Title *
          </label>
          <div className="relative">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md"
              required
            />
          </div>
        </div>


        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Description
          </label>
          <div className="relative">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows={4}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md resize-none"
            />
          </div>
        </div>

        {/* Priority, Status, Due Date */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Priority
            </label>
            <div className="relative">
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-gray-900 shadow-sm hover:shadow-md appearance-none"
              >
                <option value="low" className="bg-white text-gray-900">Low</option>
                <option value="medium" className="bg-white text-gray-900">Medium</option>
                <option value="high" className="bg-white text-gray-900">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              Status
            </label>
            <div className="relative">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-gray-900 shadow-sm hover:shadow-md appearance-none"
              >
                <option value="pending" className="bg-white text-gray-900">Pending</option>
                <option value="in_progress" className="bg-white text-gray-900">In Progress</option>
                <option value="completed" className="bg-white text-gray-900">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-gray-900 shadow-sm hover:shadow-md"
              />
            </div>
          </div>
        </div>



        {/* Buttons */}
        <div className="flex gap-4 pt-8">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {loading ? (
              <span className="flex items-center justify-center gap-3 relative z-10">
                <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                {initialData ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3 relative z-10">
                <EditIcon />
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
