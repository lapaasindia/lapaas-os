import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Plus, Save, X } from 'lucide-react';

interface AgendaItem {
  id: string;
  title: string;
  duration: number;
  owner?: string;
  status?: string;
}

interface Meeting {
  id: string;
  title: string;
  description?: string;
  start_at?: string;
  startAt?: string;
  end_at?: string;
  endAt?: string;
  duration?: number;
  attendees?: string[];
  owner?: string;
  location?: string;
  status?: string;
  agendaItems?: AgendaItem[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const MeetingDetailPageV2: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const [editForm, setEditForm] = useState({
    title: '',
    location: '',
    status: 'scheduled',
    start_at: '',
    end_at: ''
  });
  const [notes, setNotes] = useState('');
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaDuration, setNewAgendaDuration] = useState('15');

  useEffect(() => {
    fetchMeetingDetails();
  }, [meetingId]);

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}?org_id=org-001`);
      if (response.ok) {
        const data = await response.json();
        const meetingData = data.data || data;
        setMeeting(meetingData);
        setNotes(meetingData.notes || '');
        // Parse start_at and end_at to extract date and time
        const startDateTime = meetingData.start_at || meetingData.startAt || '';
        const endDateTime = meetingData.end_at || meetingData.endAt || '';
        
        // Extract date and time from ISO string (e.g., "2025-11-15T10:00:00")
        const startDateTimeLocal = startDateTime ? startDateTime.substring(0, 16) : '';
        const endDateTimeLocal = endDateTime ? endDateTime.substring(0, 16) : '';
        
        setEditForm({
          title: meetingData.title,
          location: meetingData.location || '',
          status: meetingData.status || 'scheduled',
          start_at: startDateTimeLocal,
          end_at: endDateTimeLocal
        });
      }
    } catch (error) {
      console.error('Error fetching meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!meeting) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const data = await response.json();
        setMeeting(data.data || data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating meeting:', error);
    }
  };

  const handleDelete = async () => {
    if (!meeting || !window.confirm('Are you sure you want to delete this meeting?')) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        navigate('/founder-os');
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  };

  const handleAddAgendaItem = async () => {
    if (!newAgendaTitle.trim() || !meeting) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/agenda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newAgendaTitle,
          duration: parseInt(newAgendaDuration)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMeeting(prev => prev ? {
          ...prev,
          agendaItems: [...(prev.agendaItems || []), data.data]
        } : null);
        setNewAgendaTitle('');
        setNewAgendaDuration('15');
      }
    } catch (error) {
      console.error('Error adding agenda item:', error);
    }
  };

  const handleDeleteAgendaItem = async (agendaId: string) => {
    if (!meeting) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/agenda/${agendaId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMeeting(prev => prev ? {
          ...prev,
          agendaItems: prev.agendaItems?.filter(a => a.id !== agendaId)
        } : null);
      }
    } catch (error) {
      console.error('Error deleting agenda item:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!meeting) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        const data = await response.json();
        setMeeting(data.data || data);
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-xl">Meeting not found</p>
      </div>
    );
  }

  const startTime = meeting.startAt || meeting.start_at;
  const endTime = meeting.endAt || meeting.end_at;

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
            {isEditing && (
              <>
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition flex items-center gap-2"
                >
                  <Save size={18} />
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-blue-400 hover:text-blue-300 transition px-4 py-2 rounded hover:bg-slate-700 flex items-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
              </>
            )}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-400 hover:text-blue-300 transition px-4 py-2 rounded hover:bg-slate-700 flex items-center gap-2"
              >
                <Edit2 size={18} />
                Edit
              </button>
            )}
            <button
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300 transition px-4 py-2 rounded hover:bg-slate-700 flex items-center gap-2"
            >
              <Trash2 size={18} />
              Delete
            </button>
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
              <h1 className="text-3xl font-bold">📅 {meeting.title}</h1>
            )}
          </div>

          {/* Meeting Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Start Date & Time</p>
              {isEditing ? (
                <input
                  type="datetime-local"
                  value={editForm.start_at}
                  onChange={(e) => setEditForm({ ...editForm, start_at: e.target.value })}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white w-full"
                />
              ) : (
                <>
                  <p className="text-white font-semibold">
                    {startTime ? new Date(startTime).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {startTime ? new Date(startTime).toLocaleTimeString() : ''}
                  </p>
                </>
              )}
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">End Date & Time</p>
              {isEditing ? (
                <input
                  type="datetime-local"
                  value={editForm.end_at}
                  onChange={(e) => setEditForm({ ...editForm, end_at: e.target.value })}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white w-full"
                />
              ) : (
                <>
                  <p className="text-white font-semibold">
                    {endTime ? new Date(endTime).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {endTime ? new Date(endTime).toLocaleTimeString() : ''}
                  </p>
                </>
              )}
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Location</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Meeting location"
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-1 text-white w-full"
                />
              ) : (
                <p className="text-white font-semibold">{meeting.location || 'No location'}</p>
              )}
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Status</p>
              {isEditing ? (
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-1 text-white w-full"
                >
                  <option value="scheduled">📅 Scheduled</option>
                  <option value="in_progress">⏳ In Progress</option>
                  <option value="completed">✅ Completed</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              ) : (
                <p className="text-white font-semibold">
                  {meeting.status === 'scheduled' && '📅 Scheduled'}
                  {meeting.status === 'in_progress' && '⏳ In Progress'}
                  {meeting.status === 'completed' && '✅ Completed'}
                  {meeting.status === 'cancelled' && '❌ Cancelled'}
                </p>
              )}
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Attendees</p>
              <p className="text-white font-semibold">{meeting.attendees?.length || 0} people</p>
              <div className="text-sm text-gray-400 mt-2">
                {meeting.attendees?.map(a => <div key={a}>• {a}</div>)}
              </div>
            </div>
          </div>

          {/* Agenda Items */}
          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-xl font-bold mb-4">📋 Agenda ({meeting.agendaItems?.length || 0})</h2>
            <div className="space-y-3 mb-4">
              {meeting.agendaItems?.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 bg-slate-700/50 p-3 rounded group">
                  <span className="text-sm font-semibold text-gray-400">{idx + 1}.</span>
                  <div className="flex-1">
                    <p className="text-white">{item.title}</p>
                    <p className="text-sm text-gray-400">⏱️ {item.duration} minutes</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAgendaItem(item.id)}
                    className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newAgendaTitle}
                onChange={(e) => setNewAgendaTitle(e.target.value)}
                placeholder="Agenda item title..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              />
              <input
                type="number"
                value={newAgendaDuration}
                onChange={(e) => setNewAgendaDuration(e.target.value)}
                min="5"
                max="120"
                className="w-20 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              />
              <button
                onClick={handleAddAgendaItem}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-xl font-bold mb-4">📝 Meeting Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add meeting notes here..."
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white h-32 resize-none"
            />
            <button
              onClick={handleSaveNotes}
              className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 transition"
            >
              <Save size={18} />
              Save Notes
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

export default MeetingDetailPageV2;
