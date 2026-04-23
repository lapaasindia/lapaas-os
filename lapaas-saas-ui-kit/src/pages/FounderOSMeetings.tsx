import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Plus, X } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface Meeting {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  agenda_json?: Array<{ segment: string; minutes: number; owner: string }>;
  agenda?: Array<{ segment: string; minutes: number; owner: string }>;
  roles_json?: { facilitator: string; scribe: string; decision_maker: string };
  roles?: { facilitator: string; scribe: string; decision_maker: string };
  status: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  duration?: number;
}

interface Decision {
  id: string;
  title: string;
  rationale: string;
  owner_id: string;
  review_at: string;
  meeting_id?: string;
}

interface Action {
  id: string;
  meeting_id: string;
  task_id: string;
  title?: string;
  owner_id?: string;
  due_at?: string;
  status?: string;
}

const FounderOSMeetings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  // Get user-specific IDs
  const userId = user?.id || '';
  const orgId = user?.orgId || 'org-001';
  
  const [subTab, setSubTab] = useState<'scheduled' | 'completed' | 'decisions' | 'actions' | 'analytics'>('scheduled');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [teamMembers, setTeamMembers] = useState<{id: string; name?: string; firstName?: string; lastName?: string; email: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [timerRunning, setTimerRunning] = useState<string | null>(null);
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMeetingForm, setNewMeetingForm] = useState({
    title: '',
    start_at: '',
    end_at: '',
    location: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Initialize sub-tab from URL on mount
  useEffect(() => {
    const subTabFromUrl = searchParams.get('subTab') as 'scheduled' | 'decisions' | 'actions' | 'analytics' | null;
    if (subTabFromUrl && ['scheduled', 'decisions', 'actions', 'analytics'].includes(subTabFromUrl)) {
      setSubTab(subTabFromUrl);
    }
  }, []);

  // Update URL when sub-tab changes
  const handleSubTabChange = (tab: 'scheduled' | 'decisions' | 'actions' | 'analytics') => {
    setSubTab(tab);
    setSearchParams({ subTab: tab });
  };

  useEffect(() => {
    fetchMeetingData();
    fetchTeamMembers();
  }, []);

  // Get current user email for filtering
  const getCurrentUserEmail = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.email || '';
      }
    } catch (e) {
      console.error('Error getting current user:', e);
    }
    return '';
  };

  // Get current user name
  const getCurrentUserName = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.name || user.firstName || user.email?.split('@')[0] || 'You';
      }
    } catch (e) {
      console.error('Error getting current user:', e);
    }
    return 'You';
  };

  // Get member display name
  const getMemberDisplayName = (member: {name?: string; firstName?: string; lastName?: string; email: string}) => {
    if (member.name) return member.name;
    if (member.firstName && member.lastName) return `${member.firstName} ${member.lastName}`;
    if (member.firstName) return member.firstName;
    return member.email.split('@')[0];
  };

  // Get owner name from owner_id
  const getOwnerName = (ownerId: string) => {
    const member = teamMembers.find(m => m.id === ownerId);
    if (member) return getMemberDisplayName(member);
    return getCurrentUserName();
  };

  // Fetch team members
  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/team-members?org_id=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchMeetingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch meetings for user - filter by user_id if available
      const userParam = userId ? `&user_id=${userId}` : '';
      const meetingsUrl = `http://localhost:3000/api/v1/meetings?org_id=${orgId}${userParam}`;
      const meetingsRes = await fetch(meetingsUrl);
      let meetingsList: Meeting[] = [];
      
      if (meetingsRes.ok) {
        const data = await meetingsRes.json();
        meetingsList = data.data || [];
      } else {
        setMeetings([]);
        return;
      }
      
      // Fetch roles and agenda for each meeting
      const meetingsWithData: Meeting[] = [];
      for (const meeting of meetingsList) {
        let meetingData = { ...meeting };
        
        // Fetch roles
        try {
          const rolesRes = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/roles`);
          if (rolesRes.ok) {
            const rolesData = await rolesRes.json();
            meetingData.roles = rolesData.data || { facilitator: '', scribe: '', decision_maker: '' };
          }
        } catch (err) {
          console.error(`Error fetching roles for meeting ${meeting.id}:`, err);
        }
        
        // Fetch agenda items
        try {
          const agendaRes = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/agenda`);
          if (agendaRes.ok) {
            const agendaData = await agendaRes.json();
            meetingData.agenda = agendaData.data || [];
          }
        } catch (err) {
          console.error(`Error fetching agenda for meeting ${meeting.id}:`, err);
        }
        
        meetingsWithData.push(meetingData);
      }
      setMeetings(meetingsWithData);
      
      // Extract decisions from meeting objects (they're stored inside each meeting)
      const allDecisions: Decision[] = [];
      for (const meeting of meetingsWithData) {
        // Check if meeting has decisions array
        if ((meeting as any).decisions && Array.isArray((meeting as any).decisions)) {
          const meetingDecisions = (meeting as any).decisions.map((d: any) => ({
            ...d,
            meeting_id: meeting.id,
            title: d.title || d.decision, // Map 'decision' field to 'title'
            review_at: d.review_at || d.review_date
          }));
          allDecisions.push(...meetingDecisions);
        }
        // Also try fetching from the separate endpoint as fallback
        try {
          const decisionsRes = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/decisions`);
          if (decisionsRes.ok) {
            const data = await decisionsRes.json();
            if (data.data && Array.isArray(data.data)) {
              // Avoid duplicates
              data.data.forEach((d: Decision) => {
                if (!allDecisions.find(existing => existing.id === d.id)) {
                  allDecisions.push({ ...d, meeting_id: meeting.id });
                }
              });
            }
          }
        } catch (err) {
          console.error(`Error fetching decisions for meeting ${meeting.id}:`, err);
        }
      }
      setDecisions(allDecisions);
      
      // Fetch actions from ALL meetings
      const allActions: Action[] = [];
      for (const meeting of meetingsList) {
        try {
          const actionsRes = await fetch(`http://localhost:3000/api/v1/meetings/${meeting.id}/actions`);
          if (actionsRes.ok) {
            const data = await actionsRes.json();
            if (data.data && Array.isArray(data.data)) {
              allActions.push(...data.data);
            }
          }
        } catch (err) {
          console.error(`Error fetching actions for meeting ${meeting.id}:`, err);
        }
      }
      setActions(allActions);
      
    } catch (err) {
      console.error('Error fetching meeting data:', err);
      setError('Failed to load meeting data');
      setMeetings([]);
      setDecisions([]);
      setActions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingForm.title || !newMeetingForm.start_at || !newMeetingForm.end_at) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('http://localhost:3000/api/v1/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: 'org-001',
          ...newMeetingForm,
          status: 'scheduled',
          created_by: getCurrentUserEmail(),
          members: [getCurrentUserEmail()] // Creator is automatically the first member (facilitator)
        })
      });

      if (response.ok) {
        setShowNewMeetingForm(false);
        setNewMeetingForm({ title: '', start_at: '', end_at: '', location: '' });
        await fetchMeetingData();
      } else {
        alert('Failed to create meeting');
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Error creating meeting');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading Meeting OS...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="w-full">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
            <Users className="text-blue-400 w-6 h-6 sm:w-8 sm:h-8" />
            Meeting OS
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">Agenda builder, decisions, and action tracking</p>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 border-b border-slate-700 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide">
          {[
            { id: 'scheduled', label: '📅 Scheduled' },
            { id: 'completed', label: '✅ Completed' },
            { id: 'decisions', label: '✓ Decisions' },
            { id: 'actions', label: '📝 Actions' },
            { id: 'analytics', label: '📊 Analytics' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleSubTabChange(tab.id as any)}
              className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                subTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4 lg:p-6">
          {/* Scheduled Meetings Tab */}
          {subTab === 'scheduled' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">📅 Scheduled Meetings</h2>
                <button
                  onClick={() => navigate('/meeting/new')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition text-sm sm:text-base"
                >
                  <Plus size={16} className="sm:w-[18px] sm:h-[18px]" /> New Meeting
                </button>
              </div>

              {/* New Meeting Modal */}
              {showNewMeetingForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white">New Meeting</h3>
                      <button
                        onClick={() => setShowNewMeetingForm(false)}
                        className="text-gray-400 hover:text-white transition"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    
                    <form onSubmit={handleCreateMeeting} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
                        <input
                          type="text"
                          value={newMeetingForm.title}
                          onChange={(e) => setNewMeetingForm({ ...newMeetingForm, title: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                          placeholder="Weekly Team Sync"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Start Time *</label>
                        <input
                          type="datetime-local"
                          value={newMeetingForm.start_at}
                          onChange={(e) => setNewMeetingForm({ ...newMeetingForm, start_at: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">End Time *</label>
                        <input
                          type="datetime-local"
                          value={newMeetingForm.end_at}
                          onChange={(e) => setNewMeetingForm({ ...newMeetingForm, end_at: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                        <input
                          type="text"
                          value={newMeetingForm.location}
                          onChange={(e) => setNewMeetingForm({ ...newMeetingForm, location: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                          placeholder="Conference Room A"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition"
                        >
                          {submitting ? 'Creating...' : 'Create Meeting'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewMeetingForm(false)}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {meetings.filter(m => m.status !== 'completed').length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 mb-4">No meetings scheduled</p>
                    <button
                      onClick={() => setShowNewMeetingForm(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition"
                    >
                      <Plus size={18} /> Create Your First Meeting
                    </button>
                  </div>
                ) : (
                  meetings.filter(m => m.status !== 'completed').map(meeting => (
                  <div 
                    key={meeting.id} 
                    onClick={() => navigate(`/meeting/${meeting.id}`)}
                    className="p-6 bg-slate-700 rounded-lg hover:bg-slate-600 transition border border-slate-600 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{meeting.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {meeting.start_at ? new Date(meeting.start_at).toLocaleString() : 'No start time'} - {meeting.end_at ? new Date(meeting.end_at).toLocaleTimeString() : 'No end time'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        meeting.status === 'scheduled' ? 'bg-blue-900 text-blue-200' : 'bg-green-900 text-green-200'
                      }`}>
                        {meeting.status}
                      </span>
                    </div>

                    {/* Agenda */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-300 mb-2">Agenda:</p>
                      <div className="space-y-2">
                        {(meeting.agenda_json || meeting.agenda) && Array.isArray(meeting.agenda_json || meeting.agenda) ? (
                          (meeting.agenda_json || meeting.agenda || []).map((segment: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-slate-600 rounded">
                              <span className="text-sm text-white">{segment.segment}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400">{segment.minutes}m</span>
                                <span className="text-xs text-gray-500">Owner: {segment.owner}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400">No agenda items</p>
                        )}
                      </div>
                    </div>

                    {/* Roles */}
                    <div>
                      <p className="text-sm font-semibold text-gray-300 mb-2">Roles:</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-slate-600 rounded text-xs">
                          <p className="text-gray-400">Facilitator</p>
                          <p className="text-white font-medium">{(meeting.roles_json || meeting.roles)?.facilitator || getCurrentUserName()}</p>
                        </div>
                        <div className="p-2 bg-slate-600 rounded text-xs">
                          <p className="text-gray-400">Scribe</p>
                          <p className="text-white font-medium">{(meeting.roles_json || meeting.roles)?.scribe || getCurrentUserName()}</p>
                        </div>
                        <div className="p-2 bg-slate-600 rounded text-xs">
                          <p className="text-gray-400">Decision Maker</p>
                          <p className="text-white font-medium">{(meeting.roles_json || meeting.roles)?.decision_maker || getCurrentUserName()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Completed Meetings Tab */}
          {subTab === 'completed' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">✅ Completed Meetings</h2>
              <div className="space-y-4">
                {meetings.filter(m => m.status === 'completed').length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No completed meetings yet</p>
                    <p className="text-sm text-gray-500 mt-2">Completed meetings will appear here</p>
                  </div>
                ) : (
                  meetings.filter(m => m.status === 'completed').map(meeting => (
                  <div 
                    key={meeting.id} 
                    onClick={() => navigate(`/meeting/${meeting.id}`)}
                    className="p-6 bg-slate-700 rounded-lg hover:bg-slate-600 transition border border-slate-600 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{meeting.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Completed: {meeting.updated_at ? new Date(meeting.updated_at).toLocaleString() : 'Recently'}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-900 text-green-200">
                        Completed
                      </span>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-600 rounded p-3">
                        <p className="text-xs text-gray-400">Duration</p>
                        <p className="text-lg font-bold text-white">
                          {meeting.duration ? `${meeting.duration}m` : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-slate-600 rounded p-3">
                        <p className="text-xs text-gray-400">Decisions</p>
                        <p className="text-lg font-bold text-green-400">
                          {decisions.filter(d => d.meeting_id === meeting.id).length}
                        </p>
                      </div>
                      <div className="bg-slate-600 rounded p-3">
                        <p className="text-xs text-gray-400">Actions</p>
                        <p className="text-lg font-bold text-orange-400">
                          {actions.filter(a => a.meeting_id === meeting.id).length}
                        </p>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Decisions Tab */}
          {subTab === 'decisions' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">✓ Decision Log</h2>
              <p className="text-gray-400 mb-4">All decisions from all meetings</p>
              <div className="space-y-4">
                {decisions.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No decisions logged yet</p>
                    <p className="text-sm text-gray-500 mt-2">Decisions will appear here when logged during meetings</p>
                  </div>
                ) : (
                  decisions.map(decision => (
                  <div key={decision.id} className="p-6 bg-slate-700 rounded-lg border border-slate-600 hover:border-slate-500 transition">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white flex-1">{decision.title}</h3>
                      <span className="text-xs px-3 py-1 rounded-full bg-green-900 text-green-200">
                        Pending Review
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Rationale:</p>
                      <p className="text-sm text-gray-300">{decision.rationale || 'No rationale provided'}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-slate-600">
                      <span>Owner: {getOwnerName(decision.owner_id)}</span>
                      <span>Review: {decision.review_at ? new Date(decision.review_at).toLocaleDateString() : 'Not set'}</span>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Actions Tab */}
          {subTab === 'actions' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">📝 Action Items</h2>
              <p className="text-gray-400 mb-4">All action items from all meetings</p>
              <div className="space-y-4">
                {actions.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No action items yet</p>
                    <p className="text-sm text-gray-500 mt-2">Action items will appear here when created during meetings</p>
                  </div>
                ) : (
                  actions.map(action => (
                    <div key={action.id} className="p-4 bg-slate-700 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-green-400" size={20} />
                        <div>
                          <p className="text-white font-medium">Action from meeting</p>
                          <p className="text-xs text-gray-400">Task ID: {action.task_id}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if (action.task_id) {
                            navigate(`/task/${action.task_id}`);
                          } else {
                            alert('No task associated with this action item');
                          }
                        }}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
                      >
                        View Task
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {subTab === 'analytics' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">📊 Meeting Analytics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Meetings</p>
                  <p className="text-3xl font-bold text-white mt-2">{meetings.length}</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Scheduled</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">{meetings.filter(m => m.status === 'scheduled').length}</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">In Progress</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-2">{meetings.filter(m => m.status === 'in_progress').length}</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{meetings.filter(m => m.status === 'completed').length}</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Decisions</p>
                  <p className="text-3xl font-bold text-purple-400 mt-2">{decisions.length}</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Actions</p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">{actions.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FounderOSMeetings;
