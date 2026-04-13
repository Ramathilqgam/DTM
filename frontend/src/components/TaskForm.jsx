import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

export default function TaskForm({ initialData, onTaskCreated, onClose, users = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    assignedTo: '',
    category: '',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'medium',
        status: initialData.status || 'pending',
        due_date: initialData.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '',
        assigned_to: initialData.assigned_to || '',
        category: initialData.category || '',
        tags: initialData.tags || []
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Map form names to backend field names
    const fieldName = name === 'dueDate' ? 'due_date' : name === 'assignedTo' ? 'assigned_to' : name;
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setError('');
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
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
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null
      };

      if (initialData) {
        // Update existing task
        const response = await api.put(`/tasks/${initialData.id}`, taskData);
        onTaskCreated();
        onClose();
      } else {
        // Create new task
        const response = await api.post('/tasks/', taskData);
        onTaskCreated();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            {initialData ? 'Edit Task' : 'Create New Task'}
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {initialData ? 'Update task details' : 'Fill in the details to create a new task'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300 group"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/70 group-hover:text-white transition-colors">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-300 text-sm flex items-center gap-3">
          <AlertCircleIcon />
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-red-200/80">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full" />
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-all duration-300 text-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Development, Design, Marketing"
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all duration-300 text-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description"
            rows={4}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-cyan-400 focus:bg-white/15 transition-all duration-300 resize-none text-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-red-400 focus:bg-white/15 transition-all duration-300 text-lg"
            >
              <option value="low" className="bg-slate-800">Low</option>
              <option value="medium" className="bg-slate-800">Medium</option>
              <option value="high" className="bg-slate-800">High</option>
              <option value="urgent" className="bg-slate-800">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-yellow-400 focus:bg-white/15 transition-all duration-300 text-lg"
            >
              <option value="pending" className="bg-slate-800">Pending</option>
              <option value="in_progress" className="bg-slate-800">In Progress</option>
              <option value="completed" className="bg-slate-800">Completed</option>
              <option value="cancelled" className="bg-slate-800">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-green-400 focus:bg-white/15 transition-all duration-300 text-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full" />
            Assigned To
          </label>
          <select
            name="assignedTo"
            value={formData.assigned_to}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-orange-400 focus:bg-white/15 transition-all duration-300 text-lg"
          >
            <option value="" className="bg-slate-800">Select assignee</option>
            {users.map(user => (
              <option key={user.id} value={user.id} className="bg-slate-800">
                {user.name || user.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-pink-400 rounded-full" />
            Tags
          </label>
          <div className="flex flex-wrap gap-3 mb-4">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm border border-indigo-400/30 text-indigo-300 rounded-xl text-sm font-medium group hover:border-indigo-400/50 transition-all duration-300"
              >
                <TagIcon />
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-indigo-400 hover:text-red-400 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
              placeholder="Add tag and press Enter"
              className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-pink-400 focus:bg-white/15 transition-all duration-300 text-lg"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add
            </button>
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] transform flex items-center justify-center gap-3"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                {initialData ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {initialData ? (
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  ) : (
                    <path d="M12 5v14M5 12h14"/>
                  )}
                </svg>
                {initialData ? 'Update Task' : 'Create Task'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 text-white font-bold rounded-2xl transition-all duration-300 flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
