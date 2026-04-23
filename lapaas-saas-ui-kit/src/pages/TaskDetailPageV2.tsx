import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Play, Pause, Plus, Save, X, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { formatTime, getPriorityColor } from '../utils/timerUtils';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface TimeEntry {
  id: string;
  start_time: string;
  end_time: string;
  duration: number;
  date: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  due_at: string;
  recurring?: boolean;
  time_tracked?: number;
  assigned_to?: string;
  blocked?: boolean;
  subtasks?: Subtask[];
  created_at?: string;
  updated_at?: string;
}

const TaskDetailPageV2: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const [editForm, setEditForm] = useState({
    title: '',
    priority: 'P2',
    status: 'pending',
    assigned_to: '',
    blocked: false,
    recurring: false,
    due_at: ''
  });
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerValue, setTimerValue] = useState(0);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualHours, setManualHours] = useState('0');
  const [manualMinutes, setManualMinutes] = useState('0');

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerValue(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/v1/tasks/${taskId}?org_id=org-001`);
      if (response.ok) {
        const data = await response.json();
        const taskData = data.data || data;
        setTask(taskData);
        setTimerValue(taskData.time_tracked || 0);
        setEditForm({
          title: taskData.title,
          priority: taskData.priority || 'P2',
          status: taskData.status || 'pending',
          assigned_to: taskData.assigned_to || '',
          blocked: taskData.blocked || false,
          recurring: taskData.recurring || false,
          due_at: taskData.due_at || ''
        });
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!task) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const data = await response.json();
        setTask(data.data || data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async () => {
    if (!task || !window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/tasks/${task.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        navigate('/founder-os');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim() || !task) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/tasks/${task.id}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newSubtaskTitle })
      });

      if (response.ok) {
        const data = await response.json();
        setTask(prev => prev ? {
          ...prev,
          subtasks: [...(prev.subtasks || []), data.data]
        } : null);
        setNewSubtaskTitle('');
      }
    } catch (error) {
      console.error('Error adding subtask:', error);
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    if (!task) return;
    try {
      const subtask = task.subtasks?.find(s => s.id === subtaskId);
      if (!subtask) return;

      const response = await fetch(`http://localhost:3000/api/v1/tasks/${task.id}/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !subtask.completed })
      });

      if (response.ok) {
        setTask(prev => prev ? {
          ...prev,
          subtasks: prev.subtasks?.map(s => 
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          )
        } : null);
      }
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!task) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/tasks/${task.id}/subtasks/${subtaskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTask(prev => prev ? {
          ...prev,
          subtasks: prev.subtasks?.filter(s => s.id !== subtaskId)
        } : null);
      }
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'text-green-400 bg-green-900/30';
      case 'in_progress':
        return 'text-blue-400 bg-blue-900/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'blocked':
        return 'text-red-400 bg-red-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  const handleStartTimer = () => {
    setTimerRunning(true);
  };

  const handleStopTimer = async () => {
    setTimerRunning(false);
    if (timerValue > 0 && task) {
      const newEntry: TimeEntry = {
        id: `entry-${Date.now()}`,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + timerValue * 1000).toISOString(),
        duration: timerValue,
        date: new Date().toISOString().split('T')[0]
      };
      setTimeEntries([...timeEntries, newEntry]);
      
      // Update task time_tracked
      const totalSeconds = (task.time_tracked || 0) + timerValue;
      try {
        await fetch(`http://localhost:3000/api/v1/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ time_tracked: totalSeconds })
        });
        setTask({ ...task, time_tracked: totalSeconds });
      } catch (error) {
        console.error('Error updating time tracked:', error);
      }
      setTimerValue(0);
    }
  };

  const handleAddManualTime = async () => {
    if (!task) return;
    const totalSeconds = parseInt(manualHours) * 3600 + parseInt(manualMinutes) * 60;
    if (totalSeconds <= 0) return;

    const newEntry: TimeEntry = {
      id: `entry-${Date.now()}`,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + totalSeconds * 1000).toISOString(),
      duration: totalSeconds,
      date: new Date().toISOString().split('T')[0]
    };
    setTimeEntries([...timeEntries, newEntry]);

    const updatedTotal = (task.time_tracked || 0) + totalSeconds;
    try {
      await fetch(`http://localhost:3000/api/v1/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time_tracked: updatedTotal })
      });
      setTask({ ...task, time_tracked: updatedTotal });
      setManualHours('0');
      setManualMinutes('0');
      setShowManualEntry(false);
    } catch (error) {
      console.error('Error adding manual time:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-xl">Task not found</p>
      </div>
    );
  }

  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const subtaskPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/founder-os?tab=productivity&subTab=tasks')}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
          >
            <ArrowLeft size={20} />
            Back to Tasks
          </button>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-400 hover:text-blue-300 transition px-4 py-2 rounded hover:bg-slate-700 flex items-center gap-2"
                >
                  <Edit2 size={18} />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-400 hover:text-red-300 transition px-4 py-2 rounded hover:bg-slate-700 flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT COLUMN (30%) - Task Overview */}
          <div className="col-span-3 space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4">Task Overview</h2>
              
              {/* Title */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Title</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white font-bold text-sm"
                  />
                ) : (
                  <p className="text-white font-bold text-sm">{task.title}</p>
                )}
              </div>

              {/* Status */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Status</p>
                {isEditing ? (
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-1 text-white text-sm"
                  >
                    <option value="pending">⏸️ Pending</option>
                    <option value="in_progress">⏳ In Progress</option>
                    <option value="done">✅ Done</option>
                    <option value="blocked">🔒 Blocked</option>
                  </select>
                ) : (
                  <div className={`inline-block px-3 py-1 rounded-full font-semibold text-xs ${getStatusColor(task.status)}`}>
                    {task.status === 'pending' && '⏸️ Pending'}
                    {task.status === 'in_progress' && '⏳ In Progress'}
                    {task.status === 'done' && '✅ Done'}
                    {task.status === 'blocked' && '🔒 Blocked'}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Priority</p>
                {isEditing ? (
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-1 text-white text-sm"
                  >
                    <option value="P1">P1 - Critical</option>
                    <option value="P2">P2 - High</option>
                    <option value="P3">P3 - Medium</option>
                    <option value="P4">P4 - Low</option>
                  </select>
                ) : (
                  <span className={`inline-block px-3 py-1 rounded-full font-semibold text-xs border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                )}
              </div>

              {/* Due Date */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Due Date</p>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="date"
                      value={editForm.due_at}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        const selectedDate = new Date(e.target.value);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (selectedDate < today) {
                          return; // Don't allow past dates
                        }
                        setEditForm({ ...editForm, due_at: e.target.value });
                      }}
                      className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 pr-10 text-white text-sm [color-scheme:dark]"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                  </div>
                ) : (
                  <p className="text-white font-semibold text-sm">
                    {task.due_at ? new Date(task.due_at).toLocaleDateString() : 'No due date'}
                  </p>
                )}
              </div>

              {/* Created/Updated */}
              <div className="border-t border-slate-700 pt-4 mt-4 space-y-2">
                <p className="text-xs text-gray-400">
                  Created: <span className="text-gray-300">{task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}</span>
                </p>
                <p className="text-xs text-gray-400">
                  Updated: <span className="text-gray-300">{task.updated_at ? new Date(task.updated_at).toLocaleDateString() : 'N/A'}</span>
                </p>
              </div>

              {/* Recurring */}
              {task.recurring && (
                <div className="mt-4 p-2 bg-blue-900/30 rounded border border-blue-700/50">
                  <p className="text-xs text-blue-300">🔄 Recurring Task</p>
                </div>
              )}
            </div>
          </div>

          {/* CENTER COLUMN (40%) - Main Content */}
          <div className="col-span-5 space-y-6">
            {/* Task Details */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4">Details</h2>
              
              {/* Description */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Description</p>
                {isEditing ? (
                  <textarea
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm h-24"
                    placeholder="Enter task description..."
                  />
                ) : (
                  <p className="text-gray-300 text-sm">{task.description || 'No description'}</p>
                )}
              </div>

              {/* Assigned To */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Assigned To</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.assigned_to}
                    onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
                    placeholder="Team member name"
                    className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-1 text-white text-sm"
                  />
                ) : (
                  <p className="text-white font-semibold text-sm">{task.assigned_to || 'Unassigned'}</p>
                )}
              </div>

              {/* Toggles */}
              {isEditing && (
                <div className="flex gap-6 bg-slate-700/50 rounded-lg p-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.recurring}
                      onChange={(e) => setEditForm({ ...editForm, recurring: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-xs">Recurring</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.blocked}
                      onChange={(e) => setEditForm({ ...editForm, blocked: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-xs">Blocked</span>
                  </label>
                </div>
              )}
            </div>

            {/* Time Tracking */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock size={20} />
                Time Tracking
              </h2>
              
              {/* Total Time Display */}
              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-400 mb-2">Total Time Spent</p>
                <p className="text-3xl font-bold text-green-400">
                  {Math.floor((task.time_tracked || 0) / 3600)}h {Math.floor(((task.time_tracked || 0) % 3600) / 60)}m
                </p>
              </div>

              {/* Timer Controls */}
              <div className="flex gap-2 mb-4">
                {!timerRunning ? (
                  <button
                    onClick={handleStartTimer}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition text-sm font-medium"
                  >
                    ▶ Start Timer
                  </button>
                ) : (
                  <button
                    onClick={handleStopTimer}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition text-sm font-medium"
                  >
                    ⏹ Stop Timer
                  </button>
                )}
                <button
                  onClick={() => setShowManualEntry(!showManualEntry)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition text-sm font-medium"
                >
                  + Manual
                </button>
              </div>

              {/* Current Session Timer */}
              {timerRunning && (
                <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-green-300 mb-1">Current Session</p>
                  <p className="text-2xl font-bold text-green-400">
                    {Math.floor(timerValue / 3600)}h {Math.floor((timerValue % 3600) / 60)}m {timerValue % 60}s
                  </p>
                </div>
              )}

              {/* Manual Time Entry */}
              {showManualEntry && (
                <div className="bg-slate-700/50 rounded-lg p-4 mb-4 space-y-3">
                  <p className="text-xs text-gray-400 font-semibold">Add Manual Time Entry</p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">Hours</label>
                      <input
                        type="number"
                        min="0"
                        value={manualHours}
                        onChange={(e) => setManualHours(e.target.value)}
                        className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">Minutes</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={manualMinutes}
                        onChange={(e) => setManualMinutes(e.target.value)}
                        className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddManualTime}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition text-sm font-medium"
                  >
                    Add Time
                  </button>
                </div>
              )}

              {/* Time Tracking History */}
              {timeEntries.length > 0 && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-xs text-gray-400 font-semibold mb-3">Time Tracking History</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {timeEntries.map((entry) => (
                      <div key={entry.id} className="flex justify-between items-center text-xs bg-slate-700/50 p-2 rounded">
                        <div>
                          <p className="text-gray-300">{entry.date}</p>
                          <p className="text-gray-400">
                            {new Date(entry.start_time).toLocaleTimeString()} - {new Date(entry.end_time).toLocaleTimeString()}
                          </p>
                        </div>
                        <p className="font-semibold text-blue-400">
                          {Math.floor(entry.duration / 3600)}h {Math.floor((entry.duration % 3600) / 60)}m
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Subtasks */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} />
                Subtasks ({completedSubtasks}/{totalSubtasks})
              </h2>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">Progress</span>
                  <span className="text-xs font-medium text-blue-400">{subtaskPercentage}%</span>
                </div>
                <div className="bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${subtaskPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Subtasks List */}
              <div className="space-y-2 mb-4">
                {task.subtasks?.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-3 bg-slate-700/50 p-3 rounded group">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => handleToggleSubtask(subtask.id)}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Subtask */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                  placeholder="Add a new subtask..."
                  className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                />
                <button
                  onClick={handleAddSubtask}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 transition text-sm"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (30%) - Actions & Statistics */}
          <div className="col-span-4 space-y-6">
            {/* Action Buttons */}
            {isEditing && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-3">
                <button
                  onClick={handleUpdate}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Save size={18} />
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Statistics */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4">Statistics</h2>
              
              <div className="space-y-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Total Time</p>
                  <p className="text-2xl font-bold text-green-400">
                    {Math.floor((task.time_tracked || 0) / 3600)}h {Math.floor(((task.time_tracked || 0) % 3600) / 60)}m
                  </p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Subtasks</p>
                  <p className="text-2xl font-bold text-blue-400">{completedSubtasks}/{totalSubtasks}</p>
                  <p className="text-xs text-gray-400 mt-1">{subtaskPercentage}% completed</p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <div className={`inline-block px-3 py-1 rounded-full font-semibold text-xs ${getStatusColor(task.status)}`}>
                    {task.status === 'pending' && '⏸️ Pending'}
                    {task.status === 'in_progress' && '⏳ In Progress'}
                    {task.status === 'done' && '✅ Done'}
                    {task.status === 'blocked' && '🔒 Blocked'}
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Priority</p>
                  <span className={`inline-block px-3 py-1 rounded-full font-semibold text-xs border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPageV2;
