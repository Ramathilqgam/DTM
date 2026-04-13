import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', newUser);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      setShowCreateUser(false);
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleAssignTask = async (userId) => {
    const taskTitle = prompt('Enter task title:');
    if (taskTitle) {
      try {
        await api.post('/tasks/', {
          title: taskTitle,
          description: 'Assigned by admin',
          assigned_to: userId,
          priority: 'medium',
          status: 'pending'
        });
        alert('Task assigned successfully!');
      } catch (error) {
        console.error('Failed to assign task:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-indigo-950/20 border border-indigo-700/30">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-indigo-600/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="ml-3 text-gray-400">Loading admin panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-indigo-950/20 border border-indigo-700/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👑</span>
          <div>
            <h3 className="text-xl font-bold">Admin Panel</h3>
            <p className="text-sm text-gray-400">Manage users and tasks</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateUser(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          Create User
        </button>
      </div>

      {showCreateUser && (
        <div className="p-4 rounded-xl bg-indigo-950/40 mb-6">
          <h4 className="font-semibold mb-4">Create New User</h4>
          <form onSubmit={handleCreateUser} className="space-y-3">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              className="w-full px-3 py-2 bg-black/30 border border-indigo-700/50 rounded-lg text-white"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="w-full px-3 py-2 bg-black/30 border border-indigo-700/50 rounded-lg text-white"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              className="w-full px-3 py-2 bg-black/30 border border-indigo-700/50 rounded-lg text-white"
              required
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              className="w-full px-3 py-2 bg-black/30 border border-indigo-700/50 rounded-lg text-white"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateUser(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="font-semibold mb-4">All Users ({users.length})</h4>
        {users.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No users found</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-indigo-950/40 border border-indigo-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                  <p className="text-xs px-2 py-1 rounded-full bg-indigo-600/30 text-indigo-300 inline-block">
                    {user.role?.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAssignTask(user.id)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  Assign Task
                </button>
                <button
                  className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors"
                >
                  View Tasks
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
