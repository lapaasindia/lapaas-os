import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  type: 'focus' | 'meeting' | 'office_hours' | 'personal';
  color_tag: string;
  attendees: string[];
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 10));
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/v1/calendar/events?org_id=org-001&user_id=user-001');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      focus: 'bg-blue-900 text-blue-200',
      meeting: 'bg-green-900 text-green-200',
      office_hours: 'bg-orange-900 text-orange-200',
      personal: 'bg-purple-900 text-purple-200'
    };
    return colors[type] || 'bg-gray-700 text-gray-200';
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-900 p-2 min-h-24"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.start_at.startsWith(dateStr));

      days.push(
        <div key={day} className="bg-slate-800 border border-slate-700 p-2 min-h-24 hover:bg-slate-700 transition cursor-pointer" onClick={() => { setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)); setShowForm(true); }}>
          <p className="text-sm font-semibold text-white mb-1">{day}</p>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div key={event.id} className={`text-xs p-1 rounded ${getTypeColor(event.type)} truncate`}>
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <p className="text-xs text-gray-400">+{dayEvents.length - 2} more</p>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderWeekView = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      const dateStr = day.toISOString().split('T')[0];
      const dayEvents = events.filter(e => e.start_at.startsWith(dateStr));

      days.push(
        <div key={i} className="flex-1 border border-slate-700 p-2 bg-slate-800">
          <p className="text-xs font-semibold text-white mb-2">{day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          <div className="space-y-1">
            {dayEvents.map(event => (
              <div key={event.id} className={`text-xs p-1 rounded ${getTypeColor(event.type)}`}>
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading calendar...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Calendar</h1>
            <p className="text-gray-400">Manage your schedule and events</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition">
            <Plus size={20} /> New Event
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          {(['month', 'week', 'day'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-lg transition ${view === v ? 'bg-green-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-6 bg-slate-800 border border-slate-700 rounded-lg p-4">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="text-gray-400 hover:text-white transition">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-white">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="text-gray-400 hover:text-white transition">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          {view === 'month' && (
            <div className="grid grid-cols-7 gap-0">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-slate-900 p-4 text-center font-semibold text-gray-400 border-b border-slate-700">
                  {day}
                </div>
              ))}
              {renderMonthView()}
            </div>
          )}

          {view === 'week' && (
            <div className="flex">
              {renderWeekView()}
            </div>
          )}

          {view === 'day' && (
            <div className="p-6">
              <p className="text-gray-400 mb-4">{currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              <div className="space-y-3">
                {events.filter(e => e.start_at.startsWith(currentDate.toISOString().split('T')[0])).map(event => (
                  <div key={event.id} className={`p-4 rounded-lg ${getTypeColor(event.type)}`}>
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm mt-1">{event.start_at.split('T')[1].slice(0, 5)} - {event.end_at.split('T')[1].slice(0, 5)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Events List */}
        <div className="mt-8 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {events.slice(0, 5).map(event => (
              <div key={event.id} className="flex items-start justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
                <div className="flex-1">
                  <p className="font-semibold text-white">{event.title}</p>
                  <p className="text-sm text-gray-400">{event.start_at}</p>
                  <p className="text-xs text-gray-500 mt-1">Type: {event.type}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">New Event</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Event title" className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-gray-500" />
              <input type="datetime-local" className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white" />
              <select className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white">
                <option value="focus">Focus Block</option>
                <option value="meeting">Meeting</option>
                <option value="office_hours">Office Hours</option>
                <option value="personal">Personal</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded transition">
                  Cancel
                </button>
                <button onClick={() => setShowForm(false)} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition">
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
