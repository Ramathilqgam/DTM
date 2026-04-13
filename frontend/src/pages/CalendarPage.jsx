import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

export default function CalendarPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeView, setActiveView] = useState('month');
  const [events, setEvents] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'meeting',
    priority: 'medium',
    start: '',
    end: '',
    location: '',
    recurring: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendarData();
  }, [selectedDate]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const [eventsRes, scheduleRes, availabilityRes] = await Promise.all([
        api.get('/calendar/events'),
        api.get('/calendar/schedule'),
        api.get('/calendar/availability')
      ]);
      
      setEvents(eventsRes.data.events || []);
      setSchedule(scheduleRes.data);
      setAvailability(availabilityRes.data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = () => {
    const year = new Date(selectedDate).getFullYear();
    const month = new Date(selectedDate).getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getEventTypeColor = (type) => {
    const colors = {
      meeting: 'from-blue-600 to-blue-700',
      work: 'from-purple-600 to-purple-700',
      break: 'from-green-600 to-green-700',
      deadline: 'from-red-600 to-red-700',
      task: 'from-yellow-600 to-yellow-700'
    };
    return colors[type] || 'from-gray-600 to-gray-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-400',
      medium: 'text-yellow-400',
      low: 'text-green-400'
    };
    return colors[priority] || 'text-gray-400';
  };

  const handleCreateEvent = async () => {
    try {
      await api.post('/calendar/events', newEvent);
      setShowEventModal(false);
      setNewEvent({
        title: '',
        description: '',
        type: 'meeting',
        priority: 'medium',
        start: '',
        end: '',
        location: '',
        recurring: false
      });
      fetchCalendarData();
    } catch (error) {
      console.error('Error creating event:', error);
    }
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
                
              </div>
              <div>
                <h1 className="text-2xl font-bold">Calendar & Scheduling</h1>
                <p className="text-sm text-gray-400">Manage your time, events, and availability</p>
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
              <Link to="/collaboration" className="text-zinc-400 hover:text-white transition-colors">
                Collaboration
              </Link>
              <Link to="/gamification" className="text-zinc-400 hover:text-white transition-colors">
                Gamification
              </Link>
              <Link to="/analytics" className="text-zinc-400 hover:text-white transition-colors">
                Analytics
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
                <div className="flex gap-1 bg-zinc-800 p-1 rounded-lg">
                  {['day', 'week', 'month'].map((view) => (
                    <button
                      key={view}
                      onClick={() => setActiveView(view)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                        activeView === view
                          ? 'bg-indigo-600 text-white'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                      }`}
                    >
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowEventModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
              >
                + New Event
              </button>
            </div>

            {/* Calendar View */}
            {activeView === 'month' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">
                  {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-zinc-400 py-2">
                      {day}
                    </div>
                  ))}
                  {generateCalendarDays().map((day, index) => (
                    <div
                      key={index}
                      className={`aspect-square border border-zinc-700 rounded-lg p-2 ${
                        day ? 'hover:bg-zinc-800 cursor-pointer' : 'text-zinc-700'
                      }`}
                    >
                      {day && (
                        <>
                          <div className="text-sm font-medium text-white">{day}</div>
                          <div className="text-xs text-zinc-400">
                            {events.filter(e => new Date(e.start).getDate() === day).length > 0 && (
                              <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'day' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">
                  {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
                <div className="space-y-3">
                  {schedule?.timeSlots?.map((slot, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-zinc-800 rounded-lg">
                      <div className="w-24 text-sm text-zinc-400">{slot.time}</div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{slot.event}</div>
                        <div className={`text-sm ${getPriorityColor(slot.priority)}`}>
                          {slot.priority} priority
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Events List */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Upcoming Events</h3>
              <div className="space-y-4">
                {events.slice(0, 5).map((event) => (
                  <div key={event.id} className="bg-zinc-800 rounded-xl p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getEventTypeColor(event.type)} rounded-lg flex items-center justify-center text-xl`}>
                        {event.type === 'meeting' && ''}
                        {event.type === 'work' && ''}
                        {event.type === 'break' && ''}
                        {event.type === 'deadline' && ''}
                        {event.type === 'task' && ''}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{event.title}</h4>
                        <p className="text-sm text-zinc-400 mb-2">{event.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-zinc-300">
                              {formatTime(event.start)} - {formatTime(event.end)}
                            </span>
                            <span className={getPriorityColor(event.priority)}>
                              {event.priority}
                            </span>
                            {event.location && (
                              <span className="text-zinc-300"> {event.location}</span>
                            )}
                          </div>
                          {event.recurring && (
                            <span className="px-2 py-1 bg-zinc-700 rounded-full text-xs text-zinc-300">
                              Recurring
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability */}
            {availability && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4"> Availability</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-300">Available</span>
                    <span className="text-green-400 font-semibold">{availability.totalAvailableHours}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-300">Busy</span>
                    <span className="text-red-400 font-semibold">{availability.totalBusyHours}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-300">Free Time</span>
                    <span className="text-blue-400 font-semibold">{availability.totalFreeHours}h</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors">
                   Set Focus Time
                </button>
                <button className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors">
                   Add Break
                </button>
                <button className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors">
                   Sync Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-6">Create New Event</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Event title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  rows={3}
                  placeholder="Event description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="work">Work</option>
                    <option value="break">Break</option>
                    <option value="deadline">Deadline</option>
                    <option value="task">Task</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Priority</label>
                  <select
                    value={newEvent.priority}
                    onChange={(e) => setNewEvent({...newEvent, priority: e.target.value})}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    value={newEvent.start}
                    onChange={(e) => setNewEvent({...newEvent, start: e.target.value})}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    value={newEvent.end}
                    onChange={(e) => setNewEvent({...newEvent, end: e.target.value})}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Event location"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={newEvent.recurring}
                  onChange={(e) => setNewEvent({...newEvent, recurring: e.target.checked})}
                  className="w-4 h-4 bg-zinc-800 border border-zinc-700 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                />
                <label htmlFor="recurring" className="text-sm text-zinc-300">Recurring Event</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateEvent}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
                >
                  Create Event
                </button>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
