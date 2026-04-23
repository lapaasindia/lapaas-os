import React, { useState } from 'react';
import { Target, Plus, Edit2, Trash2, Clock, Calendar } from 'lucide-react';

interface DailyCommitment {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  start_date?: string;
  end_date?: string;
  effort_minutes: number;
  recurring: boolean;
  status: string;
}

interface DailyCommitmentsManagerProps {
  commitments: DailyCommitment[];
  onAdd: (commitment: Omit<DailyCommitment, 'id'>) => void;
  onEdit: (commitment: DailyCommitment) => void;
  onDelete: (commitmentId: string) => void;
}

const DailyCommitmentsManager: React.FC<DailyCommitmentsManagerProps> = ({
  commitments,
  onAdd,
  onEdit,
  onDelete
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    start_time: '09:00',
    end_time: '10:00',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    recurring: true
  });

  const handleAdd = () => {
    if (formData.title.trim()) {
      const [startHour, startMin] = formData.start_time.split(':').map(Number);
      const [endHour, endMin] = formData.end_time.split(':').map(Number);
      const startTotalMins = startHour * 60 + startMin;
      const endTotalMins = endHour * 60 + endMin;
      const effort_minutes = Math.max(0, endTotalMins - startTotalMins);

      onAdd({
        title: formData.title,
        start_time: formData.start_time,
        end_time: formData.end_time,
        start_date: formData.start_date,
        end_date: formData.end_date,
        effort_minutes,
        recurring: formData.recurring,
        status: 'active'
      });

      setFormData({
        title: '',
        start_time: '09:00',
        end_time: '10:00',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        recurring: true
      });
      setShowForm(false);
    }
  };

  const handleEdit = (commitment: DailyCommitment) => {
    setEditingId(commitment.id);
    setFormData({
      title: commitment.title,
      start_time: commitment.start_time,
      end_time: commitment.end_time,
      start_date: (commitment as any).start_date || new Date().toISOString().split('T')[0],
      end_date: (commitment as any).end_date || '',
      recurring: commitment.recurring
    });
    setShowForm(true);
  };

  const handleSaveEdit = () => {
    if (editingId && formData.title.trim()) {
      const [startHour, startMin] = formData.start_time.split(':').map(Number);
      const [endHour, endMin] = formData.end_time.split(':').map(Number);
      const startTotalMins = startHour * 60 + startMin;
      const endTotalMins = endHour * 60 + endMin;
      const effort_minutes = Math.max(0, endTotalMins - startTotalMins);

      const commitment = commitments.find(c => c.id === editingId);
      if (commitment) {
        onEdit({
          ...commitment,
          title: formData.title,
          start_time: formData.start_time,
          end_time: formData.end_time,
          start_date: formData.start_date,
          end_date: formData.end_date,
          effort_minutes,
          recurring: formData.recurring
        } as any);
      }

      setFormData({
        title: '',
        start_time: '09:00',
        end_time: '10:00',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        recurring: true
      });
      setEditingId(null);
      setShowForm(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      start_time: '09:00',
      end_time: '10:00',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      recurring: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="text-green-400" size={24} />
          Commitments
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={18} />
            Add Commitment
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Self Learning, Customer Review"
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.start_date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (selectedDate < today) {
                        return;
                      }
                      setFormData({ ...formData, start_date: e.target.value });
                    }}
                    className="w-full px-3 py-2 pr-10 bg-slate-600 border border-slate-500 rounded text-white [color-scheme:dark]"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">End Date (Optional)</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.end_date}
                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const startDate = formData.start_date ? new Date(formData.start_date) : new Date();
                      if (selectedDate < startDate) {
                        return;
                      }
                      setFormData({ ...formData, end_date: e.target.value });
                    }}
                    className="w-full px-3 py-2 pr-10 bg-slate-600 border border-slate-500 rounded text-white [color-scheme:dark]"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.recurring}
                onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-white text-sm">Recurring Daily</span>
            </label>

            <div className="flex gap-2">
              <button
                onClick={editingId ? handleSaveEdit : handleAdd}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-semibold"
              >
                {editingId ? 'Save' : 'Add'}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commitments List */}
      <div className="space-y-3">
        {commitments.length === 0 ? (
          <p className="text-gray-400 text-sm">No daily commitments yet. Add one to get started!</p>
        ) : (
          commitments.map(commitment => (
            <div key={commitment.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
              <div className="flex-1">
                <p className="font-semibold text-white">{commitment.title}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {commitment.start_time} - {commitment.end_time}
                  </span>
                  <span>{commitment.effort_minutes} mins</span>
                  {commitment.recurring && (
                    <span className="px-2 py-1 bg-green-900 text-green-300 rounded">Daily</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(commitment)}
                  className="text-blue-400 hover:text-blue-300 transition"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => onDelete(commitment.id)}
                  className="text-red-400 hover:text-red-300 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DailyCommitmentsManager;
