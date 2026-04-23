import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  totalFocusHours: number;
  averageFocusPerDay: number;
  totalMeetingHours: number;
  meetingsThisWeek: number;
  averageMeetingDuration: number;
  timeTrackedHours: number;
  productivityScore: number;
  focusHoursTarget: number;
  focusHoursCompleted: number;
  taskCompletionRate: number;
  meetingEffectiveness: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    blockedTasks: 0,
    overdueTasks: 0,
    totalFocusHours: 0,
    averageFocusPerDay: 0,
    totalMeetingHours: 0,
    meetingsThisWeek: 0,
    averageMeetingDuration: 0,
    timeTrackedHours: 0,
    productivityScore: 0,
    focusHoursTarget: 20,
    focusHoursCompleted: 0,
    taskCompletionRate: 0,
    meetingEffectiveness: 0
  });

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [tasksRes, meetingsRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/tasks?org_id=org-001'),
        fetch('http://localhost:3000/api/v1/meetings?org_id=org-001')
      ]);

      let totalTasks = 0, completedTasks = 0, inProgressTasks = 0, blockedTasks = 0, overdueTasks = 0;
      let meetingsThisWeek = 0;

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        const tasks = data.data || [];
        totalTasks = tasks.length;
        completedTasks = tasks.filter((t: any) => t.status === 'done').length;
        inProgressTasks = tasks.filter((t: any) => t.status === 'in_progress').length;
        blockedTasks = tasks.filter((t: any) => t.status === 'blocked').length;
        overdueTasks = tasks.filter((t: any) => new Date(t.due_at) < new Date() && t.status !== 'done').length;
      }

      if (meetingsRes.ok) {
        const data = await meetingsRes.json();
        meetingsThisWeek = (data.data || []).length;
      }

      const focusHoursCompleted = 8;
      const focusHoursTarget = 20;
      const productivityScore = Math.round((focusHoursCompleted / focusHoursTarget) * 100);
      const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) : 0;

      setAnalytics({
        totalTasks,
        completedTasks,
        inProgressTasks,
        blockedTasks,
        overdueTasks,
        totalFocusHours: 8,
        averageFocusPerDay: 1.6,
        totalMeetingHours: 5,
        meetingsThisWeek,
        averageMeetingDuration: 60,
        timeTrackedHours: 0,
        productivityScore,
        focusHoursTarget,
        focusHoursCompleted,
        taskCompletionRate,
        meetingEffectiveness: 85
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const focusHoursPercentage = (analytics.focusHoursCompleted / analytics.focusHoursTarget) * 100;
  const taskCompletionPercentage = analytics.totalTasks > 0 ? (analytics.completedTasks / analytics.totalTasks) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 size={40} className="text-green-400" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-400">Your productivity metrics and insights</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {(['7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeRange === range
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>

        {/* North Star Metric */}
        <div className="bg-gradient-to-r from-green-900 to-green-800 rounded-lg p-8 mb-8 border border-green-700">
          <h2 className="text-2xl font-bold mb-4">🎯 North Star Metric</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 mb-2">Focus Hours Completed ÷ Focus Hours Planned</p>
              <p className="text-5xl font-bold text-green-300">
                {(focusHoursPercentage / 100).toFixed(2)}
              </p>
              <p className="text-sm text-gray-400 mt-2">Target: ≥ 0.80</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{analytics.focusHoursCompleted}h / {analytics.focusHoursTarget}h</p>
              <p className="text-sm text-gray-300 mt-2">{focusHoursPercentage.toFixed(0)}% Complete</p>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Tasks Metric */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Tasks</h3>
              <CheckCircle size={24} className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-2">{analytics.totalTasks}</p>
            <div className="space-y-1 text-sm">
              <p className="text-green-400">✅ Completed: {analytics.completedTasks}</p>
              <p className="text-blue-400">🔄 In Progress: {analytics.inProgressTasks}</p>
              <p className="text-red-400">⚠️ Overdue: {analytics.overdueTasks}</p>
            </div>
          </div>

          {/* Focus Hours Metric */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Focus Hours</h3>
              <Clock size={24} className="text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-2">{analytics.totalFocusHours}h</p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-400">Avg/Day: {analytics.averageFocusPerDay.toFixed(1)}h</p>
              <p className="text-green-400">Target: {analytics.focusHoursTarget}h</p>
            </div>
          </div>

          {/* Meetings Metric */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Meetings</h3>
              <Calendar size={24} className="text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-2">{analytics.meetingsThisWeek}</p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-400">Total Hours: {analytics.totalMeetingHours}h</p>
              <p className="text-purple-400">Avg Duration: {analytics.averageMeetingDuration}m</p>
            </div>
          </div>

          {/* Productivity Score */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Productivity</h3>
              <TrendingUp size={24} className="text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-2">{analytics.productivityScore}%</p>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-yellow-400 to-green-400 h-2 rounded-full transition-all"
                style={{ width: `${analytics.productivityScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Completion */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6">Task Completion Rate</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Completion Rate</span>
                  <span className="text-green-400 font-bold">{taskCompletionPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${taskCompletionPercentage}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-700 rounded p-3">
                  <p className="text-gray-400 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-green-400">{analytics.completedTasks}</p>
                </div>
                <div className="bg-slate-700 rounded p-3">
                  <p className="text-gray-400 text-sm">Remaining</p>
                  <p className="text-2xl font-bold text-orange-400">{analytics.totalTasks - analytics.completedTasks}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Effectiveness */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6">Meeting Effectiveness</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Effectiveness Score</span>
                  <span className="text-purple-400 font-bold">{analytics.meetingEffectiveness}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full transition-all"
                    style={{ width: `${analytics.meetingEffectiveness}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-700 rounded p-3">
                  <p className="text-gray-400 text-sm">This Week</p>
                  <p className="text-2xl font-bold text-purple-400">{analytics.meetingsThisWeek}</p>
                </div>
                <div className="bg-slate-700 rounded p-3">
                  <p className="text-gray-400 text-sm">Total Hours</p>
                  <p className="text-2xl font-bold text-blue-400">{analytics.totalMeetingHours}h</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mt-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle size={24} className="text-yellow-400" />
            Insights & Recommendations
          </h3>
          <div className="space-y-3">
            {focusHoursPercentage < 80 && (
              <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded p-3">
                <p className="text-yellow-300">
                  💡 <strong>Focus Hours:</strong> You're at {focusHoursPercentage.toFixed(0)}% of your target. Try blocking more deep work time.
                </p>
              </div>
            )}
            {analytics.overdueTasks > 0 && (
              <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded p-3">
                <p className="text-red-300">
                  ⚠️ <strong>Overdue Tasks:</strong> You have {analytics.overdueTasks} overdue task(s). Prioritize these today.
                </p>
              </div>
            )}
            {analytics.meetingsThisWeek > 10 && (
              <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded p-3">
                <p className="text-blue-300">
                  📅 <strong>Meeting Load:</strong> You have {analytics.meetingsThisWeek} meetings this week. Consider batching or declining non-essential ones.
                </p>
              </div>
            )}
            {analytics.productivityScore >= 80 && (
              <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded p-3">
                <p className="text-green-300">
                  🎉 <strong>Great Work!</strong> Your productivity score is {analytics.productivityScore}%. Keep up the momentum!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
