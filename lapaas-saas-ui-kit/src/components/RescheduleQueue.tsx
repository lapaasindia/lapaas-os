import React, { useState, useEffect } from 'react';
import { AlertCircle, Trash2, Check, CheckCircle } from 'lucide-react';
import { RescheduleQueue as RescheduleQueueType } from '../types/commitments';
import { commitmentService } from '../services/commitmentService';

interface RescheduleQueueProps {
  userId: string;
  orgId: string;
  onClose?: () => void;
}

const RescheduleQueue: React.FC<RescheduleQueueProps> = ({
  userId,
  orgId,
  onClose
}) => {
  const [queue, setQueue] = useState<RescheduleQueueType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, [userId, orgId]);

  const loadQueue = async () => {
    setLoading(true);
    const queueData = await commitmentService.getRescheduleQueue(userId, orgId);
    setQueue(queueData);
    setLoading(false);
  };

  const handleReschedule = async (item: RescheduleQueueType, newDate: string) => {
    const updated = await commitmentService.rescheduleCommitment(
      item.commitment.id,
      newDate,
      item.reason
    );

    if (updated) {
      setQueue(queue.filter(q => q.id !== item.id));
    }
  };

  const handleDelete = async (item: RescheduleQueueType) => {
    if (window.confirm('Remove from queue?')) {
      const success = await commitmentService.deleteCommitment(item.commitment.id);
      if (success) {
        setQueue(queue.filter(q => q.id !== item.id));
      }
    }
  };

  const getReason = (reason: string) => {
    switch (reason) {
      case 'missed':
        return '❌ Missed';
      case 'delegate':
        return '👤 Delegated';
      case 'reschedule':
        return '🔄 Rescheduled';
      default:
        return reason;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading queue...</div>;
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <AlertCircle className="text-orange-400" size={28} />
          Reschedule Queue
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Queue Items */}
      {queue.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
          <p className="text-gray-400 text-lg">Queue is empty!</p>
          <p className="text-gray-500 text-sm mt-2">All commitments are on track</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-700 border border-orange-600 rounded-lg hover:border-orange-500 transition"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-orange-400">
                      {getReason(item.reason)}
                    </span>
                    <p className="font-semibold text-white">{item.commitment.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-400 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Original Date</p>
                      <p className="text-white">{item.originalDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Effort</p>
                      <p className="text-white">⏱️ {item.commitment.effortMinutes} min</p>
                    </div>
                  </div>

                  {/* Suggested Date */}
                  {item.suggestedDate && (
                    <div className="mb-3 p-3 bg-slate-600 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Suggested Date</p>
                      <p className="text-white font-medium">{item.suggestedDate}</p>
                    </div>
                  )}

                  {/* Date Picker */}
                  <div className="flex gap-2">
                    <input
                      type="date"
                      defaultValue={item.suggestedDate || ''}
                      onBlur={(e) => {
                        if (e.target.value) {
                          handleReschedule(item, e.target.value);
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector(
                          `input[data-id="${item.id}"]`
                        ) as HTMLInputElement;
                        if (input?.value) {
                          handleReschedule(item, input.value);
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                    >
                      <Check size={16} /> Reschedule
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item)}
                  className="text-red-400 hover:text-red-300 transition mt-1"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {queue.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-slate-700 rounded-lg">
              <p className="text-xs text-gray-400">In Queue</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">{queue.length}</p>
            </div>
            <div className="p-3 bg-slate-700 rounded-lg">
              <p className="text-xs text-gray-400">Total Effort</p>
              <p className="text-2xl font-bold text-white mt-1">
                {queue.reduce((sum, item) => sum + item.commitment.effortMinutes, 0)}m
              </p>
            </div>
            <div className="p-3 bg-slate-700 rounded-lg">
              <p className="text-xs text-gray-400">Action</p>
              <p className="text-lg font-bold text-blue-400 mt-1">Reschedule</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescheduleQueue;
