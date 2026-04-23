import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Clock, Users, MapPin, Plus, Trash } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  duration?: number;
  attendees?: string[];
  owner?: string;
  location?: string;
  status?: string;
  hasAgenda?: boolean;
  agendaItems?: AgendaItem[];
  decisions?: Decision[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface AgendaItem {
  id: string;
  title: string;
  duration: number;
  owner?: string;
  status?: string;
}

interface Decision {
  id: string;
  title: string;
  rationale?: string;
  owner?: string;
  reviewDate?: string;
  status?: string;
}

const MeetingDetailPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
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
        setMeeting(data.data || data);
        setNotes(data.data?.notes || data?.notes || '');
      }
    } catch (error) {
      console.error('Error fetching meeting:', error);
    } finally {
      setLoading(false);
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
      await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/agenda/${agendaId}`, {
        method: 'DELETE'
      });

      setMeeting(prev => prev ? {
        ...prev,
        agendaItems: prev.agendaItems?.filter(a => a.id !== agendaId)
      } : null);
    } catch (error) {
      console.error('Error deleting agenda item:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!meeting) return;

    try {
      await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const handleDeleteMeeting = async () => {
    if (!meeting || !window.confirm('Are you sure you want to delete this meeting?')) return;

    try {
      await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}`, {
        method: 'DELETE'
      });
      navigate('/founder-os');
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white">Meeting not found</div>
      </div>
    );
  }

  const startTime = new Date(meeting.start_at);
  const endTime = new Date(meeting.end_at);

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
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition">
              <Edit2 size={18} />
              Edit
            </button>
            <button
              onClick={handleDeleteMeeting}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 transition"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        {/* Meeting Info Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-6">📅 {meeting.title}</h1>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-blue-400 mt-1" />
              <div>
                <p className="text-gray-400 text-sm">Date & Time</p>
                <p className="text-white font-semibold">
                  {startTime.toLocaleDateString()} {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-gray-400 text-sm mt-1">Duration: {meeting.duration || 60} minutes</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users size={20} className="text-green-400 mt-1" />
              <div>
                <p className="text-gray-400 text-sm">Attendees</p>
                <p className="text-white font-semibold">{meeting.attendees?.length || 0} people</p>
                {meeting.attendees && meeting.attendees.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {meeting.attendees.map((attendee, idx) => (
                      <p key={idx} className="text-gray-300 text-sm">• {attendee}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {meeting.location && (
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-purple-400 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white font-semibold">{meeting.location}</p>
                </div>
              </div>
            )}

            {meeting.owner && (
              <div>
                <p className="text-gray-400 text-sm">Owner</p>
                <p className="text-white font-semibold">{meeting.owner}</p>
              </div>
            )}
          </div>

          {meeting.description && (
            <div className="bg-slate-700 rounded p-4 mb-6">
              <p className="text-gray-400 text-sm mb-2">Description</p>
              <p className="text-white">{meeting.description}</p>
            </div>
          )}
        </div>

        {/* Agenda Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">📋 Agenda</h2>

          {/* Add Agenda Item */}
          <div className="mb-6 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newAgendaTitle}
                onChange={(e) => setNewAgendaTitle(e.target.value)}
                placeholder="Agenda item title..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <input
                type="number"
                value={newAgendaDuration}
                onChange={(e) => setNewAgendaDuration(e.target.value)}
                placeholder="Minutes"
                min="5"
                max="120"
                className="w-24 bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
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

          {/* Agenda Items List */}
          {meeting.agendaItems && meeting.agendaItems.length > 0 ? (
            <div className="space-y-2">
              {meeting.agendaItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-slate-700 rounded hover:bg-slate-600 transition"
                >
                  <div className="flex-1">
                    <p className="text-white font-semibold">{idx + 1}. {item.title}</p>
                    <p className="text-gray-400 text-sm">⏱️ {item.duration} minutes</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAgendaItem(item.id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No agenda items yet.</p>
          )}
        </div>

        {/* Notes Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">📝 Meeting Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add meeting notes here..."
            className="w-full h-48 bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
          />
          <button
            onClick={handleSaveNotes}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingDetailPage;
