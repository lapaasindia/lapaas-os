import React, { useState, useEffect } from 'react';
import { Users, Save, ChevronDown } from 'lucide-react';

interface MeetingRoles {
  facilitator: string;
  scribe: string;
  decision_maker: string;
}

interface TeamMember {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role?: string;
}

interface RoleAssignmentProps {
  meetingId: string;
  onRolesUpdated?: (roles: MeetingRoles) => void;
}

const RoleAssignment: React.FC<RoleAssignmentProps> = ({ meetingId, onRolesUpdated }) => {
  const [roles, setRoles] = useState<MeetingRoles>({
    facilitator: '',
    scribe: '',
    decision_maker: ''
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchTeamMembers();
  }, [meetingId]);

  const fetchTeamMembers = async () => {
    try {
      const allMembers: TeamMember[] = [];
      const seenEmails = new Set<string>();
      
      // First, fetch all users from the public endpoint
      try {
        const usersResponse = await fetch('http://localhost:3000/api/v1/users/list');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const users = usersData.data || usersData || [];
          
          for (const user of users) {
            if (user.email && !seenEmails.has(user.email)) {
              seenEmails.add(user.email);
              allMembers.push(user);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
      
      // Also fetch from teams
      try {
        const teamsResponse = await fetch('http://localhost:3000/api/v1/teams');
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          const teams = teamsData.data || [];
          
          for (const team of teams) {
            try {
              const membersResponse = await fetch(`http://localhost:3000/api/v1/teams/${team.id}/members`);
              if (membersResponse.ok) {
                const membersData = await membersResponse.json();
                const members = membersData.data || [];
                
                for (const member of members) {
                  if (member.email && !seenEmails.has(member.email)) {
                    seenEmails.add(member.email);
                    allMembers.push(member);
                  }
                }
              }
            } catch (error) {
              console.error(`Error fetching members for team ${team.id}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
      
      setTeamMembers(allMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}/roles`);
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setRoles({
            facilitator: data.data.facilitator || '',
            scribe: data.data.scribe || '',
            decision_maker: data.data.decision_maker || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMemberDisplayName = (member: TeamMember): string => {
    if (member.firstName && member.lastName) {
      return `${member.firstName} ${member.lastName}`;
    }
    if (member.firstName) {
      return member.firstName;
    }
    if (member.name) {
      return member.name;
    }
    return member.email.split('@')[0];
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roles)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (onRolesUpdated) {
          onRolesUpdated(data.data);
        }
      }
    } catch (error) {
      console.error('Error saving roles:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading roles...</div>;
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="text-blue-400" size={20} />
        <h3 className="text-lg font-semibold text-white">Meeting Roles</h3>
      </div>

      <div className="space-y-4">
        {/* Facilitator */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            👤 Facilitator
          </label>
          <div className="relative">
            <select
              value={roles.facilitator}
              onChange={(e) => setRoles({ ...roles, facilitator: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="">Select facilitator...</option>
              {teamMembers.map((member) => (
                <option key={member.id || member.email} value={getMemberDisplayName(member)}>
                  {getMemberDisplayName(member)} ({member.email})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
          <p className="text-xs text-gray-400 mt-1">Keeps meeting on track and manages time</p>
        </div>

        {/* Scribe */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ✍️ Scribe
          </label>
          <div className="relative">
            <select
              value={roles.scribe}
              onChange={(e) => setRoles({ ...roles, scribe: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="">Select scribe...</option>
              {teamMembers.map((member) => (
                <option key={member.id || member.email} value={getMemberDisplayName(member)}>
                  {getMemberDisplayName(member)} ({member.email})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
          <p className="text-xs text-gray-400 mt-1">Documents decisions and action items</p>
        </div>

        {/* Decision Maker */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ⚖️ Decision Maker
          </label>
          <div className="relative">
            <select
              value={roles.decision_maker}
              onChange={(e) => setRoles({ ...roles, decision_maker: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="">Select decision maker...</option>
              {teamMembers.map((member) => (
                <option key={member.id || member.email} value={getMemberDisplayName(member)}>
                  {getMemberDisplayName(member)} ({member.email})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
          <p className="text-xs text-gray-400 mt-1">Makes final decisions when needed</p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition font-medium"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Roles'}
        </button>
      </div>

      {/* Role Summary */}
      {(roles.facilitator || roles.scribe || roles.decision_maker) && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs font-medium text-gray-400 mb-2">Assigned Roles:</p>
          <div className="space-y-1 text-sm">
            {roles.facilitator && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">👤</span>
                <span className="text-white">{roles.facilitator}</span>
              </div>
            )}
            {roles.scribe && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">✍️</span>
                <span className="text-white">{roles.scribe}</span>
              </div>
            )}
            {roles.decision_maker && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">⚖️</span>
                <span className="text-white">{roles.decision_maker}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleAssignment;
