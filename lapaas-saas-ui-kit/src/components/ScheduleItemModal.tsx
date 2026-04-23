import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  priority?: string;
  status?: string;
}

interface ScheduleItemModalProps {
  show: boolean;
  date: string;
  pendingTasks: Task[];
  onClose: () => void;
  onScheduleTask: (taskId: string, date: string, startTime?: string, endTime?: string, blockType?: 'time' | 'day') => void;
  onBlockDay: (date: string) => void;
}

const ScheduleItemModal: React.FC<ScheduleItemModalProps> = ({
  show,
  date,
  pendingTasks,
  onClose,
  onScheduleTask,
  onBlockDay
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [blockType, setBlockType] = useState<'time' | 'day' | null>(null);

  const handleSchedule = () => {
    if (blockType === 'day') {
      onBlockDay(date);
    } else if (blockType === 'time' && !selectedTaskId) {
      // Block specific time
      onScheduleTask('blocked-time', date, startTime, endTime, 'time');
    } else if (selectedTaskId) {
      onScheduleTask(selectedTaskId, date, startTime, endTime, 'time');
    }
    onClose();
  };

  if (!show) return null;

  const dateObj = new Date(date);
  const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Schedule for {dateStr}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Block Options */}
        <div className="mb-6 space-y-3">
          {/* Block Time */}
          <div className="p-4 bg-slate-700 rounded-lg border-2 border-slate-600">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="blockType"
                value="time"
                checked={blockType === 'time' && !selectedTaskId}
                onChange={() => {
                  setBlockType('time');
                  setSelectedTaskId(null);
                }}
                className="w-4 h-4"
              />
              <div>
                <p className="font-semibold text-white">Block Specific Time</p>
                <p className="text-xs text-gray-400">Block a time window on this day</p>
              </div>
            </label>
          </div>

          {/* Block Entire Day */}
          <div className="p-4 bg-slate-700 rounded-lg border-2 border-slate-600">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="blockType"
                value="day"
                checked={blockType === 'day'}
                onChange={() => {
                  setBlockType('day');
                  setSelectedTaskId(null);
                }}
                className="w-4 h-4"
              />
              <div>
                <p className="font-semibold text-white">Block Entire Day</p>
                <p className="text-xs text-gray-400">No items can be added to this day</p>
              </div>
            </label>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="mb-6">
          <p className="font-semibold text-white mb-3">Or Add Existing Task</p>
          
          {pendingTasks.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">No pending tasks available</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {pendingTasks.map((task) => (
                <label
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                    selectedTaskId === task.id
                      ? 'bg-blue-900 border-blue-500'
                      : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="task"
                    value={task.id}
                    checked={selectedTaskId === task.id}
                    onChange={() => {
                      setSelectedTaskId(task.id);
                      setBlockType('time');
                    }}
                    className="w-4 h-4 mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{task.title}</p>
                    <div className="flex gap-2 mt-1">
                      {task.priority && (
                        <span className="text-xs px-2 py-1 bg-slate-600 rounded text-gray-300">
                          {task.priority}
                        </span>
                      )}
                      {task.status && (
                        <span className="text-xs px-2 py-1 bg-slate-600 rounded text-gray-300">
                          {task.status}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Time Selection */}
        {(selectedTaskId || (blockType === 'time' && !selectedTaskId)) && (
          <div className="mb-6 p-4 bg-slate-700 rounded-lg border border-slate-600">
            <p className="font-semibold text-white mb-3 flex items-center gap-2">
              <Clock size={16} />
              Set Time Window
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={!blockType}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition font-semibold"
          >
            {blockType === 'day' ? 'Block Day' : blockType === 'time' && !selectedTaskId ? 'Block Time' : 'Schedule Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleItemModal;
