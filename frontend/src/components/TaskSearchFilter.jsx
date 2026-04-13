import React, { useState, useEffect } from 'react';

export default function TaskSearchFilter({ tasks, onFilteredTasks }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let filtered = tasks || [];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Apply date filter
    if (filterDate !== 'all') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      filtered = filtered.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        
        switch (filterDate) {
          case 'today':
            return dueDate.toDateString() === today.toDateString();
          case 'tomorrow':
            return dueDate.toDateString() === tomorrow.toDateString();
          case 'week':
            return dueDate <= nextWeek;
          case 'overdue':
            return dueDate < today && task.status !== 'completed';
          default:
            return true;
        }
      });
    }

    onFilteredTasks(filtered);
  }, [tasks, searchTerm, filterStatus, filterPriority, filterDate, onFilteredTasks]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterDate('all');
  };

  const activeFiltersCount = [
    searchTerm,
    filterStatus,
    filterPriority,
    filterDate
  ].filter(filter => filter !== 'all' && filter !== '').length;

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-900/30 to-cyan-950/20 border border-cyan-700/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <div>
            <h3 className="text-xl font-bold">Search & Filter</h3>
            <p className="text-sm text-gray-400">Find specific tasks quickly</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            >
              Clear ({activeFiltersCount})
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-cyan-700 hover:bg-cyan-600 rounded-lg transition-colors"
          >
            <span className="text-white">{showFilters ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-black/30 border border-cyan-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-cyan-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-cyan-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-cyan-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Time</option>
                <option value="today">Due Today</option>
                <option value="tomorrow">Due Tomorrow</option>
                <option value="week">Due This Week</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setFilterStatus('pending');
                setFilterPriority('high');
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            >
              High Priority Pending
            </button>
            <button
              onClick={() => {
                setFilterStatus('in_progress');
                setFilterPriority('all');
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              In Progress
            </button>
            <button
              onClick={() => {
                setFilterDate('overdue');
                setFilterStatus('all');
                setFilterPriority('all');
              }}
              className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors"
            >
              Overdue Tasks
            </button>
            <button
              onClick={() => {
                setFilterDate('today');
                setFilterStatus('all');
                setFilterPriority('all');
              }}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
            >
              Due Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
