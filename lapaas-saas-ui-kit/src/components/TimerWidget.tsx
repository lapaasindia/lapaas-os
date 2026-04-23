import React, { useState, useEffect } from 'react';
import { Play, Pause, X, Clock } from 'lucide-react';
import { useTimer, TimerItem } from '../contexts/TimerContext';

const TimerWidget: React.FC = () => {
  const { currentTimer, isRunning, startTimer, pauseTimer, resumeTimer, stopTimer, elapsedTime } = useTimer();
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [pendingItems, setPendingItems] = useState<TimerItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch pending tasks, meetings, and commitments
  useEffect(() => {
    const fetchPendingItems = async () => {
      try {
        setLoading(true);
        const [tasksRes, meetingsRes, commitmentsRes] = await Promise.all([
          fetch('http://localhost:3000/api/v1/tasks?org_id=org-001'),
          fetch('http://localhost:3000/api/v1/meetings?org_id=org-001'),
          fetch('http://localhost:3000/api/v1/commitments?org_id=org-001')
        ]);

        const items: TimerItem[] = [];

        // Add pending tasks
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          const tasks = tasksData.data || [];
          tasks
            .filter((t: any) => t.status === 'pending' || t.status === 'todo')
            .forEach((t: any) => {
              items.push({
                id: t.id,
                name: t.title,
                type: 'task',
                elapsedSeconds: 0
              });
            });
        }

        // Add pending meetings
        if (meetingsRes.ok) {
          const meetingsData = await meetingsRes.json();
          const meetings = meetingsData.data || [];
          meetings
            .filter((m: any) => m.status === 'pending' || m.status === 'scheduled')
            .forEach((m: any) => {
              items.push({
                id: m.id,
                name: m.title,
                type: 'meeting',
                elapsedSeconds: 0
              });
            });
        }

        // Add pending commitments
        if (commitmentsRes.ok) {
          const commitmentsData = await commitmentsRes.json();
          const commitments = commitmentsData.data || [];
          commitments
            .filter((c: any) => c.status === 'pending' || c.status === 'todo')
            .forEach((c: any) => {
              items.push({
                id: c.id,
                name: c.title,
                type: 'commitment',
                elapsedSeconds: 0
              });
            });
        }

        setPendingItems(items);
      } catch (error) {
        console.error('Error fetching pending items:', error);
      } finally {
        setLoading(false);
      }
    };

    if (showTaskSelector) {
      fetchPendingItems();
    }
  }, [showTaskSelector]);

  const handleStartTimer = (item: TimerItem) => {
    startTimer(item);
    setShowTaskSelector(false);
  };

  if (!currentTimer) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowTaskSelector(!showTaskSelector)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm"
        >
          <Clock size={18} />
          Start Timer
        </button>

        {showTaskSelector && (
          <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-slate-700">
              <p className="text-sm font-semibold text-white">Select Pending Task/Meeting</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
              ) : pendingItems.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">No pending items</div>
              ) : (
                pendingItems.map((item: TimerItem) => (
                  <button
                    key={item.id}
                    onClick={() => handleStartTimer(item)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-700 transition border-b border-slate-700 last:border-b-0"
                  >
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{item.type}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
      <div className="flex items-center gap-2">
        <Clock size={18} className="text-blue-400" />
        <div>
          <p className="text-xs text-gray-400">Tracking</p>
          <p className="text-sm font-semibold text-white truncate max-w-[200px]">{currentTimer.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-600">
        <span className={`text-lg font-mono font-bold ${isRunning ? 'text-green-400' : 'text-yellow-400'}`}>
          {elapsedTime}
        </span>

        {isRunning ? (
          <button
            onClick={pauseTimer}
            className="p-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition"
            title="Pause"
          >
            <Pause size={16} />
          </button>
        ) : (
          <button
            onClick={resumeTimer}
            className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition"
            title="Resume"
          >
            <Play size={16} />
          </button>
        )}

        <button
          onClick={stopTimer}
          className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition"
          title="Stop"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default TimerWidget;
