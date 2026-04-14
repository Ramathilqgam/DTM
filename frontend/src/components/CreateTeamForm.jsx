import React, { useState } from 'react';

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TeamIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

function AnimatedFormBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-teal-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-gradient-to-br from-yellow-600/20 via-orange-600/20 to-red-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
    </div>
  );
}

export default function CreateTeamForm({ onTeamCreated, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    allow_member_invites: true,
    require_approval: false,
    default_task_visibility: 'team',
    enable_analytics: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        setError('Team name is required');
        setLoading(false);
        return;
      }

      if (!formData.description.trim()) {
        setError('Team description is required');
        setLoading(false);
        return;
      }

      await onTeamCreated(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team');
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
          <div className="p-3 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-2xl shadow-lg transform hover:scale-110 transition-all duration-300 animate-pulse">
            <TeamIcon />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Team</h2>
            <p className="text-gray-600 text-sm mt-1">Build your team and start collaborating</p>
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
        {/* Team Name */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            Team Name *
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter team name"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md"
              required
            />
          </div>
        </div>

        {/* Team Description */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Team Description *
          </label>
          <div className="relative">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your team's purpose and goals"
              rows={4}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md resize-none"
              required
            />
          </div>
        </div>

        {/* Team Settings */}
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Settings</h3>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="allow_member_invites"
                  checked={formData.allow_member_invites}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Allow Member Invites</span>
                  <p className="text-sm text-gray-600">Team members can invite others</p>
                </div>
              </div>
            </label>

            <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="require_approval"
                  checked={formData.require_approval}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Require Approval</span>
                  <p className="text-sm text-gray-600">New members need approval to join</p>
                </div>
              </div>
            </label>

            <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enable_analytics"
                  checked={formData.enable_analytics}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Enable Analytics</span>
                  <p className="text-sm text-gray-600">Track team performance and insights</p>
                </div>
              </div>
            </label>
          </div>

          {/* Default Task Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Default Task Visibility</label>
            <select
              name="default_task_visibility"
              value={formData.default_task_visibility}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="team">Team Only</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-8">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {loading ? (
              <span className="flex items-center justify-center gap-3 relative z-10">
                <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                Creating Team...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3 relative z-10">
                <TeamIcon />
                Create Team
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
