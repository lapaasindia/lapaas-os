import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, Calendar } from 'lucide-react';
import TimeBlockModal from '../components/TimeBlockModal';
import EndOfDayReview from '../components/EndOfDayReview';
import RescheduleQueue from '../components/RescheduleQueue';
import WeekPlannerCalendar from '../components/WeekPlannerCalendar';
import ScheduleItemModal from '../components/ScheduleItemModal';
import DailyCommitmentsManager from '../components/DailyCommitmentsManager';
import { useUser } from '../contexts/UserContext';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  due_at: string;
  start_time?: string;
  end_time?: string;
  recurring?: boolean;
  time_tracked?: number;
  assigned_to?: string;
  blocked?: boolean;
  subtasks?: Subtask[];
  type?: 'task' | 'meeting' | 'commitment' | 'request';
}

interface Meeting {
  id: string;
  title: string;
  start_at?: string;
  startAt?: string;
  end_at?: string;
  endAt?: string;
  status?: string;
}

interface Request {
  id: string;
  description: string;
  urgency: string;
  status: string;
  sla_at: string;
}

interface TimeBlock {
  id: string;
  title?: string;
  type?: string;
  start_time?: string;
  end_time?: string;
  startTime?: string;
  endTime?: string;
  start_at?: string;
  end_at?: string;
  date: string;
  goal_minutes?: number;
  color?: string;
  notes?: string;
}

interface Commitment {
  id: string;
  title: string;
  date: string;
  effort_minutes?: number;
  planned_minutes?: number;
  actual_minutes?: number;
  priority?: string;
  status?: string;
}

interface WeekData {
  focus_hours_planned: number;
  focus_hours_completed: number;
  meetings_count: number;
  requests_due: number;
  tasks_total: number;
  tasks_done: number;
  focus_completion_rate: number;
  meeting_effectiveness: number;
  interruptions_prevented: number;
  agenda_compliance: number;
}

const FounderOSMyWeek: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  // Get user-specific IDs
  const userId = user?.id || 'user-001';
  const orgId = user?.orgId || 'org-001';
  
  const [weekData, setWeekData] = useState<WeekData>({
    focus_hours_planned: 0,
    focus_hours_completed: 0,
    meetings_count: 0,
    requests_due: 0,
    tasks_total: 0,
    tasks_done: 0,
    focus_completion_rate: 0,
    meeting_effectiveness: 0,
    interruptions_prevented: 0,
    agenda_compliance: 0
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [dailyCommitments, setDailyCommitments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timerRunning, setTimerRunning] = useState<string | null>(null);
  const [timerValues, setTimerValues] = useState<{ [key: string]: number }>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTimeBlockModal, setShowTimeBlockModal] = useState(false);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [selectedTaskForSubtasks, setSelectedTaskForSubtasks] = useState<Task | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [timeBlockForm, setTimeBlockForm] = useState({ title: '', start_time: '09:00', end_time: '10:00' });
  
  // New Phase 1 & 2 Features
  const [showWeekPlanner] = useState(true);
  const [showEndOfDay, setShowEndOfDay] = useState(false);
  const [showRescheduleQueue, setShowRescheduleQueue] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleModalDate, setScheduleModalDate] = useState<string | null>(null);
  const [blockedDays, setBlockedDays] = useState<Set<string>>(new Set());

  // Prevent multiple fetches
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && userId) {
      hasInitialized.current = true;
      fetchWeekData();
    }
  }, [userId, orgId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerValues(prev => ({
          ...prev,
          [timerRunning]: (prev[timerRunning] || 0) + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const fetchWeekData = async () => {
    try {
      setLoading(true);
      const [tasksRes, meetingsRes, requestsRes, weekRes, timeBlocksRes, commitmentsRes, dailyCommitmentsRes] = await Promise.all([
        fetch(`http://localhost:3000/api/v1/tasks?org_id=${orgId}&user_id=${userId}`),
        fetch(`http://localhost:3000/api/v1/meetings?org_id=${orgId}&user_id=${userId}`),
        fetch(`http://localhost:3000/api/v1/requests?org_id=${orgId}&user_id=${userId}`),
        fetch(`http://localhost:3000/api/v1/my-week?org_id=${orgId}&user_id=${userId}`),
        fetch(`http://localhost:3000/api/v1/time-blocks?org_id=${orgId}&user_id=${userId}`),
        fetch(`http://localhost:3000/api/v1/commitments?org_id=${orgId}&user_id=${userId}`),
        fetch(`http://localhost:3000/api/v1/daily-commitments?org_id=${orgId}&user_id=${userId}`)
      ]);

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data.data || []);
      }
      if (meetingsRes.ok) {
        const data = await meetingsRes.json();
        setMeetings(data.data || []);
      }
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setRequests(data.data || []);
      }
      if (weekRes.ok) {
        const data = await weekRes.json();
        setWeekData(prev => ({ ...prev, ...data.data || {} }));
      }
      if (timeBlocksRes.ok) {
        const data = await timeBlocksRes.json();
        setTimeBlocks(data.data || []);
      }
      if (commitmentsRes.ok) {
        const data = await commitmentsRes.json();
        setCommitments(data.data || []);
      }
      if (dailyCommitmentsRes.ok) {
        const data = await dailyCommitmentsRes.json();
        setDailyCommitments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching week data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handler functions - removed handleCreateTask as we now navigate to detail page

  const handleDeleteTask = async (taskId: string) => {
    try {
      // Find which type of item this is
      const task = allTasks.find(t => t.id === taskId);
      if (!task) return;

      if (task.type === 'request') {
        await fetch(`http://localhost:3000/api/v1/requests/${taskId}`, { method: 'DELETE' });
        setRequests(requests.filter(r => r.id !== taskId));
      } else {
        await fetch(`http://localhost:3000/api/v1/tasks/${taskId}`, { method: 'DELETE' });
        setTasks(tasks.filter(t => t.id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    try {
      // Handle different item types
      if (task.type === 'request') {
        const response = await fetch(`http://localhost:3000/api/v1/requests/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        if (response.ok) {
          setRequests(requests.map(r => r.id === task.id ? { ...r, status: newStatus } : r));
        }
      } else {
        const response = await fetch(`http://localhost:3000/api/v1/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        if (response.ok) {
          setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
        }
      }
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };

  const handleStartTimer = (taskId: string) => {
    setTimerRunning(taskId);
  };

  const handlePauseTimer = async (taskId: string) => {
    setTimerRunning(null);
    const timeInMinutes = (timerValues[taskId] || 0) / 60;
    try {
      await fetch(`http://localhost:3000/api/v1/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time_tracked: timeInMinutes })
      });
    } catch (error) {
      console.error('Error saving timer:', error);
    }
  };

  const handleCreateTimeBlock = async () => {
    if (!timeBlockForm.title) return;
    try {
      const url = editingId 
        ? `http://localhost:3000/api/v1/time-blocks/${editingId}`
        : 'http://localhost:3000/api/v1/time-blocks';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: timeBlockForm.title,
          start_at: timeBlockForm.start_time,
          end_at: timeBlockForm.end_time,
          org_id: 'org-001',
          date: selectedDate || new Date().toISOString().split('T')[0],
          color: '#FF6B6B',
          goal_minutes: 60,
          notes: ''
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (editingId) {
          setTimeBlocks(timeBlocks.map(b => b.id === editingId ? result.data : b));
        } else {
          setTimeBlocks([...timeBlocks, result.data]);
        }
        setTimeBlockForm({ title: '', start_time: '09:00', end_time: '10:00' });
        setShowTimeBlockModal(false);
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error creating/updating time block:', error);
    }
  };

  const handleDeleteTimeBlock = async (blockId: string) => {
    try {
      await fetch(`http://localhost:3000/api/v1/time-blocks/${blockId}`, { method: 'DELETE' });
      setTimeBlocks(timeBlocks.filter(b => b.id !== blockId));
    } catch (error) {
      console.error('Error deleting time block:', error);
    }
  };

  const handleAddSubtask = async (taskId: string, subtaskTitle: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: subtaskTitle })
      });
      
      if (response.ok) {
        const result = await response.json();
        setTasks(tasks.map(t => t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), result.data] } : t));
      }
    } catch (error) {
      console.error('Error adding subtask:', error);
    }
  };

  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    try {
      await fetch(`http://localhost:3000/api/v1/tasks/${taskId}/subtasks/${subtaskId}`, { method: 'DELETE' });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks?.filter(s => s.id !== subtaskId) } : t));
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const subtask = task?.subtasks?.find(s => s.id === subtaskId);
      
      if (subtask) {
        await fetch(`http://localhost:3000/api/v1/tasks/${taskId}/subtasks/${subtaskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: !subtask.completed })
        });
        
        setTasks(tasks.map(t => t.id === taskId ? {
          ...t,
          subtasks: t.subtasks?.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
        } : t));
      }
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  // Combine tasks and requests only (no meetings or commitments)
  const allTasks = useMemo(() => [
    ...tasks.map(t => ({
      ...t,
      type: 'task' as const,
      subtasks: t.subtasks || []
    })),
    ...requests.map(r => ({
      id: r.id,
      title: `[REQUEST] ${r.description}`,
      priority: r.urgency,
      status: r.status,
      due_at: r.sla_at,
      recurring: false,
      time_tracked: 0,
      assigned_to: '',
      blocked: false,
      subtasks: [] as Subtask[],
      type: 'request' as const
    }))
  ], [tasks, requests, meetings, commitments]);

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading My Week...</div>;
  }

  const focusPercentage = weekData.focus_hours_planned > 0 
    ? (weekData.focus_hours_completed / weekData.focus_hours_planned) * 100 
    : 0;
  const tasksPercentage = weekData.tasks_total > 0 
    ? (weekData.tasks_done / weekData.tasks_total) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="w-full">

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          {/* Focus Hours */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-3 sm:p-4 lg:p-6 hover:border-slate-500 transition">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Focus Hours</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-400">{weekData.focus_hours_completed}/{weekData.focus_hours_planned}h</p>
              </div>
              <Clock className="text-green-400 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="bg-slate-600 rounded-full h-1.5 sm:h-2 mb-1 sm:mb-2">
              <div className="bg-green-400 h-1.5 sm:h-2 rounded-full transition-all" style={{ width: `${Math.min(focusPercentage, 100)}%` }}></div>
            </div>
            <p className="text-xs text-gray-500">{Math.round(focusPercentage)}% complete</p>
          </div>

          {/* Meetings */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-3 sm:p-4 lg:p-6 hover:border-slate-500 transition">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Meetings</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-400">{weekData.meetings_count}</p>
              </div>
              <Calendar className="text-blue-400 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <p className="text-xs text-gray-500">This week</p>
            <p className="text-xs text-gray-400 mt-1 sm:mt-2 hidden sm:block">Effectiveness: {weekData.meeting_effectiveness}%</p>
          </div>

          {/* Open Requests */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-3 sm:p-4 lg:p-6 hover:border-slate-500 transition">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Open Requests</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-400">{weekData.requests_due}</p>
              </div>
              <AlertCircle className="text-orange-400 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <p className="text-xs text-gray-500">Due this week</p>
            <p className="text-xs text-gray-400 mt-1 sm:mt-2 hidden sm:block">Interruptions prevented: {weekData.interruptions_prevented}</p>
          </div>

          {/* Tasks Done */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-3 sm:p-4 lg:p-6 hover:border-slate-500 transition">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Tasks Done</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-400">{weekData.tasks_done}/{weekData.tasks_total}</p>
              </div>
              <CheckCircle className="text-purple-400 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="bg-slate-600 rounded-full h-1.5 sm:h-2 mb-1 sm:mb-2">
              <div className="bg-purple-400 h-1.5 sm:h-2 rounded-full transition-all" style={{ width: `${Math.min(tasksPercentage, 100)}%` }}></div>
            </div>
            <p className="text-xs text-gray-500">{Math.round(tasksPercentage)}% complete</p>
          </div>
        </div>

        {/* Week Planner Calendar - Time Blocking View */}
        {showWeekPlanner && (
          <WeekPlannerCalendar
            items={[
              ...allTasks.map(t => ({
                id: t.id,
                title: t.title || 'Untitled',
                type: t.type as 'task' | 'meeting' | 'commitment' | 'request',
                date: (t as any).due_date || t.due_at,
                start_at: (t as any).start_at || (t as any).due_date || t.due_at,
                end_at: (t as any).end_at,
                due_at: (t as any).due_date || t.due_at,
                startTime: (t as any).scheduled_start_time || (t as any).due_time || (t as any).start_time || (t as any).start_at?.split('T')[1]?.substring(0, 5),
                endTime: (t as any).scheduled_end_time || (t as any).end_time || (t as any).end_at?.split('T')[1]?.substring(0, 5),
                priority: t.priority,
                status: t.status
              })),
              ...timeBlocks.map(b => {
                const startTime = b.startTime || b.start_time || '09:00';
                const endTime = b.endTime || b.end_time || '10:00';
                return {
                  id: b.id,
                  title: b.title || 'Time Block',
                  type: 'task' as const,
                  startTime,
                  endTime,
                  start_at: b.date ? `${b.date}T${startTime}:00` : undefined,
                  end_at: b.date ? `${b.date}T${endTime}:00` : undefined,
                  date: b.date
                };
              }),
              ...commitments.map(c => ({
                id: c.id,
                title: c.title || 'Commitment',
                type: 'commitment' as const,
                date: c.date,
                priority: c.priority,
                status: c.status
              })),
              // Add meetings to the calendar
              ...meetings.map(m => {
                // Extract date from start_at or start_time
                const meetingDate = m.start_at?.split('T')[0] || (m as any).date || (m as any).start_date;
                const startTime = m.start_at?.split('T')[1]?.substring(0, 5) || (m as any).start_time || '09:00';
                const endTime = m.end_at?.split('T')[1]?.substring(0, 5) || (m as any).end_time || '10:00';
                return {
                  id: m.id,
                  title: m.title || 'Meeting',
                  type: 'meeting' as const,
                  date: meetingDate,
                  start_at: m.start_at,
                  end_at: m.end_at,
                  startTime,
                  endTime,
                  status: m.status
                };
              }),
              ...dailyCommitments.flatMap(dc => {
                // Expand recurring daily commitments to all dates in range
                const items = [];
                const startDate = new Date(dc.start_date || new Date().toISOString().split('T')[0]);
                const endDate = dc.end_date ? new Date(dc.end_date) : startDate;
                
                // Generate all dates between start and end
                for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                  const dateStr = d.toISOString().split('T')[0];
                  items.push({
                    id: `${dc.id}-${dateStr}`,
                    title: dc.title || 'Daily Habit',
                    type: 'commitment' as const,
                    date: dateStr,
                    start_at: `${dateStr}T${dc.start_time}:00`,
                    end_at: `${dateStr}T${dc.end_time}:00`,
                    startTime: dc.start_time,
                    endTime: dc.end_time,
                    priority: 'P2',
                    status: 'active',
                    recurring: true
                  });
                }
                return items;
              })
            ]}
            onItemClick={(item) => {
              if (item.type === 'meeting') {
                navigate(`/meeting/${item.id}`);
              } else if (item.type === 'commitment') {
                navigate(`/commitment/${item.id}`);
              } else if (item.type === 'request') {
                navigate(`/request/${item.id}`);
              } else {
                navigate(`/task/${item.id}`);
              }
            }}
            onScheduleItem={(item, date) => {
              // Update the item's date when dragged to a new day
              if (item.type === 'task' || item.type === 'request') {
                // Update task/request date
                fetch(`http://localhost:3000/api/v1/tasks/${item.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ due_at: date })
                }).then(() => {
                  // Refresh data
                  fetchWeekData();
                }).catch(err => console.error('Error updating task date:', err));
              } else if (item.type === 'commitment') {
                // Update commitment date
                fetch(`http://localhost:3000/api/v1/commitments/${item.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ date })
                }).then(() => {
                  fetchWeekData();
                }).catch(err => console.error('Error updating commitment date:', err));
              }
            }}
            onAddItem={(date) => {
              // Check if day is blocked
              if (blockedDays.has(date)) {
                alert('This day is blocked. You cannot add items to a blocked day.');
                return;
              }
              // Show schedule modal to add existing task or block day
              setScheduleModalDate(date);
              setShowScheduleModal(true);
            }}
          />
        )}


        {/* Requests Section */}
        {requests.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              🚨 Pending Requests
            </h2>
            <div className="space-y-3">
              {requests.map(request => {
                const urgencyColor = {
                  'P1': 'bg-red-900 text-red-200',
                  'P2': 'bg-orange-900 text-orange-200',
                  'P3': 'bg-yellow-900 text-yellow-200',
                  'P4': 'bg-blue-900 text-blue-200'
                }[request.urgency] || 'bg-gray-700 text-gray-200';

                return (
                  <div
                    key={request.id}
                    onClick={() => navigate(`/request/${request.id}`)}
                    className="p-4 bg-slate-700 rounded-lg border-l-4 border-orange-500 hover:bg-slate-600 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{request.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          SLA: {new Date(request.sla_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${urgencyColor}`}>
                        {request.urgency}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Commitments */}
        <DailyCommitmentsManager
          commitments={dailyCommitments}
          onAdd={async (commitment) => {
            try {
              const response = await fetch('http://localhost:3000/api/v1/daily-commitments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...commitment,
                  org_id: 'org-001',
                  user_id: 'user-001'
                })
              });
              if (response.ok) {
                fetchWeekData();
              }
            } catch (error) {
              console.error('Error creating daily commitment:', error);
            }
          }}
          onEdit={async (commitment) => {
            try {
              const response = await fetch(`http://localhost:3000/api/v1/daily-commitments/${commitment.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commitment)
              });
              if (response.ok) {
                fetchWeekData();
              }
            } catch (error) {
              console.error('Error updating daily commitment:', error);
            }
          }}
          onDelete={async (commitmentId) => {
            try {
              const response = await fetch(`http://localhost:3000/api/v1/daily-commitments/${commitmentId}`, {
                method: 'DELETE'
              });
              if (response.ok) {
                fetchWeekData();
              }
            } catch (error) {
              console.error('Error deleting daily commitment:', error);
            }
          }}
        />

        {/* Reschedule Queue */}
        {showRescheduleQueue && (
          <RescheduleQueue 
            userId="user-001"
            orgId="org-001"
            onClose={() => setShowRescheduleQueue(false)}
          />
        )}

        {/* End of Day Review Modal */}
        {showEndOfDay && (
          <EndOfDayReview 
            userId="user-001"
            orgId="org-001"
            onClose={() => setShowEndOfDay(false)}
          />
        )}

        {/* Modals */}
        <TimeBlockModal
          show={showTimeBlockModal}
          editingId={editingId}
          timeBlockForm={timeBlockForm}
          onFormChange={setTimeBlockForm}
          onCreate={handleCreateTimeBlock}
          onClose={() => setShowTimeBlockModal(false)}
        />


        {/* Schedule Item Modal */}
        {scheduleModalDate && (
          <ScheduleItemModal
            show={showScheduleModal}
            date={scheduleModalDate}
            pendingTasks={tasks.filter(t => t.status === 'pending' || t.status === 'todo')}
            onClose={() => setShowScheduleModal(false)}
            onScheduleTask={(taskId, date, startTime, endTime) => {
              // Check if this is a "Block Specific Time" request
              if (taskId === 'blocked-time') {
                // Create a time block for the specific time window
                fetch('http://localhost:3000/api/v1/time-blocks', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: 'Blocked Time',
                    date,
                    startTime,
                    endTime,
                    blockType: 'blocked',
                    userId: 'user-001',
                    orgId: 'org-001'
                  })
                }).then(() => {
                  fetchWeekData();
                }).catch(err => console.error('Error blocking time:', err));
              } else {
                // Update task date and time
                fetch(`http://localhost:3000/api/v1/tasks/${taskId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    due_date: date,
                    due_time: startTime,
                    scheduled_start_time: startTime,
                    scheduled_end_time: endTime
                  })
                }).then((response) => {
                  if (!response.ok) {
                    console.error('Failed to schedule task:', response.status);
                  }
                  fetchWeekData();
                }).catch(err => console.error('Error scheduling task:', err));
              }
            }}
            onBlockDay={(date) => {
              // Create a time block for the entire day
              fetch('http://localhost:3000/api/v1/time-blocks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: 'Blocked Day',
                  date,
                  startTime: '00:00',
                  endTime: '23:59',
                  blockType: 'blocked',
                  userId: 'user-001',
                  orgId: 'org-001'
                })
              }).then(() => {
                // Add to blocked days set
                setBlockedDays(prev => new Set([...prev, date]));
                fetchWeekData();
              }).catch(err => console.error('Error blocking day:', err));
            }}
          />
        )}

      </div>
    </div>
  );
};

export default FounderOSMyWeek;
