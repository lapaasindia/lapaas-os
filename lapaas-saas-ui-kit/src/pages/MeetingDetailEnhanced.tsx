import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Trash2, Save, X, Play, Square, Plus, Trash, 
  Link as LinkIcon, FileText, CheckSquare, ListTodo, Clock, Users, Calendar, UserPlus, Shield
} from 'lucide-react';
import MeetingTimer from '../components/MeetingTimer';
import DecisionLogger from '../components/DecisionLogger';
import RoleAssignment from '../components/RoleAssignment';

interface Meeting {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  location?: string;
  status: string;
  notes?: string;
  transcription_link?: string;
  recording_link?: string;
  attendees?: string[];
  members?: string[];
  created_by?: string;
  facilitator?: string;
  facilitator_id?: string;
}

interface Decision {
  id: string;
  title: string;
  rationale: string;
  owner_id: string;
  review_at: string;
  created_at: string;
}

interface ActionItem {
  id: string;
  title: string;
  owner_id: string;
  owner_name?: string;
  due_at: string;
  status: string;
}

interface AgendaItem {
  id: string;
  segment: string;
  minutes: number;
  owner: string;
}

interface TeamMember {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

const MeetingDetailEnhanced: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const isNewMeeting = meetingId === 'new';
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(isNewMeeting);
  const [editForm, setEditForm] = useState({
    title: '',
    start_at: '',
    end_at: '',
    location: '',
    status: 'scheduled',
    notes: ''
  });
  const [newAction, setNewAction] = useState({ title: '', owner_id: '', due_at: '' });
  const [showActionForm, setShowActionForm] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [showAgendaForm, setShowAgendaForm] = useState(false);
  const [newAgenda, setNewAgenda] = useState({ segment: '', minutes: 15, owner: '' });
  const [transcriptionLink, setTranscriptionLink] = useState('');
  const [recordingLink, setRecordingLink] = useState('');
  const timerRef = useRef<{ startTimer: () => void; stopTimer: () => void } | null>(null);
  
  // Member management state
  const [members, setMembers] = useState<string[]>([]);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  
  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Error getting current user:', e);
    }
    return null;
  };
  
  const currentUser = getCurrentUser();
  const currentUserEmail = currentUser?.email || '';
  
  // Check if current user can edit the meeting
  const canEdit = () => {
    if (!meeting) return true; // New meeting
    if (!meeting.created_by) return true; // Legacy meeting without creator
    if (meeting.created_by === currentUserEmail) return true; // Creator
    if (meeting.members && meeting.members[0] === currentUserEmail) return true; // Facilitator (first member)
    if (meeting.facilitator_id === currentUserEmail) return true;
    return false;
  };

  useEffect(() => {
    fetchTeamMembers();
    if (meetingId && meetingId !== 'new') {
      fetchMeetingDetails();
      fetchDecisions();
      fetchActionItems();
      fetchAgendaItems();
    } else if (isNewMeeting) {
      setLoading(false);
    }
  }, [meetingId]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/team-members?org_id=org-001');
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const getMemberDisplayName = (member: TeamMember) => {
    if (member.name) return member.name;
    if (member.firstName && member.lastName) return `${member.firstName} ${member.lastName}`;
    if (member.firstName) return member.firstName;
    return member.email.split('@')[0];
  };

  // Load links when meeting is loaded
  useEffect(() => {
    if (meeting) {
      setTranscriptionLink(meeting.transcription_link || '');
      setRecordingLink(meeting.recording_link || '');
    }
  }, [meeting]);

  // Auto-save links when they change (debounced)
  useEffect(() => {
    if (meetingId && meetingId !== 'new' && (transcriptionLink || recordingLink)) {
      const timer = setTimeout(() => {
        handleSaveLinks();
      }, 1000); // 1 second debounce
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [transcriptionLink, recordingLink]);

  const fetchMeetingDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}?org_id=org-001`);
      if (response.ok) {
        const data = await response.json();
        const meetingData = data.data || data;
        setMeeting(meetingData);
        setMembers(meetingData.members || []);
        setEditForm({
          title: meetingData.title || '',
          start_at: meetingData.start_at || '',
          end_at: meetingData.end_at || '',
          location: meetingData.location || '',
          status: meetingData.status || 'scheduled',
          notes: meetingData.notes || ''
        });
      }
    } catch (error) {
      console.error('Error fetching meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDecisions = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}/decisions`);
      if (response.ok) {
        const data = await response.json();
        setDecisions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching decisions:', error);
    }
  };

  const fetchActionItems = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}/actions`);
      if (response.ok) {
        const data = await response.json();
        setActionItems(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching action items:', error);
    }
  };

  const fetchAgendaItems = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}/agenda`);
      if (response.ok) {
        const data = await response.json();
        setAgendaItems(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching agenda items:', error);
    }
  };

  const handleAddAgenda = async () => {
    if (!newAgenda.segment.trim()) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}/agenda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgenda)
      });
      if (response.ok) {
        const data = await response.json();
        setAgendaItems([...agendaItems, data.data]);
        setNewAgenda({ segment: '', minutes: 15, owner: '' });
        setShowAgendaForm(false);
      }
    } catch (error) {
      console.error('Error adding agenda item:', error);
    }
  };

  const handleDeleteAgenda = async (agendaId: string) => {
    try {
      await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}/agenda/${agendaId}`, {
        method: 'DELETE'
      });
      setAgendaItems(agendaItems.filter(a => a.id !== agendaId));
    } catch (error) {
      console.error('Error deleting agenda item:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (isNewMeeting) {
        // Create new meeting
        const response = await fetch('http://localhost:3000/api/v1/meetings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            org_id: 'org-001',
            ...editForm
          })
        });
        if (response.ok) {
          const data = await response.json();
          const newMeetingId = data.data?.id || data.id;
          navigate(`/meeting/${newMeetingId}`);
        }
      } else if (meeting) {
        // Update existing meeting
        const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm)
        });
        if (response.ok) {
          await response.json(); // Response data not needed
          setMeeting({ ...meeting, ...editForm });
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error('Error saving meeting:', error);
    }
  };

  const handleDelete = async () => {
    if (!meeting || !window.confirm('Are you sure you want to delete this meeting?')) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        navigate('/founder-os?tab=meetings');
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  };

  const handleDecisionAdded = (decision: Decision) => {
    setDecisions([...decisions, decision]);
  };

  const handleStartMeeting = async () => {
    if (!meeting) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' })
      });
      if (response.ok) {
        await response.json(); // Response data not needed
        setMeeting({ ...meeting, status: 'in_progress' });
        // Automatically start the timer
        if (timerRef.current) {
          timerRef.current.startTimer();
        }
      }
    } catch (error) {
      console.error('Error starting meeting:', error);
    }
  };

  const handleEndMeeting = async () => {
    if (!meeting || !window.confirm('End this meeting?')) return;
    try {
      // Stop the timer first
      if (timerRef.current) {
        timerRef.current.stopTimer();
      }
      
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      if (response.ok) {
        await response.json(); // Response data not needed
        setMeeting({ ...meeting, status: 'completed' });
      }
    } catch (error) {
      console.error('Error ending meeting:', error);
    }
  };


  const handleAddAction = async () => {
    if (!newAction.title.trim() || !meetingId || !newAction.owner_id) return;
    
    // Find owner name for display
    const owner = teamMembers.find(m => m.id === newAction.owner_id || m.email === newAction.owner_id);
    const ownerName = owner ? getMemberDisplayName(owner) : newAction.owner_id;
    
    try {
      // First create the action item for the meeting
      const actionResponse = await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAction,
          owner_name: ownerName,
          status: 'pending'
        })
      });
      
      if (actionResponse.ok) {
        const actionData = await actionResponse.json();
        
        // Also create a task in Personal Productivity for the assigned owner
        try {
          await fetch('http://localhost:3000/api/v1/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              org_id: 'org-001',
              user_id: newAction.owner_id,
              title: newAction.title,
              description: `Action item from meeting: ${meeting?.title || 'Meeting'}`,
              due_at: newAction.due_at,
              status: 'pending',
              priority: 'medium',
              source: 'meeting',
              source_id: meetingId,
              action_id: actionData.data?.id
            })
          });
        } catch (taskError) {
          console.error('Error creating task from action:', taskError);
        }
        
        setActionItems([...actionItems, { ...actionData.data, owner_name: ownerName }]);
        setNewAction({ title: '', owner_id: '', due_at: '' });
        setShowActionForm(false);
      }
    } catch (error) {
      console.error('Error adding action:', error);
    }
  };

  const handleDeleteAction = async (actionId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}/actions/${actionId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setActionItems(actionItems.filter(a => a.id !== actionId));
      }
    } catch (error) {
      console.error('Error deleting action:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!meeting || !meetingId || meetingId === 'new') return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editForm.notes })
      });
      
      if (response.ok) {
        setMeeting({ ...meeting, notes: editForm.notes });
        setShowNotesForm(false);
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const handleSaveLinks = async () => {
    if (!meeting || !meetingId || meetingId === 'new') return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcription_link: transcriptionLink,
          recording_link: recordingLink
        })
      });
      
      if (response.ok) {
        console.log('Links saved successfully');
      }
    } catch (error) {
      console.error('Error saving links:', error);
    }
  };

  const calculateDuration = () => {
    if (!meeting) return 60;
    const start = new Date(meeting.start_at);
    const end = new Date(meeting.end_at);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  };

  if (loading && !isNewMeeting) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 flex items-center justify-center">
      <div className="text-white text-xl">Loading meeting details...</div>
    </div>;
  }

  if (!meeting && !isNewMeeting) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 flex items-center justify-center">
      <div className="text-white text-xl">Meeting not found</div>
    </div>;
  }


  // New Meeting Page - Enhanced UI
  if (isNewMeeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-700/50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/founder-os?tab=meetings')} className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Create New Meeting</h1>
                <p className="text-sm text-gray-400">Schedule a meeting with your team</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/founder-os?tab=meetings')} className="px-4 py-2 text-gray-400 hover:text-white transition">
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={!editForm.title || !editForm.start_at}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 transition"
              >
                <Save size={16} /> Create Meeting
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              {/* Meeting Title */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="text-blue-400" size={20} />
                  Meeting Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Meeting Title *</label>
                    <input 
                      type="text" 
                      value={editForm.title} 
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})} 
                      placeholder="e.g., Weekly Team Sync, Product Review..."
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea 
                      value={editForm.notes || ''} 
                      onChange={(e) => setEditForm({...editForm, notes: e.target.value})} 
                      placeholder="What's this meeting about? Add agenda items, goals, or context..."
                      rows={4}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <LinkIcon className="text-purple-400" size={20} />
                  Location
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Meeting Location or Link</label>
                    <input 
                      type="text" 
                      value={editForm.location} 
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})} 
                      placeholder="e.g., Conference Room A, https://zoom.us/j/..."
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  
                  {/* Quick location buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button 
                      type="button"
                      onClick={() => setEditForm({...editForm, location: 'Google Meet'})}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm rounded-lg transition"
                    >
                      Google Meet
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEditForm({...editForm, location: 'Zoom'})}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm rounded-lg transition"
                    >
                      Zoom
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEditForm({...editForm, location: 'Microsoft Teams'})}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm rounded-lg transition"
                    >
                      Teams
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEditForm({...editForm, location: 'In Person'})}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm rounded-lg transition"
                    >
                      In Person
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Date/Time */}
            <div className="space-y-6">
              {/* Date & Time */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="text-green-400" size={20} />
                  Date & Time
                </h2>
                <div className="space-y-4">
                  {/* Today's date for min validation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Date & Time *</label>
                    <div className="relative">
                      <input 
                        type="datetime-local" 
                        value={editForm.start_at} 
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={(e) => {
                          const startDate = e.target.value;
                          // Validate: don't allow past dates
                          const selectedDate = new Date(startDate);
                          const now = new Date();
                          if (selectedDate < now) {
                            alert('Please select a future date and time');
                            return;
                          }
                          setEditForm({
                            ...editForm, 
                            start_at: startDate,
                            // Auto-set end time to 1 hour after start if not set
                            end_at: editForm.end_at || (startDate ? new Date(new Date(startDate).getTime() + 60*60*1000).toISOString().slice(0, 16) : '')
                          });
                        }} 
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition [color-scheme:dark]"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Calendar size={18} className="text-gray-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Select a date in the future</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">End Date & Time *</label>
                    <div className="relative">
                      <input 
                        type="datetime-local" 
                        value={editForm.end_at}
                        min={editForm.start_at || new Date().toISOString().slice(0, 16)}
                        onChange={(e) => {
                          const endDate = e.target.value;
                          // Validate: end must be after start
                          if (editForm.start_at && new Date(endDate) <= new Date(editForm.start_at)) {
                            alert('End time must be after start time');
                            return;
                          }
                          setEditForm({...editForm, end_at: endDate});
                        }} 
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition [color-scheme:dark]"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Calendar size={18} className="text-gray-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Must be after start time</p>
                  </div>

                  {/* Duration indicator */}
                  {editForm.start_at && editForm.end_at && (
                    <div className="bg-slate-700/30 rounded-lg p-3 flex items-center gap-2">
                      <Clock size={16} className="text-blue-400" />
                      <span className="text-gray-300 text-sm">
                        Duration: <span className="text-white font-medium">
                          {Math.round((new Date(editForm.end_at).getTime() - new Date(editForm.start_at).getTime()) / (1000 * 60))} minutes
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Quick duration buttons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Quick Duration</label>
                    <div className="flex flex-wrap gap-2">
                      {[15, 30, 45, 60, 90].map(mins => (
                        <button 
                          key={mins}
                          type="button"
                          onClick={() => {
                            if (editForm.start_at) {
                              const endTime = new Date(new Date(editForm.start_at).getTime() + mins * 60 * 1000);
                              setEditForm({...editForm, end_at: endTime.toISOString().slice(0, 16)});
                            }
                          }}
                          disabled={!editForm.start_at}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 text-sm rounded-lg transition"
                        >
                          {mins} min
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendees Preview */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="text-orange-400" size={20} />
                  Attendees
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  You can add attendees after creating the meeting.
                </p>
                <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {currentUserEmail ? currentUserEmail[0].toUpperCase() : 'Y'}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{currentUserEmail || 'You'}</p>
                    <p className="text-gray-400 text-xs">Organizer</p>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
                <h3 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                  <FileText size={16} />
                  Pro Tips
                </h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Add a clear agenda in the description</li>
                  <li>• Keep meetings under 60 minutes when possible</li>
                  <li>• Assign roles (Facilitator, Scribe) after creation</li>
                  <li>• Log decisions and action items during the meeting</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="mt-8 flex justify-end gap-3">
            <button 
              onClick={() => navigate('/founder-os?tab=meetings')} 
              className="px-6 py-3 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={!editForm.title || !editForm.start_at}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition"
            >
              <Save size={18} /> Create Meeting
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/founder-os?tab=meetings')} className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">{meeting?.title || 'New Meeting'}</h1>
              <p className="text-xs text-gray-400">{meeting?.start_at ? new Date(meeting.start_at).toLocaleString() : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {meeting?.status && (
              <span className={`px-2 py-1 rounded text-xs font-medium ${meeting.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' : meeting.status === 'in_progress' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {meeting.status.replace('_', ' ').toUpperCase()}
              </span>
            )}
            {meeting?.status === 'scheduled' && (
              <button onClick={handleStartMeeting} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
                <Play size={14} /> Start
              </button>
            )}
            {meeting?.status === 'in_progress' && (
              <button onClick={handleEndMeeting} className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
                <Square size={14} /> End
              </button>
            )}
            {!isEditing ? (
              <>
                <button onClick={() => setIsEditing(true)} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={handleDelete} className="p-1.5 text-red-400 hover:bg-red-600 hover:text-white rounded-lg">
                  <Trash2 size={14} />
                </button>
              </>
            ) : (
              <>
                <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
                  <Save size={14} /> Save
                </button>
                <button onClick={() => setIsEditing(false)} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-sm">
                  <X size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        {meetingId && meetingId !== 'new' && (
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2">
              <CheckSquare size={18} className="text-green-400" />
              <span className="text-white font-bold">{decisions.length}</span>
              <span className="text-gray-400 text-sm">Decisions</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2">
              <ListTodo size={18} className="text-orange-400" />
              <span className="text-white font-bold">{actionItems.length}</span>
              <span className="text-gray-400 text-sm">Actions</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2">
              <Clock size={18} className="text-blue-400" />
              <span className="text-white font-bold">{calculateDuration()}m</span>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
            {/* Meeting Info */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-blue-400" /> Details
              </h2>
              {isEditing ? (
                <div className="space-y-3">
                  <input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} placeholder="Title" className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm" />
                  <input type="datetime-local" value={editForm.start_at} onChange={(e) => setEditForm({...editForm, start_at: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm" />
                  <input type="datetime-local" value={editForm.end_at} onChange={(e) => setEditForm({...editForm, end_at: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm" />
                  <input type="text" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} placeholder="Location" className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm" />
                </div>
              ) : meeting && (
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">Start: <span className="text-white">{new Date(meeting.start_at).toLocaleString()}</span></p>
                  <p className="text-gray-400">End: <span className="text-white">{new Date(meeting.end_at).toLocaleString()}</span></p>
                  {meeting.location && <p className="text-gray-400">Location: <span className="text-white">{meeting.location}</span></p>}
                  <p className="text-gray-400">Duration: <span className="text-white">{calculateDuration()} min</span></p>
                </div>
              )}
            </div>

            {/* Roles */}
            {meetingId && meetingId !== 'new' && (
              <details className="bg-slate-800 rounded-lg">
                <summary className="p-4 cursor-pointer text-white font-semibold flex items-center gap-2">
                  <Users size={16} className="text-purple-400" /> Roles
                </summary>
                <div className="px-4 pb-4">
                  <RoleAssignment meetingId={meetingId} />
                </div>
              </details>
            )}

            {/* Members - Visibility Control */}
            {meetingId && meetingId !== 'new' && (
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <UserPlus size={16} className="text-green-400" /> Members
                  </h3>
                  {canEdit() && (
                    <button 
                      onClick={() => setShowMemberForm(!showMemberForm)} 
                      className="text-green-400 hover:text-green-300 text-xs"
                    >
                      {showMemberForm ? 'Cancel' : '+ Add'}
                    </button>
                  )}
                </div>
                
                {/* Permission indicator */}
                <div className="flex items-center gap-1 mb-2 text-xs">
                  <Shield size={12} className={canEdit() ? 'text-green-400' : 'text-gray-500'} />
                  <span className={canEdit() ? 'text-green-400' : 'text-gray-500'}>
                    {canEdit() ? 'You can edit this meeting' : 'View only'}
                  </span>
                </div>
                
                {/* Creator info */}
                {meeting?.created_by && (
                  <p className="text-xs text-gray-500 mb-2">
                    Created by: {meeting.created_by}
                  </p>
                )}
                
                {showMemberForm && canEdit() && (
                  <div className="mb-3 space-y-2">
                    <select 
                      value={newMemberEmail} 
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                    >
                      <option value="">Select member...</option>
                      {teamMembers.filter(m => !members.includes(m.email)).map(m => (
                        <option key={m.id || m.email} value={m.email}>
                          {getMemberDisplayName(m)} ({m.email})
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={async () => {
                        if (newMemberEmail && !members.includes(newMemberEmail)) {
                          const newMembers = [...members, newMemberEmail];
                          setMembers(newMembers);
                          // Save to backend
                          await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ members: newMembers, user_email: currentUserEmail })
                          });
                          setNewMemberEmail('');
                          setShowMemberForm(false);
                        }
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                    >
                      Add Member
                    </button>
                  </div>
                )}
                
                {/* Members list */}
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {members.length > 0 ? members.map((email, idx) => (
                    <div key={email} className="flex justify-between items-center bg-slate-700/50 rounded px-2 py-1 group">
                      <span className="text-white text-xs truncate">
                        {idx === 0 && <span className="text-green-400 mr-1">★</span>}
                        {email}
                      </span>
                      {canEdit() && idx > 0 && (
                        <button 
                          onClick={async () => {
                            const newMembers = members.filter(m => m !== email);
                            setMembers(newMembers);
                            await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ members: newMembers, user_email: currentUserEmail })
                            });
                          }}
                          className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100"
                        >
                          <Trash size={12} />
                        </button>
                      )}
                    </div>
                  )) : (
                    <p className="text-gray-500 text-xs">No members added. Only you can see this meeting.</p>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-2">★ = Facilitator (can edit)</p>
              </div>
            )}

            {/* Notes */}
            {meetingId && meetingId !== 'new' && (
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <FileText size={16} className="text-blue-400" /> Notes
                  </h3>
                  <button onClick={() => setShowNotesForm(!showNotesForm)} className="text-blue-400 text-xs">{showNotesForm ? 'Cancel' : 'Edit'}</button>
                </div>
                {showNotesForm ? (
                  <div className="space-y-2">
                    <textarea value={editForm.notes} onChange={(e) => setEditForm({...editForm, notes: e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm h-24" placeholder="Notes..." />
                    <button onClick={handleSaveNotes} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Save</button>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">{meeting?.notes || 'No notes'}</p>
                )}
              </div>
            )}

            {/* Links */}
            {meetingId && meetingId !== 'new' && (
              <div className="bg-slate-800 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <LinkIcon size={16} className="text-purple-400" /> Links
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-400">Transcription</label>
                    <div className="flex gap-2">
                      <input type="url" value={transcriptionLink} onChange={(e) => setTranscriptionLink(e.target.value)} placeholder="https://..." className="flex-1 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm" />
                      {transcriptionLink && <a href={transcriptionLink} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Open</a>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Recording</label>
                    <div className="flex gap-2">
                      <input type="url" value={recordingLink} onChange={(e) => setRecordingLink(e.target.value)} placeholder="https://..." className="flex-1 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm" />
                      {recordingLink && <a href={recordingLink} target="_blank" rel="noopener noreferrer" className="bg-purple-600 text-white px-2 py-1 rounded text-xs">Open</a>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Main Area */}
          <div className="flex-1 space-y-4">
            {/* Agenda */}
            {meetingId && meetingId !== 'new' && (
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <ListTodo size={16} className="text-blue-400" /> Agenda
                  </h3>
                  <button 
                    onClick={() => setShowAgendaForm(!showAgendaForm)} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>

                {/* Add Agenda Form */}
                {showAgendaForm && (
                  <div className="bg-slate-700/50 rounded-lg p-4 mb-4 space-y-3">
                    <input 
                      type="text" 
                      value={newAgenda.segment} 
                      onChange={(e) => setNewAgenda({...newAgenda, segment: e.target.value})} 
                      placeholder="Agenda item (e.g., Review Q4 Goals)" 
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white text-sm"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Duration (minutes)</label>
                        <input 
                          type="number" 
                          value={newAgenda.minutes} 
                          onChange={(e) => setNewAgenda({...newAgenda, minutes: parseInt(e.target.value) || 15})} 
                          min="5" 
                          max="120"
                          className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Owner</label>
                        <select 
                          value={newAgenda.owner} 
                          onChange={(e) => setNewAgenda({...newAgenda, owner: e.target.value})} 
                          className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white text-sm"
                        >
                          <option value="">Select owner...</option>
                          {teamMembers.map(member => (
                            <option key={member.id} value={getMemberDisplayName(member)}>
                              {getMemberDisplayName(member)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleAddAgenda} 
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Add to Agenda
                      </button>
                      <button 
                        onClick={() => setShowAgendaForm(false)} 
                        className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Agenda List */}
                {agendaItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <ListTodo size={40} className="mx-auto mb-2 opacity-50" />
                    <p>No agenda items yet</p>
                    <p className="text-sm text-gray-500">Add agenda items to keep your meeting focused</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {agendaItems.map((item, index) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3 group hover:bg-slate-700 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-white font-medium">{item.segment}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock size={12} /> {item.minutes} min
                              </span>
                              {item.owner && (
                                <span className="flex items-center gap-1">
                                  <Users size={12} /> {item.owner}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteAgenda(item.id)}
                          className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition p-1"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-700 mt-3">
                      <p className="text-sm text-gray-400">
                        Total Duration: <span className="text-white font-medium">{agendaItems.reduce((sum, item) => sum + item.minutes, 0)} minutes</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Timer */}
            {meetingId && meetingId !== 'new' && (
              <div className="bg-slate-800 rounded-lg overflow-hidden">
                <MeetingTimer ref={timerRef} meetingId={meetingId} duration={calculateDuration()} />
              </div>
            )}

            {/* Decisions & Actions Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Decisions */}
              {meetingId && meetingId !== 'new' && (
                <div className="bg-slate-800 rounded-lg overflow-hidden">
                  <DecisionLogger meetingId={meetingId} decisions={decisions} onDecisionAdded={handleDecisionAdded} />
                </div>
              )}

              {/* Actions */}
              {meetingId && meetingId !== 'new' && (
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <ListTodo size={16} className="text-orange-400" /> Action Items
                    </h3>
                    <button onClick={() => setShowActionForm(!showActionForm)} className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Plus size={12} /> Add
                    </button>
                  </div>
                  
                  {showActionForm && (
                    <div className="bg-slate-700 rounded p-3 mb-3 space-y-2">
                      <input type="text" value={newAction.title} onChange={(e) => setNewAction({...newAction, title: e.target.value})} placeholder="Action title" className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm" />
                      <select value={newAction.owner_id} onChange={(e) => setNewAction({...newAction, owner_id: e.target.value})} className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm">
                        <option value="">Assign to...</option>
                        {teamMembers.map(m => <option key={m.id || m.email} value={m.id || m.email}>{getMemberDisplayName(m)}</option>)}
                      </select>
                      <input type="datetime-local" value={newAction.due_at} onChange={(e) => setNewAction({...newAction, due_at: e.target.value})} className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm" />
                      <div className="flex gap-2">
                        <button onClick={handleAddAction} className="bg-green-600 text-white px-2 py-1 rounded text-xs">Save</button>
                        <button onClick={() => setShowActionForm(false)} className="bg-slate-600 text-white px-2 py-1 rounded text-xs">Cancel</button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {actionItems.length > 0 ? actionItems.map(action => {
                      const owner = teamMembers.find(m => m.id === action.owner_id || m.email === action.owner_id);
                      const ownerName = action.owner_name || (owner ? getMemberDisplayName(owner) : action.owner_id);
                      return (
                        <div key={action.id} className="bg-slate-700 rounded p-2 flex justify-between items-start group">
                          <div>
                            <p className="text-white text-sm">{action.title}</p>
                            <p className="text-gray-400 text-xs">{ownerName} · {action.due_at ? new Date(action.due_at).toLocaleDateString() : 'No due date'}</p>
                          </div>
                          <button onClick={() => handleDeleteAction(action.id)} className="text-red-400 opacity-0 group-hover:opacity-100">
                            <Trash size={14} />
                          </button>
                        </div>
                      );
                    }) : <p className="text-gray-500 text-sm text-center py-4">No actions yet</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MeetingDetailEnhanced;
