import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Commitment, getScoreColor, getScoreBgColor } from '../types/commitments';
import { commitmentService } from '../services/commitmentService';

interface EndOfDayReviewProps {
  userId: string;
  orgId: string;
  date?: string;
  onClose?: () => void;
}

const EndOfDayReview: React.FC<EndOfDayReviewProps> = ({
  userId,
  orgId,
  date,
  onClose
}) => {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [missed, setMissed] = useState(0);

  const selectedDate = date || new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadReview();
  }, [userId, orgId, selectedDate]);

  const loadReview = async () => {
    setLoading(true);
    const top3 = await commitmentService.getTop3ByDate(userId, orgId, selectedDate);
    if (top3) {
      setCommitments(top3.commitments);
      setScore(top3.score);
      setCompleted(top3.completedCount);
      setMissed(top3.commitments.length - top3.completedCount);
    }
    setLoading(false);
  };

  const handleReschedule = async (commitment: Commitment) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const newDate = tomorrow.toISOString().split('T')[0];

    const updated = await commitmentService.rescheduleCommitment(
      commitment.id,
      newDate,
      'missed'
    );

    if (updated) {
      setCommitments(commitments.filter(c => c.id !== commitment.id));
      setMissed(missed - 1);
    }
  };

  const handleDelegate = async (commitment: Commitment) => {
    const assignTo = prompt('Assign to (team member name):');
    if (assignTo) {
      const updated = await commitmentService.delegateCommitment(
        commitment.id,
        assignTo,
        'Delegated from end-of-day review'
      );

      if (updated) {
        setCommitments(commitments.filter(c => c.id !== commitment.id));
        setMissed(missed - 1);
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading review...</div>;
  }

  const missedCommitments = commitments.filter(c => c.status === 'missed');
  const completedCommitments = commitments.filter(c => c.status === 'completed');

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg p-8 border border-slate-700">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CheckCircle className="text-blue-400" size={32} />
            End of Day Review
          </h1>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-gray-400">{selectedDate}</p>
      </div>

      {/* Score Card */}
      <div className={`p-6 rounded-lg mb-8 ${getScoreBgColor(score)} border-2 border-slate-600`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-300">Today's Score</p>
            <p className={`text-4xl font-bold mt-2 ${getScoreColor(score)}`}>{score}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Completed</p>
            <p className="text-4xl font-bold text-green-400 mt-2">{completed}</p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Missed</p>
            <p className="text-4xl font-bold text-red-400 mt-2">{missed}</p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Total</p>
            <p className="text-4xl font-bold text-white mt-2">{commitments.length}</p>
          </div>
        </div>
      </div>

      {/* Completed Commitments */}
      {completedCommitments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-400" size={24} />
            Completed ({completedCommitments.length})
          </h2>
          <div className="space-y-3">
            {completedCommitments.map((commitment) => (
              <div key={commitment.id} className="p-4 bg-green-900 border border-green-700 rounded-lg">
                <p className="text-white font-semibold line-through text-gray-300">
                  {commitment.title}
                </p>
                <p className="text-sm text-green-200 mt-1">✅ {commitment.effortMinutes} min</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missed Commitments */}
      {missedCommitments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-400" size={24} />
            Missed ({missedCommitments.length})
          </h2>
          <div className="space-y-3">
            {missedCommitments.map((commitment) => (
              <div key={commitment.id} className="p-4 bg-red-900 border border-red-700 rounded-lg">
                <p className="text-white font-semibold">{commitment.title}</p>
                <p className="text-sm text-red-200 mt-1">⏱️ {commitment.effortMinutes} min</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleReschedule(commitment)}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm transition"
                  >
                    📅 Reschedule
                  </button>
                  <button
                    onClick={() => handleDelegate(commitment)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition"
                  >
                    👤 Delegate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="text-blue-400" size={24} />
          Insights
        </h3>
        <div className="space-y-3">
          {score >= 80 && (
            <p className="text-green-300">🎉 Excellent day! You completed {completed}/{commitments.length} commitments.</p>
          )}
          {score >= 60 && score < 80 && (
            <p className="text-yellow-300">👍 Good progress! You completed {completed}/{commitments.length} commitments.</p>
          )}
          {score < 60 && (
            <p className="text-orange-300">⚠️ Challenging day. You completed {completed}/{commitments.length} commitments. Consider rescheduling or delegating missed items.</p>
          )}
          {missed > 0 && (
            <p className="text-gray-300">💡 Tip: You have {missed} missed commitment(s). Use reschedule or delegate to manage them.</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          ✓ Done
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          🖨️ Print
        </button>
      </div>
    </div>
  );
};

export default EndOfDayReview;
