import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Clock } from 'lucide-react';

interface OfficeHour {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface OfficeHoursManagerProps {
  userId: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const OfficeHoursManager: React.FC<OfficeHoursManagerProps> = ({ userId }) => {
  const [officeHours, setOfficeHours] = useState<OfficeHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00'
  });

  useEffect(() => {
    fetchOfficeHours();
  }, [userId]);

  const fetchOfficeHours = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/office-hours/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setOfficeHours(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching office hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/v1/office-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: userId })
      });
      
      if (response.ok) {
        await fetchOfficeHours();
        setShowForm(false);
        setFormData({ day_of_week: 1, start_time: '09:00', end_time: '17:00' });
      }
    } catch (error) {
      console.error('Error creating office hours:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this office hour slot?')) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/office-hours/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchOfficeHours();
      }
    } catch (error) {
      console.error('Error deleting office hours:', error);
    }
  };

  if (loading) return <div className="text-gray-400">Loading...</div>;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="text-blue-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Office Hours</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded flex items-center gap-2 text-sm transition"
        >
          <Plus size={16} />
          Add Slot
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Day</label>
              <select
                value={formData.day_of_week}
                onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
              >
                {DAYS.map((day, idx) => (
                  <option key={idx} value={idx}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Start</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">End</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition"
          >
            <Save size={18} />
            Save Office Hours
          </button>
        </form>
      )}

      <div className="space-y-2">
        {officeHours.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Clock size={48} className="mx-auto mb-2 opacity-50" />
            <p>No office hours configured</p>
            <p className="text-sm">Add slots when you're available for requests</p>
          </div>
        ) : (
          officeHours.map((hour) => (
            <div key={hour.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded border border-slate-600">
              <div className="flex items-center gap-3">
                <span className="text-white font-medium">{DAYS[hour.day_of_week]}</span>
                <span className="text-gray-400">
                  {hour.start_time} - {hour.end_time}
                </span>
              </div>
              <button
                onClick={() => handleDelete(hour.id)}
                className="text-red-400 hover:text-red-300 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OfficeHoursManager;
