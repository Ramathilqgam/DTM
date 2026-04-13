import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosConfig';

const CalendarView = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState('month');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchCalendarEvents();
    fetchTemplates();
  }, [currentDate, viewType]);

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      const { start_date, end_date } = getDateRange(currentDate, viewType);
      const response = await api.get(`/calendar-view/calendar/events?start_date=${start_date}&end_date=${end_date}&view=${viewType}`);
      setEvents(response.data.events || []);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/calendar-view/calendar/templates');
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchAvailability = async (startDate, endDate) => {
    try {
      const response = await api.get(`/calendar-view/calendar/schedule?start_date=${startDate}&end_date=${endDate}`);
      setAvailability(response.data.availability || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      console.log('Creating calendar event with data:', eventData);
      const response = await api.post('/calendar-view/calendar/events', eventData);
      console.log('Calendar event creation response:', response.data);
      fetchCalendarEvents();
      setShowEventForm(false);
    } catch (error) {
      console.error('Error creating event:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
      alert(`Error creating event: ${errorMessage}`);
    }
  };

  const handleUpdateEvent = async (eventId, eventData) => {
    try {
      console.log('Updating calendar event with data:', eventData);
      const response = await api.put(`/calendar-view/calendar/events/${eventId}`, eventData);
      console.log('Calendar event update response:', response.data);
      fetchCalendarEvents();
      setEditingEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
      alert(`Error updating event: ${errorMessage}`);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        console.log('Deleting calendar event with ID:', eventId);
        const response = await api.delete(`/calendar-view/calendar/events/${eventId}`);
        console.log('Calendar event deletion response:', response.data);
        fetchCalendarEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
        alert(`Error deleting event: ${errorMessage}`);
      }
    }
  };

  const handleMoveEvent = async (eventId, newStartDate) => {
    try {
      await api.post(`/calendar-view/calendar/events/${eventId}/move`, {
        start_date: newStartDate
      });
      fetchCalendarEvents();
    } catch (error) {
      console.error('Error moving event:', error);
    }
  };

  const handleResizeEvent = async (eventId, newEndDate) => {
    try {
      await api.post(`/calendar-view/calendar/events/${eventId}/resize`, {
        end_date: newEndDate
      });
      fetchCalendarEvents();
    } catch (error) {
      console.error('Error resizing event:', error);
    }
  };

  const handleSyncWithTasks = async () => {
    try {
      const response = await api.post('/calendar-view/calendar/sync', {
        sync_type: 'upcoming'
      });
      alert(`Synced ${response.data.total_synced} tasks to calendar`);
      fetchCalendarEvents();
    } catch (error) {
      console.error('Error syncing tasks:', error);
      alert('Error syncing tasks');
    }
  };

  const handleExportCalendar = async (format) => {
    try {
      const { start_date, end_date } = getDateRange(currentDate, viewType);
      const response = await api.get(`/calendar-view/calendar/export?format=${format}&start_date=${start_date}&end_date=${end_date}`);
      
      if (format === 'ics') {
        const blob = new Blob([response.data], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calendar_${new Date().toISOString().split('T')[0]}.ics`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (format === 'json') {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calendar_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting calendar:', error);
      alert('Error exporting calendar');
    }
  };

  const getDateRange = (date, view) => {
    const start = new Date(date);
    const end = new Date(date);
    
    if (view === 'month') {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    } else if (view === 'week') {
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      end.setDate(start.getDate() + 6);
    } else if (view === 'day') {
      end.setDate(start.getDate() + 1);
    }
    
    return {
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0]
    };
  };

  const getEventTypeColor = (type) => {
    const colors = {
      task: '#2196F3',
      meeting: '#4CAF50',
      deadline: '#F44336',
      reminder: '#FF9800',
      recurring: '#9C27B0'
    };
    return colors[type] || colors.task;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#F44336',
      medium: '#FF9800',
      low: '#4CAF50'
    };
    return colors[priority] || colors.medium;
  };

  const navigateCalendar = (direction) => {
    const newDate = new Date(currentDate);
    
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else if (viewType === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">Calendar View</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateCalendar(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                chevron_left
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                Today
              </button>
              <button
                onClick={() => navigateCalendar(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                chevron_right
              </button>
            </div>
            <h3 className="text-lg font-medium text-gray-700">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric',
                ...(viewType === 'day' && { day: 'numeric' }),
                ...(viewType === 'week' && { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })
              })}
            </h3>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
              <option value="agenda">Agenda</option>
            </select>
            
            <button
              onClick={() => setShowEventForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              New Event
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncWithTasks}
                className="px-3 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
              >
                Sync Tasks
              </button>
              
              <div className="relative">
                <button className="px-3 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm">
                  Export
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg hidden">
                  <button
                    onClick={() => handleExportCalendar('ics')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    ICS Format
                  </button>
                  <button
                    onClick={() => handleExportCalendar('json')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    JSON Format
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-6">
        {viewType === 'month' && (
          <MonthView
            currentDate={currentDate}
            events={events}
            onDateClick={setSelectedDate}
            onEventClick={setEditingEvent}
            onCreateEvent={() => setShowEventForm(true)}
          />
        )}
        
        {viewType === 'week' && (
          <WeekView
            currentDate={currentDate}
            events={events}
            onEventClick={setEditingEvent}
            onMoveEvent={handleMoveEvent}
            onResizeEvent={handleResizeEvent}
          />
        )}
        
        {viewType === 'day' && (
          <DayView
            currentDate={currentDate}
            events={events}
            onEventClick={setEditingEvent}
            onMoveEvent={handleMoveEvent}
            onResizeEvent={handleResizeEvent}
          />
        )}
        
        {viewType === 'agenda' && (
          <AgendaView
            currentDate={currentDate}
            events={events}
            onEventClick={setEditingEvent}
          />
        )}
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-gray-800">{statistics.total_events}</div>
              <div className="text-gray-500">Total Events</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-600">{statistics.upcoming_events}</div>
              <div className="text-gray-500">Upcoming</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">{statistics.today_events}</div>
              <div className="text-gray-500">Today</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-600">{statistics.past_events}</div>
              <div className="text-gray-500">Past</div>
            </div>
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {(showEventForm || editingEvent) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {editingEvent ? 'Edit Event' : 'Create Event'}
              </h3>
              <button
                onClick={() => {
                  setShowEventForm(false);
                  setEditingEvent(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                close
              </button>
            </div>

            <EventForm
              event={editingEvent}
              templates={templates}
              selectedDate={selectedDate}
              onSubmit={editingEvent ? 
                (data) => handleUpdateEvent(editingEvent.id, data) : 
                handleCreateEvent
              }
              onCancel={() => {
                setShowEventForm(false);
                setEditingEvent(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {editingEvent && !showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Event Details</h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                close
              </button>
            </div>

            <EventDetail
              event={editingEvent}
              onEdit={() => {
                console.log('Editing event:', editingEvent);
                setEditingEvent(editingEvent);
                setShowEventForm(true);
              }}
              onDelete={() => {
                console.log('Deleting event:', editingEvent.id);
                handleDeleteEvent(editingEvent.id);
              }}
              onClose={() => setEditingEvent(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Month View Component
const MonthView = ({ currentDate, events, onDateClick, onEventClick, onCreateEvent }) => {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-month-view">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 mb-px">
        {weekDays.map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {days.map((date, index) => {
          const dayEvents = date ? getEventsForDate(date) : [];
          const isToday = date && date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={index}
              className={`bg-white p-2 min-h-24 cursor-pointer hover:bg-gray-50 ${
                isToday ? 'bg-blue-50' : ''
              } ${!date ? 'bg-gray-50' : ''}`}
              onClick={() => date && onDateClick(date)}
            >
              {date && (
                <>
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: getEventTypeColor(event.event_type) + '20', color: getEventTypeColor(event.event_type) }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Week View Component
const WeekView = ({ currentDate, events, onEventClick, onMoveEvent, onResizeEvent }) => {
  const getWeekDays = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i));
    }
    return days;
  };

  const getHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }
    return hours;
  };

  const getEventsForDayAndHour = (date, hour) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);
      const dayStart = new Date(date);
      dayStart.setHours(hour, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(hour + 1, 0, 0, 0);
      
      return eventStart < dayEnd && eventEnd > dayStart;
    });
  };

  const weekDays = getWeekDays(currentDate);
  const hours = getHours();
  const weekDaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-week-view">
      <div className="grid grid-cols-8 gap-px bg-gray-200">
        {/* Time column */}
        <div className="bg-gray-50"></div>
        
        {/* Day headers */}
        {weekDays.map((day, index) => (
          <div key={index} className="bg-gray-50 p-2 text-center">
            <div className="text-xs text-gray-500">{weekDaysShort[index]}</div>
            <div className="text-sm font-medium">{day.getDate()}</div>
          </div>
        ))}
      </div>
      
      {/* Time slots */}
      {hours.map(hour => (
        <div key={hour} className="grid grid-cols-8 gap-px bg-gray-200">
          {/* Time label */}
          <div className="bg-gray-50 p-2 text-xs text-gray-500 text-right">
            {hour.toString().padStart(2, '0')}:00
          </div>
          
          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const hourEvents = getEventsForDayAndHour(day, hour);
            
            return (
              <div key={dayIndex} className="bg-white p-1 min-h-12 border-t border-gray-100">
                {hourEvents.map(event => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded mb-1 cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: getEventTypeColor(event.event_type) + '20', color: getEventTypeColor(event.event_type) }}
                    onClick={() => onEventClick(event)}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Day View Component
const DayView = ({ currentDate, events, onEventClick, onMoveEvent, onResizeEvent }) => {
  const getHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }
    return hours;
  };

  const getEventsForHour = (hour) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);
      const hourStart = new Date(currentDate);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(currentDate);
      hourEnd.setHours(hour + 1, 0, 0, 0);
      
      return eventStart < hourEnd && eventEnd > hourStart;
    });
  };

  const hours = getHours();

  return (
    <div className="calendar-day-view">
      {hours.map(hour => {
        const hourEvents = getEventsForHour(hour);
        
        return (
          <div key={hour} className="flex border-b border-gray-200">
            {/* Time label */}
            <div className="w-20 p-2 text-xs text-gray-500 text-right">
              {hour.toString().padStart(2, '0')}:00
            </div>
            
            {/* Events */}
            <div className="flex-1 p-1 min-h-12">
              {hourEvents.map(event => (
                <div
                  key={event.id}
                  className="text-sm p-2 rounded mb-1 cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: getEventTypeColor(event.event_type) + '20', borderLeft: `4px solid ${getEventTypeColor(event.event_type)}` }}
                  onClick={() => onEventClick(event)}
                >
                  <div className="font-medium">{event.title}</div>
                  <div className="text-xs text-gray-600">
                    {new Date(event.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(event.end_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Agenda View Component
const AgendaView = ({ currentDate, events, onEventClick }) => {
  const getSortedEvents = () => {
    return events
      .filter(event => new Date(event.start_date) >= new Date(currentDate))
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  };

  const sortedEvents = getSortedEvents();
  const groupedEvents = {};
  
  sortedEvents.forEach(event => {
    const date = new Date(event.start_date).toDateString();
    if (!groupedEvents[date]) {
      groupedEvents[date] = [];
    }
    groupedEvents[date].push(event);
  });

  return (
    <div className="calendar-agenda-view space-y-6">
      {Object.entries(groupedEvents).map(([date, dayEvents]) => (
        <div key={date}>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {new Date(date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <div className="space-y-2">
            {dayEvents.map(event => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => onEventClick(event)}
              >
                <div
                  className="w-1 rounded-full"
                  style={{ backgroundColor: getEventTypeColor(event.event_type) }}
                ></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{event.title}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(event.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(event.end_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {event.location && (
                    <div className="text-sm text-gray-500">{event.location}</div>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {event.event_type}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {sortedEvents.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">event_available</div>
          <p className="text-gray-500">No upcoming events</p>
        </div>
      )}
    </div>
  );
};

// Event Form Component
const EventForm = ({ event, templates, selectedDate, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    start_date: event?.start_date || (selectedDate ? selectedDate.toISOString().slice(0, 16) : ''),
    end_date: event?.end_date || (selectedDate ? new Date(selectedDate.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16) : ''),
    event_type: event?.event_type || 'task',
    all_day: event?.all_day || false,
    location: event?.location || '',
    priority: event?.priority || 'medium',
    status: event?.status || 'scheduled',
    tags: event?.tags || []
  });

  const eventTypes = [
    { value: 'task', label: 'Task' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'recurring', label: 'Recurring' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('EventForm - Submitting form with data:', formData);
    console.log('EventForm - Event object:', event);
    console.log('EventForm - Selected date:', selectedDate);
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Event title is required');
      return;
    }
    
    if (!formData.start_date) {
      alert('Start date is required');
      return;
    }
    
    if (!formData.end_date) {
      alert('End date is required');
      return;
    }
    
    console.log('EventForm - Form validation passed, calling onSubmit');
    onSubmit(formData);
  };

  const handleTemplateSelect = (template) => {
    setFormData({
      ...formData,
      title: template.name,
      description: template.description,
      event_type: template.category === 'meeting' ? 'meeting' : 'task',
      tags: template.tags,
      duration: template.duration
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Template Selection */}
      {!event && templates.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quick Templates</label>
          <div className="grid grid-cols-2 gap-2">
            {templates.map(template => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleTemplateSelect(template)}
                className="p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 text-left"
              >
                <div className="font-medium">{template.name}</div>
                <div className="text-xs text-gray-500">{template.duration}min</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
          <select
            value={formData.event_type}
            onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            {eventTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={formData.all_day}
          onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded"
        />
        <label className="text-sm font-medium text-gray-700">All day event</label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
          <input
            type="datetime-local"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
          <input
            type="datetime-local"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {event ? 'Update' : 'Create'} Event
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// Event Detail Component
const EventDetail = ({ event, onEdit, onDelete, onClose }) => {
  console.log('EventDetail - Event data:', event);
  
  const handleEdit = () => {
    console.log('EventDetail - Edit button clicked');
    if (onEdit) {
      onEdit();
    }
  };
  
  const handleDelete = () => {
    console.log('EventDetail - Delete button clicked');
    if (onDelete) {
      onDelete();
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-gray-800 text-lg">{event.title || 'Untitled Event'}</h4>
        <div className="flex items-center gap-2 mt-2">
          <span
            className="px-2 py-1 rounded text-xs font-medium"
            style={{ backgroundColor: getEventTypeColor(event.event_type || 'task') + '20', color: getEventTypeColor(event.event_type || 'task') }}
          >
            {event.event_type || 'task'}
          </span>
          <span
            className="px-2 py-1 rounded text-xs font-medium"
            style={{ backgroundColor: getPriorityColor(event.priority || 'medium') + '20', color: getPriorityColor(event.priority || 'medium') }}
          >
            {event.priority || 'medium'}
          </span>
        </div>
      </div>

      {event.description && (
        <div>
          <h5 className="font-medium text-gray-700 mb-1">Description</h5>
          <p className="text-gray-600">{event.description}</p>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">schedule</span>
          <span className="text-gray-700">
            {new Date(event.start_date).toLocaleString('en-US', { 
              weekday: 'short',
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
            {' - '}
            {new Date(event.end_date).toLocaleString('en-US', { 
              weekday: 'short',
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        {event.location && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">location_on</span>
            <span className="text-gray-700">{event.location}</span>
          </div>
        )}
      </div>

      {event.tags && event.tags.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-700 mb-1">Tags</h5>
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleEdit}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Helper functions
const getEventTypeColor = (type) => {
  const colors = {
    task: '#2196F3',
    meeting: '#4CAF50',
    deadline: '#F44336',
    reminder: '#FF9800',
    recurring: '#9C27B0'
  };
  return colors[type] || colors.task;
};

const getPriorityColor = (priority) => {
  const colors = {
    high: '#F44336',
    medium: '#FF9800',
    low: '#4CAF50'
  };
  return colors[priority] || colors.medium;
};

export default CalendarView;
