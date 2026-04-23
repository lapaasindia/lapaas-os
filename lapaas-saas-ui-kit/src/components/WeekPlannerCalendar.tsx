import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScheduledItem {
  id: string;
  title: string;
  type: 'task' | 'meeting' | 'commitment' | 'request';
  startTime?: string;
  endTime?: string;
  start_at?: string;
  end_at?: string;
  date?: string;
  due_at?: string;
  priority?: string;
  status?: string;
  color?: string;
}

interface WeekPlannerCalendarProps {
  items: ScheduledItem[];
  onItemClick?: (item: ScheduledItem) => void;
  onScheduleItem?: (item: ScheduledItem, date: string, time?: string) => void;
  onAddItem?: (date: string, time?: string) => void;
}

const WeekPlannerCalendar: React.FC<WeekPlannerCalendarProps> = ({ 
  items, 
  onItemClick,
  onScheduleItem,
  onAddItem
}) => {
  const [weekStart, setWeekStart] = useState<Date>(getMonday(new Date()));
  const [draggedItem, setDraggedItem] = useState<ScheduledItem | null>(null);

  function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function getWeekDays(): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  }

  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  function getItemsForDay(dayDate: string): ScheduledItem[] {
    return items.filter(item => {
      const itemDate = item.date || item.due_at || item.start_at?.split('T')[0];
      return itemDate === dayDate;
    }).sort((a, b) => {
      // Extract time for sorting
      const aTime = a.startTime || a.start_at?.split('T')[1] || '00:00';
      const bTime = b.startTime || b.start_at?.split('T')[1] || '00:00';
      // Sort chronologically
      return aTime.localeCompare(bTime);
    });
  }

  function getItemColor(type: string): string {
    switch (type) {
      case 'meeting': return 'bg-blue-100 border-blue-300 text-blue-900';
      case 'task': return 'bg-purple-100 border-purple-300 text-purple-900';
      case 'commitment': return 'bg-green-100 border-green-300 text-green-900';
      case 'request': return 'bg-orange-100 border-orange-300 text-orange-900';
      default: return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  }

  function getItemIcon(type: string): string {
    switch (type) {
      case 'meeting': return '📅';
      case 'task': return '📋';
      case 'commitment': return '🎯';
      case 'request': return '🚨';
      default: return '📌';
    }
  }

  const weekDays = getWeekDays();
  const nextWeek = new Date(weekStart);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const prevWeek = new Date(weekStart);
  prevWeek.setDate(prevWeek.getDate() - 7);

  return (
    <div className="bg-slate-900 rounded-lg p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setWeekStart(prevWeek)}
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <ChevronLeft className="text-gray-400" size={24} />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">
              Week: {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </h2>
            <p className="text-gray-400 text-sm">{weekDays[0].toLocaleDateString('en-US', { year: 'numeric' })}</p>
          </div>
          <button
            onClick={() => setWeekStart(nextWeek)}
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <ChevronRight className="text-gray-400" size={24} />
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 min-w-max">
          {weekDays.map((day, idx) => {
            const dayDate = formatDate(day);
            const dayItems = getItemsForDay(dayDate);
            const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = day.getDate();

            return (
              <div key={idx} className="w-56 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                {/* Day Header */}
                <div className="bg-slate-700 p-3 border-b border-slate-600">
                  <div className="font-semibold text-white text-center">
                    {dayName.toUpperCase()} {dayNum}
                  </div>
                  <div className="text-xs text-gray-400 text-center mt-1">
                    {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* Items Container */}
                <div 
                  className="p-3 space-y-2 max-h-96 overflow-y-auto min-h-48 bg-slate-800"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const itemData = e.dataTransfer.getData('application/json');
                    if (itemData) {
                      try {
                        const item = JSON.parse(itemData);
                        onScheduleItem?.(item, dayDate);
                      } catch (err) {
                        console.error('Error dropping item:', err);
                      }
                    }
                  }}
                >
                  {dayItems.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No items scheduled</p>
                      <p className="text-gray-600 text-xs mt-2">Drag items here to schedule</p>
                    </div>
                  ) : (
                    dayItems.map((item, idx) => {
                      const startTime = item.startTime || item.start_at?.split('T')[1]?.substring(0, 5) || '—';
                      const endTime = item.endTime || item.end_at?.split('T')[1]?.substring(0, 5) || '—';
                      
                      // Convert 24-hour format to 12-hour format
                      const formatTime = (time: string) => {
                        if (time === '—') return '—';
                        const [hours, minutes] = time.split(':');
                        const hour = parseInt(hours);
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const displayHour = hour % 12 || 12;
                        return `${displayHour}:${minutes}${ampm}`;
                      };
                      
                      const timeDisplay = startTime !== '—' && endTime !== '—' 
                        ? `${formatTime(startTime)}-${formatTime(endTime)}`
                        : startTime !== '—' 
                        ? `${formatTime(startTime)}`
                        : 'All day';

                      return (
                        <div
                          key={`${dayDate}-${item.type}-${item.id}-${idx}`}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('application/json', JSON.stringify(item));
                            setDraggedItem(item);
                          }}
                          onDragEnd={() => setDraggedItem(null)}
                          onClick={() => onItemClick?.(item)}
                          className={`p-3 rounded border-2 cursor-move hover:shadow-lg transition ${getItemColor(item.type)} ${draggedItem?.id === item.id ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{getItemIcon(item.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-sm truncate ${item.status === 'done' || item.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                                {item.title}
                              </p>
                              <p className="text-xs opacity-75 mb-1">
                                ⏰ {timeDisplay}
                              </p>
                              {item.priority && (
                                <p className="text-xs font-semibold opacity-90">{item.priority}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Item Button */}
                <div className="p-3 border-t border-slate-700 bg-slate-800">
                  <button
                    onClick={() => onAddItem?.(dayDate)}
                    className="w-full py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition flex items-center justify-center gap-2"
                  >
                    <span>+</span>
                    <span>Add Item</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <span className="text-gray-400">Meetings</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <span className="text-gray-400">Tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <span className="text-gray-400">Commitments</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🚨</span>
          <span className="text-gray-400">Requests</span>
        </div>
      </div>
    </div>
  );
};

export default WeekPlannerCalendar;
