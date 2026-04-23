import React, { useState } from 'react';
import { Calendar, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  due_at?: string;
  due_date?: string;
  priority?: string;
  status?: string;
  type?: string;
  blocked?: boolean;
}

interface Meeting {
  id: string;
  title: string;
  start_at: string;
}

interface TimeBlock {
  id: string;
  title?: string;
  type?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  start_at?: string;
  end_at?: string;
  startTime?: string;
  endTime?: string;
}

interface Commitment {
  id: string;
  title: string;
  date: string;
  priority?: string;
  status?: string;
  planned_minutes?: number;
}

interface CalendarViewProps {
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
  tasks: Task[];
  meetings: Meeting[];
  timeBlocks?: TimeBlock[];
  commitments?: Commitment[];
  onAddTask: () => void;
  onAddTimeBlock: () => void;
  onAddCommitment: () => void;
  onAddMeeting?: () => void;
  onTimeBlockClick?: (blockId: string) => void;
  onCommitmentClick?: (commitmentId: string) => void;
  isDayBlocked?: (date: string) => boolean;
  hasTimeOverlap?: (date: string, startTime: string, endTime: string) => boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  selectedDate,
  onDateSelect,
  tasks,
  meetings,
  timeBlocks = [],
  commitments = [],
  onAddTask,
  onAddTimeBlock,
  onAddCommitment,
  onAddMeeting,
  onTimeBlockClick,
  onCommitmentClick,
  isDayBlocked,
  hasTimeOverlap
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1));
  const [showPopup, setShowPopup] = useState(false);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    onDateSelect(selectedDate === dateStr ? null : dateStr);
    setShowPopup(true);
  };

  const handleAddTask = () => {
    onAddTask();
    setShowPopup(false);
  };

  const handleAddTimeBlock = () => {
    onAddTimeBlock();
    setShowPopup(false);
  };

  const handleAddCommitment = () => {
    onAddCommitment();
    setShowPopup(false);
  };

  const handleAddMeeting = () => {
    if (onAddMeeting) {
      onAddMeeting();
      setShowPopup(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
      {/* Header with Month/Year Navigation */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar className="text-blue-400" size={24} />
          Calendar
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
            title="Previous month"
          >
            <ChevronLeft className="text-gray-400 hover:text-white" size={20} />
          </button>
          <span className="text-white font-semibold min-w-[150px] text-center">{monthName}</span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
            title="Next month"
          >
            <ChevronRight className="text-gray-400 hover:text-white" size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-gray-400 text-sm font-semibold py-2">{day}</div>
        ))}
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="p-3"></div>;
          }

          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dateStr = date.toISOString().split('T')[0];
          const dayTasks = tasks.filter(t => (t.due_at || t.due_date) === dateStr);
          const dayMeetings = meetings.filter(m => m.start_at && m.start_at.split('T')[0] === dateStr);
          const dayTimeBlocks = timeBlocks.filter(tb => {
            // Handle both date field and start_at field
            const blockDate = tb.date || (tb.start_at ? tb.start_at.split('T')[0] : null);
            return blockDate === dateStr;
          });
          const isSelected = selectedDate === dateStr;
          const hasItems = dayTasks.length > 0 || dayMeetings.length > 0 || dayTimeBlocks.length > 0;
          const hasBlockedTasks = dayTasks.some(t => t.blocked);
          const isDayFullyBlocked = isDayBlocked && isDayBlocked(dateStr);

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`p-3 rounded-lg border-2 transition text-sm min-h-[80px] flex flex-col cursor-pointer ${
                isSelected
                  ? 'border-green-500 bg-green-900'
                  : isDayFullyBlocked
                  ? 'border-red-500 bg-red-900 hover:border-red-400'
                  : hasBlockedTasks
                  ? 'border-orange-500 bg-orange-900 hover:border-orange-400'
                  : hasItems
                  ? 'border-slate-600 bg-slate-700 hover:border-slate-500'
                  : 'border-slate-600 bg-slate-700 hover:border-slate-500'
              }`}
              title={isDayFullyBlocked ? '🚫 This day is completely blocked' : hasBlockedTasks ? 'Day has blocked tasks - you can still add new items' : 'Click to view or add items'}
            >
              <div className="font-semibold text-white text-lg">{day}</div>
              <div className="text-xs text-gray-400 mt-1 space-y-1">
                {dayTasks.length > 0 && <div className="text-blue-300">📋 {dayTasks.length}</div>}
                {dayMeetings.length > 0 && <div className="text-green-300">📅 {dayMeetings.length}</div>}
                {dayTimeBlocks.length > 0 && <div className="text-yellow-300">⏱️ {dayTimeBlocks.length}</div>}
                {isDayFullyBlocked && <div className="text-red-300">🚫 Blocked</div>}
                {hasBlockedTasks && !isDayFullyBlocked && <div className="text-orange-300">⚠️ Blocked tasks</div>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Enhanced Popup Modal with Task Details */}
      {showPopup && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                <p className="text-sm text-gray-400 mt-1">{new Date(selectedDate).toISOString().split('T')[0]}</p>
              </div>
              <button
                onClick={() => {
                  setShowPopup(false);
                  onDateSelect(null);
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Day Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-blue-900 border border-blue-700 rounded-lg p-3">
                <p className="text-xs text-blue-300 font-semibold">Tasks</p>
                <p className="text-2xl font-bold text-blue-200">{tasks.filter(t => (t.due_at || t.due_date) === selectedDate).length}</p>
              </div>
              <div className="bg-green-900 border border-green-700 rounded-lg p-3">
                <p className="text-xs text-green-300 font-semibold">Meetings</p>
                <p className="text-2xl font-bold text-green-200">{meetings.filter(m => m.start_at && m.start_at.split('T')[0] === selectedDate).length}</p>
              </div>
              <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-3">
                <p className="text-xs text-yellow-300 font-semibold">Time Blocks</p>
                <p className="text-2xl font-bold text-yellow-200">{timeBlocks.filter(tb => tb.date === selectedDate).length}</p>
              </div>
            </div>

            {/* Tasks for this day */}
            {tasks.filter(t => (t.due_at || t.due_date) === selectedDate).length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-blue-400">📋</span> Tasks for this day
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {tasks.filter(t => (t.due_at || t.due_date) === selectedDate).map(task => (
                    <div key={task.id} className="p-3 bg-slate-700 rounded-lg border-l-4 border-blue-500">
                      <p className="text-white font-medium text-sm">{task.title}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {task.priority && <span className="text-xs px-2 py-1 bg-slate-600 rounded text-gray-300">{task.priority}</span>}
                        {task.status && <span className="text-xs px-2 py-1 bg-slate-600 rounded text-gray-300">{task.status}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meetings for this day */}
            {meetings.filter(m => m.start_at && m.start_at.split('T')[0] === selectedDate).length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-green-400">📅</span> Meetings for this day
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {meetings.filter(m => m.start_at && m.start_at.split('T')[0] === selectedDate).map(meeting => (
                    <div key={meeting.id} className="p-3 bg-slate-700 rounded-lg border-l-4 border-green-500">
                      <p className="text-white font-medium text-sm">{meeting.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(meeting.start_at).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Time Blocks for this day */}
            {timeBlocks.filter(tb => {
              const blockDate = tb.date || (tb.start_at ? tb.start_at.split('T')[0] : null);
              return blockDate === selectedDate;
            }).length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-yellow-400">⏱️</span> Time Blocks for this day
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {timeBlocks.filter(tb => {
                    const blockDate = tb.date || (tb.start_at ? tb.start_at.split('T')[0] : null);
                    return blockDate === selectedDate;
                  }).map(block => {
                    // Format time properly
                    const formatTime = (time: string | undefined) => {
                      if (!time) return '';
                      // Handle both HH:MM and ISO datetime formats
                      const timeStr = time.includes('T') ? time.split('T')[1].substring(0, 5) : time;
                      const [hours, minutes] = timeStr.split(':');
                      const hour = parseInt(hours);
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      const displayHour = hour % 12 || 12;
                      return `${displayHour}:${minutes}${ampm}`;
                    };
                    
                    const startTime = block.startTime || block.start_time || (block.start_at ? block.start_at.split('T')[1]?.substring(0, 5) : '09:00');
                    const endTime = block.endTime || block.end_time || (block.end_at ? block.end_at.split('T')[1]?.substring(0, 5) : '10:00');
                    
                    return (
                      <button
                        key={block.id}
                        onClick={() => {
                          if (onTimeBlockClick) {
                            onTimeBlockClick(block.id);
                            setShowPopup(false);
                          }
                        }}
                        className="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded-lg border-l-4 border-yellow-500 transition"
                      >
                        <p className="text-white font-medium text-sm">{block.title || block.type}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(startTime)} - {formatTime(endTime)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Commitments for this day */}
            {commitments.filter(c => c.date === selectedDate).length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-purple-400">🎯</span> Commitments for this day
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {commitments.filter(c => c.date === selectedDate).map(commitment => (
                    <button
                      key={commitment.id}
                      onClick={() => {
                        if (onCommitmentClick) {
                          onCommitmentClick(commitment.id);
                          setShowPopup(false);
                        }
                      }}
                      className="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded-lg border-l-4 border-purple-500 transition"
                    >
                      <p className="text-white font-medium text-sm">{commitment.title}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {commitment.priority && <span className="text-xs px-2 py-1 bg-slate-600 rounded text-gray-300">{commitment.priority}</span>}
                        {commitment.status && <span className="text-xs px-2 py-1 bg-slate-600 rounded text-gray-300">{commitment.status}</span>}
                        {commitment.planned_minutes && <span className="text-xs px-2 py-1 bg-slate-600 rounded text-gray-300">{commitment.planned_minutes}m</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Time Block Conflicts Warning */}
            {timeBlocks.filter(tb => {
              const blockDate = tb.date || (tb.start_at ? tb.start_at.split('T')[0] : null);
              return blockDate === selectedDate && !(tb.start_time === '00:00' && tb.end_time === '23:59');
            }).length > 0 && (
              <div className="mb-6 p-4 bg-yellow-900 border border-yellow-700 rounded-lg">
                <p className="text-sm font-semibold text-yellow-200 mb-2">⚠️ Time Blocks on this day:</p>
                <div className="space-y-1">
                  {timeBlocks.filter(tb => {
                    const blockDate = tb.date || (tb.start_at ? tb.start_at.split('T')[0] : null);
                    return blockDate === selectedDate && !(tb.start_time === '00:00' && tb.end_time === '23:59');
                  }).map(block => {
                    const formatTime = (time: string | undefined) => {
                      if (!time) return '';
                      const timeStr = time.includes('T') ? time.split('T')[1].substring(0, 5) : time;
                      const [hours, minutes] = timeStr.split(':');
                      const hour = parseInt(hours);
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      const displayHour = hour % 12 || 12;
                      return `${displayHour}:${minutes}${ampm}`;
                    };
                    const startTime = block.startTime || block.start_time || (block.start_at ? block.start_at.split('T')[1]?.substring(0, 5) : '09:00');
                    const endTime = block.endTime || block.end_time || (block.end_at ? block.end_at.split('T')[1]?.substring(0, 5) : '10:00');
                    return (
                      <p key={block.id} className="text-xs text-yellow-300">
                        • {block.title || block.type}: {formatTime(startTime)} - {formatTime(endTime)}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add New Items */}
            <div className="border-t border-slate-700 pt-6">
              {isDayBlocked && isDayBlocked(selectedDate) ? (
                <div className="p-4 bg-red-900 border border-red-700 rounded-lg mb-4">
                  <p className="text-sm text-red-200">
                    🚫 This day is completely blocked. You cannot add any items to this day.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-400 mb-4 font-semibold">Add new item for this day:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleAddTask}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition font-medium"
                    >
                      <Plus size={18} />
                      <span>Task</span>
                    </button>
                    <button
                      onClick={handleAddMeeting}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition font-medium"
                    >
                      <Plus size={18} />
                      <span>Meeting</span>
                    </button>
                    <button
                      onClick={handleAddTimeBlock}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition font-medium"
                    >
                      <Plus size={18} />
                      <span>Time Block</span>
                    </button>
                    <button
                      onClick={handleAddCommitment}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition font-medium"
                    >
                      <Plus size={18} />
                      <span>Commitment</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
