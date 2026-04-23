import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, CheckCircle2, Circle, TrendingUp, Clock, Plus, Trash } from 'lucide-react';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface DailyCommitment {
  id: string;
  title: string;
  date: string;
  effort_minutes: number;
  status?: string;
  completed?: boolean;
  priority?: string;
  subtasks?: Subtask[];
  time_spent?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const DailyCommitmentDetailPage: React.FC = () => {
  const { commitmentId } = useParams<{ commitmentId: string }>();
  const navigate = useNavigate();
  const [commitment, setCommitment] = useState<DailyCommitment | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [notes, setNotes] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    fetchCommitmentDetails();
  }, [commitmentId]);

  useEffect(() => {
    if (!timerRunning) return;

    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning]);

  const fetchCommitmentDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/v1/commitments/${commitmentId}?org_id=org-001`);
      if (response.ok) {
        const data = await response.json();
        setCommitment(data.data || data);
        setTimeSpent(data.data?.time_spent || data?.time_spent || 0);
        setNotes(data.data?.notes || data?.notes || '');
      }
    } catch (error) {
      console.error('Error fetching commitment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim() || !commitment) return;

    try {
      const response = await fetch(`http://localhost:3000/api/v1/commitments/${commitment.id}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newSubtaskTitle })
      });

      if (response.ok) {
        const data = await response.json();
        setCommitment(prev => prev ? {
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
    if (!commitment) return;

    try {
      const subtask = commitment.subtasks?.find(s => s.id === subtaskId);
      if (!subtask) return;

      const response = await fetch(`http://localhost:3000/api/v1/commitments/${commitment.id}/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !subtask.completed })
      });

      if (response.ok) {
        setCommitment(prev => prev ? {
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
    if (!commitment) return;

    try {
      await fetch(`http://localhost:3000/api/v1/commitments/${commitment.id}/subtasks/${subtaskId}`, {
        method: 'DELETE'
      });

      setCommitment(prev => prev ? {
        ...prev,
        subtasks: prev.subtasks?.filter(s => s.id !== subtaskId)
      } : null);
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  const handleSaveProgress = async () => {
    if (!commitment) return;

    try {
      await fetch(`http://localhost:3000/api/v1/commitments/${commitment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time_spent: timeSpent,
          notes,
          status: commitment.completed ? 'done' : 'pending'
        })
      });
      setTimerRunning(false);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleToggleCompletion = async () => {
    if (!commitment) return;

    try {
      await fetch(`http://localhost:3000/api/v1/commitments/${commitment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: !commitment.completed,
          status: !commitment.completed ? 'done' : 'pending'
        })
      });

      setCommitment(prev => prev ? {
        ...prev,
        completed: !prev.completed,
        status: !prev.completed ? 'done' : 'pending'
      } : null);
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  };

  const handleDeleteCommitment = async () => {
    if (!commitment || !window.confirm('Are you sure you want to delete this commitment?')) return;

    try {
      await fetch(`http://localhost:3000/api/v1/commitments/${commitment.id}`, {
        method: 'DELETE'
      });
      navigate('/founder-os');
    } catch (error) {
      console.error('Error deleting commitment:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completedSubtasks = commitment?.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = commitment?.subtasks?.length || 0;
  const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  const timeSpentMinutes = Math.floor(timeSpent / 60);
  const effortMinutes = commitment?.effort_minutes || 0;
  const timePercent = effortMinutes > 0 ? (timeSpentMinutes / effortMinutes) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!commitment) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white">Commitment not found</div>
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
              onClick={handleToggleCompletion}
              className={`px-4 py-2 rounded flex items-center gap-2 transition ${
                commitment.completed
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {commitment.completed ? '✅ Completed' : '⏸️ In Progress'}
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition">
              <Edit2 size={18} />
              Edit
            </button>
            <button
              onClick={handleDeleteCommitment}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 transition"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        {/* Commitment Title */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-2">🎯 {commitment.title}</h1>
          <p className="text-gray-400">
            {new Date(commitment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Progress Tracking */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Time Progress */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={24} className="text-blue-400" />
              <h2 className="text-xl font-bold">Time Progress</h2>
            </div>

            <div className="mb-4">
              <div className="text-3xl font-mono font-bold text-blue-400 mb-2">
                {formatTime(timeSpent)}
              </div>
              <p className="text-gray-400 text-sm">
                Target: {effortMinutes} minutes ({Math.floor(effortMinutes / 60)}h {effortMinutes % 60}m)
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-3 mb-3 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  timePercent >= 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(timePercent, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {timeSpentMinutes} / {effortMinutes} minutes ({Math.round(timePercent)}%)
            </p>

            {/* Timer Controls */}
            <div className="flex gap-2">
              {timerRunning ? (
                <button
                  onClick={() => handleSaveProgress()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                >
                  Stop & Save
                </button>
              ) : (
                <button
                  onClick={() => setTimerRunning(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                >
                  Start Timer
                </button>
              )}
            </div>
          </div>

          {/* Subtasks Progress */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={24} className="text-purple-400" />
              <h2 className="text-xl font-bold">Subtasks Progress</h2>
            </div>

            <div className="mb-4">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {completedSubtasks}/{totalSubtasks}
              </div>
              <p className="text-gray-400 text-sm">Subtasks completed</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-3 mb-3 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  progressPercent >= 100 ? 'bg-green-500' : 'bg-purple-500'
                }`}
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-400">
              {Math.round(progressPercent)}% complete
            </p>
          </div>
        </div>

        {/* Subtasks Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 size={24} />
            Subtasks
          </h2>

          {/* Add Subtask */}
          <div className="mb-6 flex gap-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
              placeholder="Add a subtask..."
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
          {commitment.subtasks && commitment.subtasks.length > 0 ? (
            <div className="space-y-2">
              {commitment.subtasks.map(subtask => (
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
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No subtasks yet. Add one to break down your commitment!</p>
          )}
        </div>

        {/* Notes Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">📝 Daily Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about your progress today..."
            className="w-full h-32 bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none mb-4"
          />
          <button
            onClick={handleSaveProgress}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition"
          >
            Save Progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyCommitmentDetailPage;
