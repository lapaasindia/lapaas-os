import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Play, Pause, Plus, Save, X } from 'lucide-react';

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

const DailyCommitmentDetailPageV2: React.FC = () => {
  const { commitmentId } = useParams<{ commitmentId: string }>();
  const navigate = useNavigate();
  const [commitment, setCommitment] = useState<DailyCommitment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    effort_minutes: 0,
    status: 'pending',
    priority: 'P2'
  });
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
        const commitmentData = data.data || data;
        setCommitment(commitmentData);
        setTimeSpent(commitmentData.time_spent || 0);
        setNotes(commitmentData.notes || '');
        setEditForm({
          title: commitmentData.title,
          effort_minutes: commitmentData.effort_minutes || 0,
          status: commitmentData.status || 'pending',
          priority: commitmentData.priority || 'P2'
        });
      }
    } catch (error) {
      console.error('Error fetching commitment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!commitment) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/commitments/${commitment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const data = await response.json();
        setCommitment(data.data || data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating commitment:', error);
    }
  };

  const handleDelete = async () => {
    if (!commitment || !window.confirm('Are you sure you want to delete this commitment?')) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/commitments/${commitment.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        navigate('/founder-os');
      }
    } catch (error) {
      console.error('Error deleting commitment:', error);
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
      const response = await fetch(`http://localhost:3000/api/v1/commitments/${commitment.id}/subtasks/${subtaskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCommitment(prev => prev ? {
          ...prev,
          subtasks: prev.subtasks?.filter(s => s.id !== subtaskId)
        } : null);
      }
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!commitment) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/commitments/${commitment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        const data = await response.json();
        setCommitment(data.data || data);
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!commitment) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-xl">Commitment not found</p>
      </div>
    );
  }

  const completedSubtasks = commitment.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = commitment.subtasks?.length || 0;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

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

        {/* Main Content */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 space-y-6">
          {/* Title */}
          <div>
            {isEditing ? (
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white text-2xl font-bold"
              />
            ) : (
              <h1 className="text-3xl font-bold">🎯 {commitment.title}</h1>
            )}
          </div>

          {/* Commitment Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Date</p>
              <p className="text-white font-semibold">
                {commitment.date ? new Date(commitment.date).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Status</p>
              {isEditing ? (
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-1 text-white w-full"
                >
                  <option value="pending">⏸️ Pending</option>
                  <option value="in_progress">⏳ In Progress</option>
                  <option value="done">✅ Done</option>
                  <option value="blocked">🔒 Blocked</option>
                </select>
              ) : (
                <div className={`inline-block px-4 py-2 rounded-full font-semibold ${getStatusColor(commitment.status || 'pending')}`}>
                  {commitment.status === 'pending' && '⏸️ Pending'}
                  {commitment.status === 'in_progress' && '⏳ In Progress'}
                  {commitment.status === 'done' && '✅ Done'}
                  {commitment.status === 'blocked' && '🔒 Blocked'}
                </div>
              )}
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Priority</p>
              {isEditing ? (
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-1 text-white w-full"
                >
                  <option value="P1">P1 - Critical</option>
                  <option value="P2">P2 - High</option>
                  <option value="P3">P3 - Medium</option>
                  <option value="P4">P4 - Low</option>
                </select>
              ) : (
                <span className="inline-block px-3 py-1 rounded-full font-semibold border border-purple-700 text-purple-400">
                  {commitment.priority || 'P2'}
                </span>
              )}
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Target Effort</p>
              {isEditing ? (
                <input
                  type="number"
                  value={editForm.effort_minutes}
                  onChange={(e) => setEditForm({ ...editForm, effort_minutes: parseInt(e.target.value) })}
                  min="0"
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-1 text-white w-full"
                />
              ) : (
                <p className="text-white font-semibold">{commitment.effort_minutes} minutes</p>
              )}
            </div>
          </div>

          {/* Time Progress */}
          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-xl font-bold mb-4">⏱️ Time Progress</h2>
            <div className="bg-slate-700/50 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-purple-400">{formatTime(timeSpent)}</p>
                  <p className="text-sm text-gray-400">Time spent</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className={`px-4 py-2 rounded flex items-center gap-2 transition ${
                      timerRunning
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                  >
                    {timerRunning ? (
                      <>
                        <Pause size={18} />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play size={18} />
                        Start
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min((timeSpent / (commitment.effort_minutes * 60)) * 100, 100)}%`
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-400">
                {timeSpent} / {commitment.effort_minutes * 60} seconds ({Math.round((timeSpent / (commitment.effort_minutes * 60)) * 100)}%)
              </p>
            </div>
          </div>

          {/* Subtasks Progress */}
          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-xl font-bold mb-4">Subtasks Progress</h2>
            <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-semibold">{completedSubtasks}/{totalSubtasks} completed</p>
                <p className="text-purple-400 font-semibold">{progressPercent}%</p>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Subtasks List */}
            <div className="space-y-3 mb-4">
              {commitment.subtasks?.map(subtask => (
                <div key={subtask.id} className="flex items-center gap-3 bg-slate-700/50 p-3 rounded group">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => handleToggleSubtask(subtask.id)}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-400' : 'text-white'}`}>
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
                className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              />
              <button
                onClick={handleAddSubtask}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2 transition"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-xl font-bold mb-4">📝 Daily Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about your progress today..."
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white h-32 resize-none"
            />
            <button
              onClick={handleSaveNotes}
              className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2 transition"
            >
              <Save size={18} />
              Save Progress
            </button>
          </div>

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="flex gap-4 pt-4 border-t border-slate-700">
              <button
                onClick={handleUpdate}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold flex items-center gap-2 transition"
              >
                <Save size={18} />
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded font-semibold transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyCommitmentDetailPageV2;
