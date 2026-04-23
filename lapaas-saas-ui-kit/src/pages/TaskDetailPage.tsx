import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Play, Pause, Plus, CheckCircle2, Circle } from 'lucide-react';
import { formatTime, getPriorityColor } from '../utils/timerUtils';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
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

const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerValue, setTimerValue] = useState(0);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);

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
        setTask(data.data || data);
        setTimerValue(data.data?.time_tracked || data?.time_tracked || 0);
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
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
      await fetch(`http://localhost:3000/api/v1/tasks/${task.id}/subtasks/${subtaskId}`, {
        method: 'DELETE'
      });

      setTask(prev => prev ? {
        ...prev,
        subtasks: prev.subtasks?.filter(s => s.id !== subtaskId)
      } : null);
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  const handleSaveTimer = async () => {
    if (!task) return;

    try {
      await fetch(`http://localhost:3000/api/v1/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time_tracked: timerValue })
      });
      setTimerRunning(false);
    } catch (error) {
      console.error('Error saving timer:', error);
    }
  };

  const handleDeleteTask = async () => {
    if (!task || !window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await fetch(`http://localhost:3000/api/v1/tasks/${task.id}`, {
        method: 'DELETE'
      });
      navigate('/founder-os');
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const completedSubtasks = task?.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = task?.subtasks?.length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white">Task not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/founder-os')}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
          >
            <ArrowLeft size={20} />
            Back to My Week
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition"
            >
              <Edit2 size={18} />
              Edit
            </button>
            <button
              onClick={handleDeleteTask}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 transition"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        {/* Task Info Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-4">{task.title}</h1>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  task.status === 'done' ? 'bg-green-900 text-green-200' :
                  task.blocked ? 'bg-red-900 text-red-200' :
                  'bg-yellow-900 text-yellow-200'
                }`}>
                  {task.status === 'done' ? '✅ Done' : task.blocked ? '🔒 Blocked' : '⏸️ Pending'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Priority:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Due:</span>
                <span className="text-white">{new Date(task.due_at).toLocaleDateString()}</span>
              </div>
              {task.assigned_to && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Assigned to:</span>
                  <span className="text-white">{task.assigned_to}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timer Section */}
          <div className="bg-slate-700 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Time Tracking</h3>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-mono font-bold text-blue-400">
                {formatTime(timerValue)}
              </div>
              <div className="flex gap-2">
                {timerRunning ? (
                  <button
                    onClick={() => handleSaveTimer()}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded flex items-center gap-2 transition"
                  >
                    <Pause size={18} />
                    Stop & Save
                  </button>
                ) : (
                  <button
                    onClick={() => setTimerRunning(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2 transition"
                  >
                    <Play size={18} />
                    Start Timer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <span className="text-gray-500">Created:</span>
              <p>{task.created_at ? new Date(task.created_at).toLocaleString() : 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500">Updated:</span>
              <p>{task.updated_at ? new Date(task.updated_at).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Subtasks Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 size={24} />
              Subtasks ({completedSubtasks}/{totalSubtasks})
            </h2>
          </div>

          {/* Add Subtask */}
          <div className="mb-6 flex gap-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
              placeholder="Add a new subtask..."
              className="flex-1 bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleAddSubtask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition"
            >
              <Plus size={18} />
              Add
            </button>
          </div>

          {/* Subtasks List */}
          {task.subtasks && task.subtasks.length > 0 ? (
            <div className="space-y-2">
              {task.subtasks.map(subtask => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-3 p-3 bg-slate-700 rounded hover:bg-slate-600 transition"
                >
                  <button
                    onClick={() => handleToggleSubtask(subtask.id)}
                    className="text-gray-400 hover:text-white transition"
                  >
                    {subtask.completed ? (
                      <CheckCircle2 size={20} className="text-green-400" />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>
                  <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                    {subtask.title}
                  </span>
                  <button
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No subtasks yet. Add one to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
