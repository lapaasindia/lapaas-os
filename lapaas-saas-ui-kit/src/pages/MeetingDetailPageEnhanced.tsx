import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Plus, Save, X, Upload, Link2 } from 'lucide-react';

interface AgendaItem {
  id: string;
  title: string;
  duration: number;
  owner?: string;
  status?: 'pending' | 'completed';
}

interface MeetingLink {
  id: string;
  title: string;
  url: string;
  type: 'doc' | 'video' | 'resource';
}

interface MeetingTask {
  id: string;
  title: string;
  assigned_to?: string;
  due_at?: string;
  status?: 'pending' | 'completed';
}

interface Transcription {
  file_url?: string | null;
  file_name?: string | null;
  uploaded_at?: string | null;
  status?: 'pending' | 'completed';
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface Meeting {
  id: string;
  title: string;
  description?: string;
  start_at?: string;
  end_at?: string;
  location?: string;
  facilitator?: string;
  status?: string;
  attendees?: string[];
  agendaItems?: AgendaItem[];
  links?: MeetingLink[];
  transcription?: Transcription;
  tasks?: MeetingTask[];
  minutes?: {
    content: string;
    key_decisions: string[];
    action_items: string[];
  };
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const MeetingDetailPageEnhanced: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showFacilitatorDropdown, setShowFacilitatorDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [reminders, setReminders] = useState<any[]>([]);
  const [newReminderTime, setNewReminderTime] = useState('15');
  const [attendees, setAttendees] = useState<any[]>([]);
  const [newAttendeeEmail, setNewAttendeeEmail] = useState('');
  const [decisions, setDecisions] = useState<any[]>([]);
  const [newDecisionTitle, setNewDecisionTitle] = useState('');
  const [newDecisionRationale, setNewDecisionRationale] = useState('');

  // Form states
  const [editForm, setEditForm] = useState({
    title: '',
    location: '',
    facilitator: '',
    status: 'scheduled',
    start_at: '',
    end_at: ''
  });

  // Agenda
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaDuration, setNewAgendaDuration] = useState('15');

  // Links
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState<'doc' | 'video' | 'resource'>('doc');

  // Tasks
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

  // Minutes
  const [minutesContent, setMinutesContent] = useState('');
  const [keyDecisions, setKeyDecisions] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [transcriptionFile, setTranscriptionFile] = useState<File | null>(null);
  const [uploadingTranscription, setUploadingTranscription] = useState(false);

  useEffect(() => {
    fetchMeetingDetails();
    fetchTeamMembers();
    fetchTemplates();
  }, [meetingId]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/team-members');
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/meeting-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleApplyTemplate = async (templateId: string) => {
    if (!meeting) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/apply-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });

      if (response.ok) {
        const data = await response.json();
        setMeeting(data.data);
        setShowTemplates(false);
      }
    } catch (error) {
      console.error('Error applying template:', error);
    }
  };

  const handleAddReminder = async () => {
    if (!meeting) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reminder_time: newReminderTime,
          email_to: editForm.facilitator
        })
      });

      if (response.ok) {
        const data = await response.json();
        setReminders([...reminders, data.data]);
        setNewReminderTime('15');
      }
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  };

  const handleAddAttendee = async () => {
    if (!meeting || !newAttendeeEmail.trim()) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/attendees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendee_name: newAttendeeEmail.split('@')[0],
          attendee_email: newAttendeeEmail
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAttendees([...attendees, data.data]);
        setNewAttendeeEmail('');
      }
    } catch (error) {
      console.error('Error adding attendee:', error);
    }
  };

  const handleAddDecision = async () => {
    if (!meeting || !newDecisionTitle.trim()) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/decisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDecisionTitle,
          rationale: newDecisionRationale,
          owner: editForm.facilitator
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDecisions([...decisions, data.data]);
        setNewDecisionTitle('');
        setNewDecisionRationale('');
      }
    } catch (error) {
      console.error('Error adding decision:', error);
    }
  };

  const handleExportPDF = async () => {
    if (!meeting) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/export-pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meeting-${meeting.id}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}?org_id=org-001`);
      if (response.ok) {
        const data = await response.json();
        const meetingData = data.data || data;
        setMeeting(meetingData);
        
        // Parse start_at and end_at to extract date and time for datetime-local input
        const startDateTime = meetingData.start_at || '';
        const endDateTime = meetingData.end_at || '';
        const startDateTimeLocal = startDateTime ? startDateTime.substring(0, 16) : '';
        const endDateTimeLocal = endDateTime ? endDateTime.substring(0, 16) : '';
        
        setEditForm({
          title: meetingData.title || '',
          location: meetingData.location || '',
          facilitator: meetingData.facilitator || '',
          status: meetingData.status || 'scheduled',
          start_at: startDateTimeLocal,
          end_at: endDateTimeLocal
        });
        setMinutesContent(meetingData.minutes?.content || '');
        setKeyDecisions(meetingData.minutes?.key_decisions?.join('\n') || '');
        setActionItems(meetingData.minutes?.action_items?.join('\n') || '');
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
        body: JSON.stringify({
          ...editForm,
          minutes: {
            content: minutesContent,
            key_decisions: keyDecisions.split('\n').filter(d => d.trim()),
            action_items: actionItems.split('\n').filter(a => a.trim())
          }
        })
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

  const handleAddLink = async () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim() || !meeting) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newLinkTitle,
          url: newLinkUrl,
          type: newLinkType
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMeeting(prev => prev ? {
          ...prev,
          links: [...(prev.links || []), data.data]
        } : null);
        setNewLinkTitle('');
        setNewLinkUrl('');
        setNewLinkType('doc');
      }
    } catch (error) {
      console.error('Error adding link:', error);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!meeting) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/links/${linkId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMeeting(prev => prev ? {
          ...prev,
          links: prev.links?.filter(l => l.id !== linkId)
        } : null);
      }
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !meeting) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          assigned_to: newTaskAssignee || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMeeting(prev => prev ? {
          ...prev,
          tasks: [...(prev.tasks || []), data.data]
        } : null);
        setNewTaskTitle('');
        setNewTaskAssignee('');
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!meeting) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMeeting(prev => prev ? {
          ...prev,
          tasks: prev.tasks?.filter(t => t.id !== taskId)
        } : null);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (!meeting) return;
    const task = meeting.tasks?.find(t => t.id === taskId);
    if (!task) return;

    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setMeeting(prev => prev ? {
          ...prev,
          tasks: prev.tasks?.map(t => 
            t.id === taskId ? { ...t, status: newStatus } : t
          )
        } : null);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleTranscriptionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !meeting) return;

    setTranscriptionFile(file);
    setUploadingTranscription(true);

    try {
      // Create a mock file URL (in production, upload to cloud storage)
      const fileUrl = URL.createObjectURL(file);
      
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/transcription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_url: fileUrl,
          file_name: file.name
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMeeting(prev => prev ? {
          ...prev,
          transcription: data.data
        } : null);
        setTranscriptionFile(null);
      }
    } catch (error) {
      console.error('Error uploading transcription:', error);
    } finally {
      setUploadingTranscription(false);
    }
  };

  const handleDeleteTranscription = async () => {
    if (!meeting) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/transcription`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMeeting(prev => prev ? {
          ...prev,
          transcription: {
            file_url: null,
            file_name: null,
            uploaded_at: null,
            status: 'pending'
          }
        } : null);
      }
    } catch (error) {
      console.error('Error deleting transcription:', error);
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

  const startTime = meeting.start_at;
  const endTime = meeting.end_at;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
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

        {/* Toolbar - Enhancements */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {/* Templates */}
            <div className="relative">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2 transition"
              >
                📋 Templates
              </button>
              {showTemplates && templates.length > 0 && (
                <div className="absolute top-full left-0 mt-1 bg-slate-700 border border-slate-600 rounded z-10 min-w-48">
                  {templates.map(tmpl => (
                    <button
                      key={tmpl.id}
                      onClick={() => handleApplyTemplate(tmpl.id)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-600 text-white text-sm border-b border-slate-600 last:border-b-0"
                    >
                      <p className="font-semibold">{tmpl.name}</p>
                      <p className="text-xs text-gray-400">{tmpl.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reminders */}
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
                min="1"
                max="60"
                className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-2 text-white text-sm"
              />
              <button
                onClick={handleAddReminder}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2 transition"
              >
                🔔 Remind
              </button>
            </div>

            {/* Attendees */}
            <div className="flex gap-2 items-center">
              <input
                type="email"
                value={newAttendeeEmail}
                onChange={(e) => setNewAttendeeEmail(e.target.value)}
                placeholder="Add attendee..."
                className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
              />
              <button
                onClick={handleAddAttendee}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2 transition"
              >
                👥 Add
              </button>
            </div>

            {/* Export */}
            <button
              onClick={handleExportPDF}
              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2 transition"
            >
              📄 Export
            </button>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Meeting Info & Agenda */}
          <div className="col-span-2 space-y-6">
            {/* Title & Basic Info */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="mb-4">
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

                <div className="bg-slate-700/50 rounded-lg p-4 relative">
                  <p className="text-sm text-gray-400 mb-2">Facilitator</p>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={editForm.facilitator}
                        onChange={(e) => {
                          setEditForm({ ...editForm, facilitator: e.target.value });
                          setShowFacilitatorDropdown(true);
                        }}
                        onFocus={() => setShowFacilitatorDropdown(true)}
                        placeholder="Search facilitator..."
                        className="bg-slate-600 border border-slate-500 rounded px-3 py-1 text-white w-full"
                      />
                      {showFacilitatorDropdown && teamMembers.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded z-10 max-h-40 overflow-y-auto">
                          {teamMembers
                            .filter(m => m.name.toLowerCase().includes(editForm.facilitator.toLowerCase()))
                            .map(member => (
                              <button
                                key={member.id}
                                onClick={() => {
                                  setEditForm({ ...editForm, facilitator: member.name });
                                  setShowFacilitatorDropdown(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-600 text-white text-sm flex items-center gap-2"
                              >
                                <span>{member.avatar}</span>
                                <span>{member.name}</span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-white font-semibold">{meeting.facilitator || 'Not assigned'}</p>
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
              </div>
            </div>

            {/* Agenda */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
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

            {/* Links */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">🔗 Links ({meeting.links?.length || 0})</h2>
              <div className="space-y-3 mb-4">
                {meeting.links?.map((link) => (
                  <div key={link.id} className="flex items-center gap-3 bg-slate-700/50 p-3 rounded group">
                    <Link2 size={16} className="text-blue-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white truncate">{link.title}</p>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 truncate block">
                        {link.url}
                      </a>
                    </div>
                    <span className="text-xs bg-slate-600 px-2 py-1 rounded">{link.type}</span>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  placeholder="Link title..."
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                />
                <input
                  type="url"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                />
                <div className="flex gap-2">
                  <select
                    value={newLinkType}
                    onChange={(e) => setNewLinkType(e.target.value as 'doc' | 'video' | 'resource')}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  >
                    <option value="doc">📄 Document</option>
                    <option value="video">🎥 Video</option>
                    <option value="resource">📚 Resource</option>
                  </select>
                  <button
                    onClick={handleAddLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition"
                  >
                    <Plus size={18} />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Transcription */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">🎙️ Transcription</h2>
              {meeting.transcription?.file_url ? (
                <div className="bg-slate-700/50 p-4 rounded mb-4">
                  <p className="text-white font-semibold mb-2">{meeting.transcription.file_name || 'Transcription'}</p>
                  <p className="text-sm text-gray-400 mb-3">
                    Uploaded: {meeting.transcription.uploaded_at ? new Date(meeting.transcription.uploaded_at).toLocaleDateString() : 'N/A'}
                  </p>
                  <div className="flex gap-2">
                    <a href={meeting.transcription.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                      Download Transcription
                    </a>
                    <button
                      onClick={handleDeleteTranscription}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      (Remove)
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 mb-4">No transcription uploaded</p>
              )}
              <div className="flex gap-2">
                <input
                  type="file"
                  id="transcription-upload"
                  onChange={handleTranscriptionUpload}
                  disabled={uploadingTranscription}
                  className="hidden"
                  accept=".mp3,.wav,.m4a,.txt,.pdf"
                />
                <label htmlFor="transcription-upload" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition cursor-pointer">
                  <Upload size={18} />
                  {uploadingTranscription ? 'Uploading...' : 'Upload Transcription'}
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Tasks & Minutes */}
          <div className="space-y-6">
            {/* Tasks */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">✓ Action Items ({meeting.tasks?.length || 0})</h2>
              <div className="space-y-2 mb-4">
                {meeting.tasks?.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 bg-slate-700/50 p-3 rounded group">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => handleToggleTask(task.id)}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-white'}`}>
                        {task.title}
                      </p>
                      {task.assigned_to && (
                        <p className="text-xs text-gray-400">👤 {task.assigned_to}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Action item..."
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                />
                <div className="relative">
                  <input
                    type="text"
                    value={newTaskAssignee}
                    onChange={(e) => {
                      setNewTaskAssignee(e.target.value);
                      setShowAssigneeDropdown(true);
                    }}
                    onFocus={() => setShowAssigneeDropdown(true)}
                    placeholder="Search assignee..."
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                  />
                  {showAssigneeDropdown && teamMembers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded z-10 max-h-40 overflow-y-auto">
                      {teamMembers
                        .filter(m => m.name.toLowerCase().includes(newTaskAssignee.toLowerCase()))
                        .map(member => (
                          <button
                            key={member.id}
                            onClick={() => {
                              setNewTaskAssignee(member.name);
                              setShowAssigneeDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-600 text-white text-sm flex items-center gap-2"
                          >
                            <span>{member.avatar}</span>
                            <span>{member.name}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAddTask}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center justify-center gap-2 transition text-sm"
                >
                  <Plus size={16} />
                  Add Task
                </button>
              </div>
            </div>

            {/* Minutes */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">📝 Meeting Minutes</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Notes</label>
                  <textarea
                    value={minutesContent}
                    onChange={(e) => setMinutesContent(e.target.value)}
                    placeholder="Meeting notes..."
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Key Decisions</label>
                  <textarea
                    value={keyDecisions}
                    onChange={(e) => setKeyDecisions(e.target.value)}
                    placeholder="One decision per line..."
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Action Items</label>
                  <textarea
                    value={actionItems}
                    onChange={(e) => setActionItems(e.target.value)}
                    placeholder="One action item per line..."
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm h-20 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decisions Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">⚖️ Decisions ({decisions.length})</h2>
          <div className="space-y-3 mb-4">
            {decisions.map((decision) => (
              <div key={decision.id} className="bg-slate-700/50 p-4 rounded group">
                <p className="text-white font-semibold">{decision.title}</p>
                <p className="text-sm text-gray-400 mt-1">Rationale: {decision.rationale}</p>
                <p className="text-sm text-gray-400">Owner: {decision.owner}</p>
                <button
                  onClick={() => setDecisions(decisions.filter(d => d.id !== decision.id))}
                  className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition text-sm mt-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={newDecisionTitle}
              onChange={(e) => setNewDecisionTitle(e.target.value)}
              placeholder="Decision title..."
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
            />
            <textarea
              value={newDecisionRationale}
              onChange={(e) => setNewDecisionRationale(e.target.value)}
              placeholder="Rationale..."
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm h-16 resize-none"
            />
            <button
              onClick={handleAddDecision}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded flex items-center justify-center gap-2 transition text-sm"
            >
              + Add Decision
            </button>
          </div>
        </div>

        {/* Save/Cancel Buttons */}
        {isEditing && (
          <div className="flex gap-4 mt-8 pt-4 border-t border-slate-700">
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
  );
};

export default MeetingDetailPageEnhanced;
