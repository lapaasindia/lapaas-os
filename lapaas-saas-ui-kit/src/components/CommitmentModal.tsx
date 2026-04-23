import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CommitmentModalProps {
  show: boolean;
  editingId: string | null;
  commitmentForm: { title: string; effort_minutes: number };
  onFormChange: (form: { title: string; effort_minutes: number }) => void;
  onCreate: () => void;
  onClose: () => void;
}

const CommitmentModal: React.FC<CommitmentModalProps> = ({
  show,
  editingId,
  commitmentForm,
  onFormChange,
  onCreate,
  onClose
}) => {
  const [isRecurringDaily, setIsRecurringDaily] = useState(false);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{editingId ? 'Edit' : 'Create'} Commitment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={commitmentForm.title}
              onChange={(e) => onFormChange({ ...commitmentForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="e.g., Exercise, Meditation, Reading, Team Standup"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Effort (minutes)</label>
            <input
              type="number"
              value={commitmentForm.effort_minutes}
              onChange={(e) => onFormChange({ ...commitmentForm, effort_minutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="30"
              min="5"
              max="480"
            />
          </div>

          {/* Daily Recurring Toggle */}
          <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
            <input
              type="checkbox"
              id="recurringDaily"
              checked={isRecurringDaily}
              onChange={(e) => setIsRecurringDaily(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="recurringDaily" className="text-sm font-medium text-gray-300 cursor-pointer">
              Recurring Daily
            </label>
          </div>

          {isRecurringDaily && (
            <div className="p-3 bg-purple-900 border border-purple-700 rounded-lg">
              <p className="text-sm text-purple-200">
                🔄 This commitment will repeat every day automatically
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onCreate}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitmentModal;
