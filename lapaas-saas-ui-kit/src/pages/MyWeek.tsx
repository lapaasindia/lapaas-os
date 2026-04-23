import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Calendar, AlertCircle, TrendingUp } from 'lucide-react';

interface WeekData {
  week_start: string;
  top_3: string[];
  focus_hours_planned: number;
  focus_hours_completed: number;
  meetings_count: number;
  requests_due: number;
}

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  due_at: string;
}

interface Meeting {
  id: string;
  title: string;
  start_at: string;
}

interface Request {
  id: string;
  description: string;
  urgency: string;
  sla_at: string;
}

const MyWeek: React.FC = () => {
  const [weekData, setWeekData] = useState<WeekData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeekData();
  }, []);

  const fetchWeekData = async () => {
    try {
      const [weekRes, tasksRes, meetingsRes, requestsRes] = await Promise.all([
        fetch('/api/v1/my-week?org_id=org-001&user_id=user-001'),
        fetch('/api/v1/tasks?org_id=org-001&user_id=user-001'),
        fetch('/api/v1/meetings?org_id=org-001'),
        fetch('/api/v1/requests?org_id=org-001')
      ]);

      if (weekRes.ok) setWeekData(await weekRes.json().then(r => r.data));
      if (tasksRes.ok) setTasks(await tasksRes.json().then(r => r.data));
      if (meetingsRes.ok) setMeetings(await meetingsRes.json().then(r => r.data));
      if (requestsRes.ok) setRequests(await requestsRes.json().then(r => r.data));
    } catch (error) {
      console.error('Error fetching week data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'P1': 'bg-red-900 text-red-200',
      'P2': 'bg-orange-900 text-orange-200',
      'P3': 'bg-yellow-900 text-yellow-200',
      'P4': 'bg-blue-900 text-blue-200'
    };
    return colors[priority] || 'bg-gray-700 text-gray-200';
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: { [key: string]: string } = {
      'P1': 'bg-red-900 text-red-200',
      'P2': 'bg-orange-900 text-orange-200',
      'P3': 'bg-yellow-900 text-yellow-200',
      'P4': 'bg-blue-900 text-blue-200'
    };
    return colors[urgency] || 'bg-gray-700 text-gray-200';
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading your week...</div>;
  }

  const focusCompletion = weekData ? Math.round((weekData.focus_hours_completed / weekData.focus_hours_planned) * 100) : 0;
  const todaysTasks = tasks.filter(t => {
    const today = new Date().toISOString().split('T')[0];
    return t.due_at === today;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Week</h1>
          <p className="text-gray-400">
            {weekData ? `Week of ${new Date(weekData.week_start).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}` : 'Loading...'}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Focus Hours</p>
                <p className="text-3xl font-bold text-green-400">
                  {weekData?.focus_hours_completed}/{weekData?.focus_hours_planned}h
                </p>
                <p className="text-xs text-gray-500 mt-2">{focusCompletion}% complete</p>
              </div>
              <Clock className="text-green-400" size={32} />
            </div>
            <div className="mt-4 bg-slate-700 rounded-full h-2">
              <div className="bg-green-400 h-2 rounded-full" style={{ width: `${focusCompletion}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Meetings</p>
                <p className="text-3xl font-bold text-blue-400">{weekData?.meetings_count}</p>
                <p className="text-xs text-gray-500 mt-2">This week</p>
              </div>
              <Calendar className="text-blue-400" size={32} />
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Open Requests</p>
                <p className="text-3xl font-bold text-orange-400">{weekData?.requests_due}</p>
                <p className="text-xs text-gray-500 mt-2">Due this week</p>
              </div>
              <AlertCircle className="text-orange-400" size={32} />
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Tasks Done</p>
                <p className="text-3xl font-bold text-purple-400">
                  {tasks.filter(t => t.status === 'done').length}/{tasks.length}
                </p>
                <p className="text-xs text-gray-500 mt-2">Completion rate</p>
              </div>
              <CheckCircle className="text-purple-400" size={32} />
            </div>
          </div>
        </div>

        {/* Top 3 Priorities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={24} className="text-green-400" />
              Top 3 Priorities
            </h2>
            <div className="space-y-3">
              {weekData?.top_3.map((taskId, idx) => {
                const task = tasks.find(t => t.id === taskId);
                return task ? (
                  <div key={taskId} className="flex items-start gap-4 p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{task.title}</p>
                      <p className="text-sm text-gray-400 mt-1">Due: {new Date(task.due_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Today's Tasks</h2>
            <div className="space-y-2">
              {todaysTasks.length > 0 ? (
                todaysTasks.map(task => (
                  <div key={task.id} className="p-3 bg-slate-700 rounded-lg text-sm">
                    <p className="text-white font-medium">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{task.status}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No tasks due today</p>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Upcoming Meetings</h2>
          <div className="space-y-3">
            {meetings.slice(0, 5).map(meeting => (
              <div key={meeting.id} className="flex items-start justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
                <div>
                  <p className="font-semibold text-white">{meeting.title}</p>
                  <p className="text-sm text-gray-400 mt-1">{new Date(meeting.start_at).toLocaleString()}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                  Scheduled
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Pending Requests</h2>
          <div className="space-y-3">
            {requests.slice(0, 5).map(request => (
              <div key={request.id} className="flex items-start justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
                <div className="flex-1">
                  <p className="font-semibold text-white">{request.description}</p>
                  <p className="text-sm text-gray-400 mt-1">SLA: {new Date(request.sla_at).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                  {request.urgency}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4">
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition">
            Plan Week
          </button>
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">
            Start Focus Block
          </button>
          <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyWeek;
