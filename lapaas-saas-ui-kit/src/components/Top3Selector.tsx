import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { Commitment, calculateScore, getScoreColor, getScoreBgColor } from '../types/commitments';
import { commitmentService } from '../services/commitmentService';

interface Top3SelectorProps {
  userId: string;
  orgId: string;
  date?: string;
  onCommitmentsChange?: (commitments: Commitment[]) => void;
}

const Top3Selector: React.FC<Top3SelectorProps> = ({
  userId,
  orgId,
  date,
  onCommitmentsChange
}) => {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    effortMinutes: 60,
    priority: 'P2' as const
  });

  const selectedDate = date || new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadCommitments();
  }, [userId, orgId]);

  const loadCommitments = async () => {
    setLoading(true);
    const top3 = await commitmentService.getTop3ByDate(userId, orgId, selectedDate);
    if (top3) {
      setCommitments(top3.commitments);
    }
    setLoading(false);
  };

  const handleAddCommitment = async () => {
    if (!formData.title.trim()) return;
    if (commitments.length >= 3) {
      alert('You can only have 3 commitments per day');
      return;
    }

    const newCommitment = await commitmentService.createCommitment(
      userId,
      orgId,
      {
        date: selectedDate,
        title: formData.title,
        effortMinutes: formData.effortMinutes,
        status: 'pending',
        priority: formData.priority
      }
    );

    if (newCommitment) {
      const updated = [...commitments, newCommitment];
      setCommitments(updated);
      onCommitmentsChange?.(updated);
      setFormData({ title: '', effortMinutes: 60, priority: 'P2' });
      setShowForm(false);
    }
  };

  const handleCompleteCommitment = async (commitmentId: string) => {
    const updated = await commitmentService.completeCommitment(commitmentId);
    if (updated) {
      setCommitments(commitments.map(c => c.id === commitmentId ? updated : c));
    }
  };

  const handleDeleteCommitment = async (commitmentId: string) => {
    if (window.confirm('Delete this commitment?')) {
      const success = await commitmentService.deleteCommitment(commitmentId);
      if (success) {
        const updated = commitments.filter(c => c.id !== commitmentId);
        setCommitments(updated);
        onCommitmentsChange?.(updated);
      }
    }
  };

  const totalEffort = commitments.reduce((sum, c) => sum + c.effortMinutes, 0);
  const completedCount = commitments.filter(c => c.status === 'completed').length;
  const score = calculateScore(completedCount, commitments.length);

  if (loading) {
    return <div className="p-4 text-center text-gray-400">Loading commitments...</div>;
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Today's Top-3 Commitments</h2>
          <p className="text-sm text-gray-400 mt-1">{selectedDate}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={commitments.length >= 3}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
            commitments.length >= 3
              ? 'bg-slate-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Plus size={20} /> Add
        </button>
      </div>

      {/* Score Card */}
      {commitments.length > 0 && (
        <div className={`p-4 rounded-lg mb-6 ${getScoreBgColor(score)} border border-slate-600`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Today's Score</p>
              <p className={`text-3xl font-bold mt-1 ${getScoreColor(score)}`}>{score}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Completed</p>
              <p className="text-2xl font-bold text-white mt-1">{completedCount}/{commitments.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Total Effort</p>
              <p className="text-2xl font-bold text-white mt-1">{totalEffort} min</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="mb-6 p-4 bg-slate-700 rounded-lg border border-slate-600">
          <input
            type="text"
            placeholder="Commitment title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-3"
          />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="number"
              placeholder="Effort (minutes)"
              value={formData.effortMinutes}
              onChange={(e) => setFormData({ ...formData, effortMinutes: parseInt(e.target.value) })}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              min="15"
              max="480"
              step="15"
            />
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="P1">P1 - Critical</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Medium</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddCommitment}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Check size={18} /> Add Commitment
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              <X size={18} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Commitments List */}
      <div className="space-y-3">
        {commitments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No commitments yet</p>
            <p className="text-sm text-gray-500 mt-2">Add your top 3 for today</p>
          </div>
        ) : (
          commitments.map((commitment, index) => (
            <div
              key={commitment.id}
              className={`p-4 rounded-lg border-2 transition ${
                commitment.status === 'completed'
                  ? 'bg-slate-700 border-green-600 opacity-60'
                  : 'bg-slate-700 border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={commitment.status === 'completed'}
                  onChange={() => handleCompleteCommitment(commitment.id)}
                  className="w-5 h-5 rounded cursor-pointer mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-white">#{index + 1}</span>
                    <p
                      className={`font-semibold ${
                        commitment.status === 'completed'
                          ? 'line-through text-gray-400'
                          : 'text-white'
                      }`}
                    >
                      {commitment.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400 mt-2">
                    <span>⏱️ {commitment.effortMinutes} min</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      commitment.priority === 'P1'
                        ? 'bg-red-900 text-red-200'
                        : commitment.priority === 'P2'
                        ? 'bg-orange-900 text-orange-200'
                        : 'bg-yellow-900 text-yellow-200'
                    }`}>
                      {commitment.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      commitment.status === 'completed'
                        ? 'bg-green-900 text-green-200'
                        : 'bg-blue-900 text-blue-200'
                    }`}>
                      {commitment.status === 'completed' ? '✅ Done' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCommitment(commitment.id)}
                  className="text-red-400 hover:text-red-300 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      {commitments.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-700 rounded-lg">
              <p className="text-xs text-gray-400">Commitments</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{commitments.length}/3</p>
            </div>
            <div className="p-3 bg-slate-700 rounded-lg">
              <p className="text-xs text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{completedCount}</p>
            </div>
            <div className="p-3 bg-slate-700 rounded-lg">
              <p className="text-xs text-gray-400">Total Time</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{totalEffort}m</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Top3Selector;
