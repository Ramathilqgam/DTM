import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

export default function CollaborationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('rooms');
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchCollaborationData();
  }, []);

  const fetchCollaborationData = async () => {
    try {
      const [roomsRes, projectsRes, activitiesRes] = await Promise.all([
        api.get('/collaboration/rooms'),
        api.get('/collaboration/projects'),
        api.get('/collaboration/activities')
      ]);

      setRooms(roomsRes.data.rooms || []);
      setProjects(projectsRes.data.projects || []);
      setActivities(activitiesRes.data.activities || []);
    } catch (error) {
      console.error('Error fetching collaboration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomId) => {
    try {
      await api.post(`/collaboration/room/${roomId}/join`);
      setSelectedRoom(roomId);
      fetchRoomMessages(roomId);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const fetchRoomMessages = async (roomId) => {
    try {
      const response = await api.get(`/collaboration/room/${roomId}/messages`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      await api.post('/collaboration/message', {
        room_id: selectedRoom,
        message: newMessage.trim()
      });
      setNewMessage('');
      fetchRoomMessages(selectedRoom);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getActivityIcon = (type) => {
    const icons = {
      task_completed: '✅',
      skill_learned: '📚',
      achievement_unlocked: '🏆',
      collaboration: '🤝'
    };
    return icons[type] || '📋';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#16213e] text-white">
      {/* Header */}
      <div className="border-b border-zinc-800/50 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-xl font-bold">
                👥
              </div>
              <div>
                <h1 className="text-2xl font-bold">Team Collaboration</h1>
                <p className="text-sm text-gray-400">Work together, share knowledge, and achieve more</p>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <Link to="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link to="/tasks" className="text-zinc-400 hover:text-white transition-colors">
                Tasks
              </Link>
              <Link to="/ai-assistant" className="text-zinc-400 hover:text-white transition-colors">
                AI Assistant
              </Link>
              <Link to="/skill-development" className="text-zinc-400 hover:text-white transition-colors">
                Skills
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-zinc-900/50 p-1 rounded-xl">
          {['rooms', 'projects', 'activities'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              {tab === 'rooms' && '💬 Rooms'}
              {tab === 'projects' && '📁 Projects'}
              {tab === 'activities' && '📊 Activities'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div key={room.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-indigo-600/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{room.name}</h3>
                    <div className={`w-3 h-3 rounded-full ${room.active ? 'bg-green-500' : 'bg-zinc-600'}`} />
                  </div>
                  <p className="text-sm text-zinc-400 mb-4">{room.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300">{room.members} members</span>
                    <span className="text-zinc-500">{room.last_activity}</span>
                  </div>
                  <button
                    onClick={() => joinRoom(room.id)}
                    className="w-full mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                  >
                    Join Room
                  </button>
                </div>
              ))}
            </div>

            {/* Chat Interface */}
            {selectedRoom && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {rooms.find(r => r.id === selectedRoom)?.name}
                  </h3>
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>

                <div className="h-96 overflow-y-auto mb-4 space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.user.id === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-3 rounded-lg ${
                        message.user.id === user?.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center text-sm font-bold">
                            {message.user.avatar}
                          </div>
                          <span className="text-xs opacity-70">{message.user.name}</span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatTimestamp(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      project.status === 'completed' ? 'bg-green-600' :
                      project.status === 'in_progress' ? 'bg-blue-600' : 'bg-zinc-600'
                    } text-white`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-4">{project.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-300">Progress</span>
                      <span className="text-zinc-300">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-zinc-300">Deadline</span>
                    <span className="text-zinc-300">{project.deadline}</span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-zinc-300">Team Members</p>
                    <div className="flex flex-wrap gap-2">
                      {project.team.map((member, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-2 py-1 bg-zinc-800 rounded-lg">
                          <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center text-xs font-bold">
                            {member.avatar}
                          </div>
                          <span className="text-xs text-zinc-300">{member.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-xl">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-1">{activity.title}</h4>
                    <p className="text-sm text-zinc-400 mb-2">{activity.description}</p>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{formatTimestamp(activity.timestamp)}</span>
                      <span className="text-green-400">+{activity.points} points</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
