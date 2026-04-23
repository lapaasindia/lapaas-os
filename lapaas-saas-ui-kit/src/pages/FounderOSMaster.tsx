import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Home, ChevronRight, LogOut, Trash2, User, Phone, Mail, Briefcase, Building2, X, Edit2, Check, Shield, Settings } from 'lucide-react';
import FounderOSMyWeek from './FounderOSMyWeek';
import FounderOSProductivity from './FounderOSProductivity';
import FounderOSMeetings from './FounderOSMeetings';
import FounderOSFirewall from './FounderOSFirewall';
import { TimerProvider } from '../contexts/TimerContext';
import { useUser } from '../contexts/UserContext';
import TeamFeatures from '../components/TeamFeatures';
import RoleManagement from '../components/RoleManagement';

// Team member form interface
interface TeamMemberForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  role: 'member' | 'team_leader';
}

const FounderOSMaster: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mainTab, setMainTab] = useState<'overview' | 'productivity' | 'meetings' | 'firewall' | 'team'>('overview');
  const [teams, setTeams] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<TeamMemberForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    role: 'member'
  });
  
  // Edit states
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamDescription, setEditTeamDescription] = useState('');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editMemberForm, setEditMemberForm] = useState<TeamMemberForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    role: 'member'
  });

  // Check if user is founder (admin)
  const isFounder = user?.role === 'admin';
  
  // Team management sub-tab
  const [teamSubTab, setTeamSubTab] = useState<'members' | 'features' | 'roles'>('members');
  
  // Available roles for assignment
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [changingRoleFor, setChangingRoleFor] = useState<string | null>(null);

  // Initialize tab from URL on mount
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as 'overview' | 'productivity' | 'meetings' | 'firewall' | 'team' | null;
    const subTabFromUrl = searchParams.get('subTab');
    
    if (tabFromUrl && ['overview', 'productivity', 'meetings', 'firewall', 'team'].includes(tabFromUrl)) {
      setMainTab(tabFromUrl);
    } else if (subTabFromUrl) {
      // If subTab is provided without tab, determine the correct main tab
      if (['calendar', 'tasks', 'commitments', 'blocks'].includes(subTabFromUrl)) {
        setMainTab('productivity');
      } else if (['queue', 'hours', 'kb', 'analytics'].includes(subTabFromUrl)) {
        setMainTab('firewall');
      } else if (['scheduled', 'decisions', 'actions'].includes(subTabFromUrl)) {
        setMainTab('meetings');
      }
    }
    fetchTeams();
    fetchRoles();
  }, [searchParams]);

  // Fetch teams from API
  const fetchTeams = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/teams', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  // Fetch available roles
  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/feature-roles');
      if (response.ok) {
        const data = await response.json();
        setAvailableRoles(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  // Assign role to team member
  const handleAssignRole = async (_memberId: string, userId: string, roleId: string) => {
    if (!selectedTeamId) return;
    try {
      // First remove existing role for this team
      const existingRolesRes = await fetch(`http://localhost:3000/api/v1/users/${userId}/roles`);
      if (existingRolesRes.ok) {
        const existingData = await existingRolesRes.json();
        const existingTeamRole = existingData.data?.find((r: any) => r.team_id === selectedTeamId);
        if (existingTeamRole) {
          await fetch(`http://localhost:3000/api/v1/users/${userId}/roles/${existingTeamRole.role_id}?team_id=${selectedTeamId}`, {
            method: 'DELETE'
          });
        }
      }
      
      // Assign new role
      const response = await fetch(`http://localhost:3000/api/v1/users/${userId}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_id: roleId,
          team_id: selectedTeamId,
          assigned_by: user?.id || 'user-001'
        })
      });
      
      if (response.ok) {
        // Refresh team members to show updated role
        fetchTeamMembers(selectedTeamId);
        setChangingRoleFor(null);
      }
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  // Fetch team members
  const fetchTeamMembers = async (teamId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/teams/${teamId}/members`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  // Add new team
  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      const response = await fetch('http://localhost:3000/api/v1/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newTeamName })
      });
      if (response.ok) {
        const data = await response.json();
        setTeams([...teams, data.data]);
        setNewTeamName('');
        setShowAddTeam(false);
      }
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  // Add team member with full details
  const handleAddMember = async () => {
    if (!memberForm.email.trim() || !selectedTeamId) return;
    try {
      // First create/update user, then add to team
      const response = await fetch(`http://localhost:3000/api/v1/teams/${selectedTeamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          email: memberForm.email,
          firstName: memberForm.firstName,
          lastName: memberForm.lastName,
          phone: memberForm.phone,
          position: memberForm.position,
          department: memberForm.department,
          role: memberForm.role
        })
      });
      if (response.ok) {
        const data = await response.json();
        setTeamMembers([...teamMembers, data.data]);
        setMemberForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          position: '',
          department: '',
          role: 'member'
        });
        setShowAddMember(false);
      }
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  // Delete team
  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/teams/${teamId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        setTeams(teams.filter(t => t.id !== teamId));
        if (selectedTeamId === teamId) {
          setSelectedTeamId(null);
          setTeamMembers([]);
        }
      }
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  // Delete team member
  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/teams/${selectedTeamId}/members/${memberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        setTeamMembers(teamMembers.filter(m => m.id !== memberId));
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  // Update team
  const handleUpdateTeam = async (teamId: string) => {
    if (!editTeamName.trim()) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: editTeamName, description: editTeamDescription })
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(teams.map(t => t.id === teamId ? data.data : t));
        setEditingTeamId(null);
        setEditTeamName('');
        setEditTeamDescription('');
      }
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  // Start editing team
  const startEditingTeam = (team: any) => {
    setEditingTeamId(team.id);
    setEditTeamName(team.name);
    setEditTeamDescription(team.description || '');
  };

  // Update team member
  const handleUpdateMember = async (memberId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/teams/${selectedTeamId}/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editMemberForm)
      });
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(teamMembers.map(m => m.id === memberId ? { ...m, ...data.data } : m));
        setEditingMemberId(null);
        setEditMemberForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          position: '',
          department: '',
          role: 'member'
        });
      }
    } catch (error) {
      console.error('Error updating member:', error);
    }
  };

  // Start editing member
  const startEditingMember = (member: any) => {
    setEditingMemberId(member.id);
    setEditMemberForm({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email || '',
      phone: member.phone || '',
      position: member.position || '',
      department: member.department || '',
      role: member.role || 'member'
    });
  };

  // Update URL when tab changes
  const handleTabChange = (tab: 'overview' | 'productivity' | 'meetings' | 'firewall' | 'team') => {
    setMainTab(tab);
    setSearchParams({ tab });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <TimerProvider>
      <div>
        {/* Top Navigation Bar */}
        <div className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-1 sm:gap-2 text-gray-400 hover:text-white transition"
                >
                  <Home size={18} className="sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Dashboard</span>
                </button>
                <ChevronRight size={14} className="text-gray-600 hidden sm:block" />
                <span className="text-xs sm:text-sm text-gray-300 font-medium">Founder OS</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                {user && (
                  <button
                    onClick={() => navigate('/profile')}
                    className="hidden md:flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
                  >
                    <User size={14} className="text-gray-400" />
                    <div className="flex flex-col text-left">
                      <span className="text-xs sm:text-sm font-medium text-white">{user.firstName} {user.lastName}</span>
                      <span className="text-xs text-gray-400 capitalize">{user.role === 'admin' ? 'Founder' : user.role.replace('_', ' ')}</span>
                    </div>
                    <Edit2 size={12} className="text-gray-500 ml-1" />
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition text-xs sm:text-sm"
                >
                  <LogOut size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Main Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-700 sticky top-12 sm:top-14 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: 'overview', label: '📊 My Week', mobileLabel: '📊 Week', icon: '📊', founderOnly: false },
              { id: 'productivity', label: '📅 Personal Productivity', mobileLabel: '📅 Tasks', icon: '📅', founderOnly: false },
              { id: 'meetings', label: '👥 Meeting OS', mobileLabel: '👥 Meetings', icon: '👥', founderOnly: false },
              { id: 'firewall', label: '🔥 Interruption Firewall', mobileLabel: '🔥 Requests', icon: '🔥', founderOnly: false },
              { id: 'team', label: '👨‍💼 Team Management', mobileLabel: '👨‍💼 Team', icon: '👨‍💼', founderOnly: true }
            ].filter(tab => !tab.founderOnly || isFounder).map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap rounded-lg flex-shrink-0 ${
                  mainTab === tab.id
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <span className="sm:hidden">{tab.mobileLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

        {/* Content */}
        {mainTab === 'overview' && <FounderOSMyWeek />}
        {mainTab === 'productivity' && <FounderOSProductivity />}
        {mainTab === 'meetings' && <FounderOSMeetings />}
        {mainTab === 'firewall' && <FounderOSFirewall />}
        {mainTab === 'team' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {/* Founder Panel */}
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-green-900/20 to-emerald-800/20 border border-green-500/30 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <Building2 size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-lg">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-sm text-green-400 font-medium">
                      Founder
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Manage your teams and members</p>
                  <p className="text-gray-500 text-xs mt-1">{teams.length} Teams • {teamMembers.length} Members in selected team</p>
                </div>
              </div>
            </div>

            {/* Sub-tabs for Team Management - Mobile Scrollable */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              <button
                onClick={() => setTeamSubTab('members')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-2 ${
                  teamSubTab === 'members'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <User size={16} />
                <span className="hidden sm:inline">Team</span> Members
              </button>
              <button
                onClick={() => setTeamSubTab('features')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-2 ${
                  teamSubTab === 'features'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Feature</span> Access
              </button>
              <button
                onClick={() => setTeamSubTab('roles')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-2 ${
                  teamSubTab === 'roles'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <Shield size={16} />
                Roles
              </button>
            </div>

            {/* Members Tab */}
            {teamSubTab === 'members' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
              {/* Teams List */}
              <div className="lg:col-span-1">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Teams</h2>
                    {user && user.role === 'admin' && (
                      <button
                        onClick={() => setShowAddTeam(!showAddTeam)}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        + Add Team
                      </button>
                    )}
                  </div>

                  {showAddTeam && (
                    <div className="mb-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-medium">Create New Team</h3>
                        <button onClick={() => setShowAddTeam(false)} className="text-gray-400 hover:text-white">
                          <X size={18} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Team Name *"
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400"
                        />
                        <textarea
                          placeholder="Team Description (optional)"
                          value={newTeamDescription}
                          onChange={(e) => setNewTeamDescription(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 resize-none"
                        />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={handleAddTeam}
                          disabled={!newTeamName.trim()}
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition"
                        >
                          Create Team
                        </button>
                        <button
                          onClick={() => { setShowAddTeam(false); setNewTeamName(''); setNewTeamDescription(''); }}
                          className="flex-1 px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {teams.map((team) => (
                      <div key={team.id}>
                        {editingTeamId === team.id ? (
                          <div className="p-3 bg-slate-700 rounded-lg border border-green-500">
                            <input
                              type="text"
                              value={editTeamName}
                              onChange={(e) => setEditTeamName(e.target.value)}
                              className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm mb-2"
                              placeholder="Team Name"
                            />
                            <textarea
                              value={editTeamDescription}
                              onChange={(e) => setEditTeamDescription(e.target.value)}
                              className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm mb-2 resize-none"
                              placeholder="Description"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateTeam(team.id)}
                                className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center justify-center gap-1"
                              >
                                <Check size={12} /> Save
                              </button>
                              <button
                                onClick={() => setEditingTeamId(null)}
                                className="flex-1 px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setSelectedTeamId(team.id);
                              fetchTeamMembers(team.id);
                            }}
                            className={`p-3 rounded-lg cursor-pointer transition ${
                              selectedTeamId === team.id
                                ? 'bg-green-600 text-white'
                                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-medium">{team.name}</span>
                                {team.description && (
                                  <p className="text-xs text-gray-400 mt-1">{team.description}</p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditingTeam(team);
                                  }}
                                  className="text-blue-400 hover:text-blue-300 p-1"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTeam(team.id);
                                  }}
                                  className="text-red-400 hover:text-red-300 p-1"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="lg:col-span-2">
                {selectedTeamId ? (
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                      <h2 className="text-lg sm:text-xl font-bold text-white">Team Members</h2>
                      {isFounder && (
                        <button
                          onClick={() => setShowAddMember(!showAddMember)}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                        >
                          + Add Member
                        </button>
                      )}
                    </div>

                    {showAddMember && (
                      <div className="mb-4 p-5 bg-slate-700 rounded-lg border border-slate-600">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-white font-medium">Add Team Member</h3>
                          <button onClick={() => setShowAddMember(false)} className="text-gray-400 hover:text-white">
                            <X size={18} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">First Name *</label>
                            <input
                              type="text"
                              placeholder="John"
                              value={memberForm.firstName}
                              onChange={(e) => setMemberForm({...memberForm, firstName: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Last Name *</label>
                            <input
                              type="text"
                              placeholder="Doe"
                              value={memberForm.lastName}
                              onChange={(e) => setMemberForm({...memberForm, lastName: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-gray-400 mb-1 block">Email Address *</label>
                            <div className="relative">
                              <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                              <input
                                type="email"
                                placeholder="john@company.com"
                                value={memberForm.email}
                                onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                                className="w-full pl-10 pr-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Phone Number</label>
                            <div className="relative">
                              <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                              <input
                                type="tel"
                                placeholder="+1 234 567 8900"
                                value={memberForm.phone}
                                onChange={(e) => setMemberForm({...memberForm, phone: e.target.value})}
                                className="w-full pl-10 pr-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Position/Title</label>
                            <div className="relative">
                              <Briefcase size={16} className="absolute left-3 top-3 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Software Engineer"
                                value={memberForm.position}
                                onChange={(e) => setMemberForm({...memberForm, position: e.target.value})}
                                className="w-full pl-10 pr-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Department</label>
                            <input
                              type="text"
                              placeholder="Engineering"
                              value={memberForm.department}
                              onChange={(e) => setMemberForm({...memberForm, department: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Role</label>
                            <select
                              value={memberForm.role}
                              onChange={(e) => setMemberForm({...memberForm, role: e.target.value as 'member' | 'team_leader'})}
                              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                            >
                              <option value="member">Team Member</option>
                              <option value="team_leader">Team Leader</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={handleAddMember}
                            disabled={!memberForm.email.trim() || !memberForm.firstName.trim()}
                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition"
                          >
                            Add Member
                          </button>
                          <button
                            onClick={() => setShowAddMember(false)}
                            className="flex-1 px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {teamMembers.length > 0 ? (
                        teamMembers.map((member) => (
                          <div key={member.id}>
                            {editingMemberId === member.id ? (
                              <div className="p-4 bg-slate-700 rounded-lg border border-green-500">
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  <input
                                    type="text"
                                    value={editMemberForm.firstName}
                                    onChange={(e) => setEditMemberForm({...editMemberForm, firstName: e.target.value})}
                                    className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                                    placeholder="First Name"
                                  />
                                  <input
                                    type="text"
                                    value={editMemberForm.lastName}
                                    onChange={(e) => setEditMemberForm({...editMemberForm, lastName: e.target.value})}
                                    className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                                    placeholder="Last Name"
                                  />
                                  <input
                                    type="email"
                                    value={editMemberForm.email}
                                    onChange={(e) => setEditMemberForm({...editMemberForm, email: e.target.value})}
                                    className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                                    placeholder="Email"
                                  />
                                  <input
                                    type="tel"
                                    value={editMemberForm.phone}
                                    onChange={(e) => setEditMemberForm({...editMemberForm, phone: e.target.value})}
                                    className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                                    placeholder="Phone"
                                  />
                                  <input
                                    type="text"
                                    value={editMemberForm.position}
                                    onChange={(e) => setEditMemberForm({...editMemberForm, position: e.target.value})}
                                    className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                                    placeholder="Position"
                                  />
                                  <input
                                    type="text"
                                    value={editMemberForm.department}
                                    onChange={(e) => setEditMemberForm({...editMemberForm, department: e.target.value})}
                                    className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                                    placeholder="Department"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateMember(member.id)}
                                    className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center justify-center gap-1"
                                  >
                                    <Check size={12} /> Save
                                  </button>
                                  <button
                                    onClick={() => setEditingMemberId(null)}
                                    className="flex-1 px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-xs"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 bg-slate-700 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="text-white font-medium">
                                      {member.firstName && member.lastName 
                                        ? `${member.firstName} ${member.lastName}`.trim()
                                        : member.firstName || member.name || member.email}
                                    </p>
                                    <p className="text-xs text-gray-400">{member.email}</p>
                                    {member.position && <p className="text-xs text-gray-500">{member.position}</p>}
                                    {member.department && <p className="text-xs text-gray-500">{member.department}</p>}
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => startEditingMember(member)}
                                      className="text-blue-400 hover:text-blue-300 p-2"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMember(member.id)}
                                      className="text-red-400 hover:text-red-300 p-2"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                                {/* Role Assignment */}
                                <div className="mt-3 pt-3 border-t border-slate-600">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Team Role:</span>
                                    {changingRoleFor === member.id ? (
                                      <div className="flex items-center gap-2">
                                        <select
                                          className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-xs"
                                          defaultValue=""
                                          onChange={(e) => {
                                            if (e.target.value) {
                                              handleAssignRole(member.id, member.userId || member.id, e.target.value);
                                            }
                                          }}
                                        >
                                          <option value="">Select role...</option>
                                          {availableRoles.map(role => (
                                            <option key={role.id} value={role.id}>
                                              {role.display_name}
                                            </option>
                                          ))}
                                        </select>
                                        <button
                                          onClick={() => setChangingRoleFor(null)}
                                          className="text-gray-400 hover:text-white"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setChangingRoleFor(member.id)}
                                        className="flex items-center gap-1 px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs text-green-400 transition"
                                      >
                                        <Shield size={12} />
                                        {member.role || 'Member'}
                                        <Edit2 size={10} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-8">No members yet</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
                    <p className="text-gray-400">Select a team to manage members</p>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Features Tab */}
            {teamSubTab === 'features' && selectedTeamId && (
              <TeamFeatures 
                teamId={selectedTeamId} 
                teamName={teams.find(t => t.id === selectedTeamId)?.name || 'Team'} 
                isAdmin={isFounder} 
              />
            )}
            {teamSubTab === 'features' && !selectedTeamId && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
                <Settings className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Select a team from the Members tab to manage features</p>
                <button
                  onClick={() => setTeamSubTab('members')}
                  className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                >
                  Go to Members
                </button>
              </div>
            )}

            {/* Roles Tab */}
            {teamSubTab === 'roles' && (
              <RoleManagement isAdmin={isFounder} />
            )}
          </div>
        )}
      </div>
    </TimerProvider>
  );
};

export default FounderOSMaster;
