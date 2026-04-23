import React, { useState, useEffect } from 'react';
import { Plus, Save, X, CheckSquare, Calendar } from 'lucide-react';

interface Decision {
  id: string;
  title: string;
  rationale: string;
  owner_id: string;
  review_at: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

interface DecisionLoggerProps {
  meetingId: string;
  decisions: Decision[];
  onDecisionAdded: (decision: Decision) => void;
}

const DecisionLogger: React.FC<DecisionLoggerProps> = ({ meetingId, decisions, onDecisionAdded }) => {
  const [showForm, setShowForm] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    rationale: '',
    owner_id: '',
    review_at: '',
    create_task: true
  });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

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

  // Get owner name from owner_id
  const getOwnerName = (ownerId: string) => {
    const member = teamMembers.find(m => m.id === ownerId);
    if (member) return getMemberDisplayName(member);
    // Fallback: try to get current user name
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.name || user.firstName || user.email?.split('@')[0] || 'Unknown';
      }
    } catch (e) {}
    return ownerId; // Return ID if nothing found
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Saving decision:', formData);
      
      const response = await fetch(`http://localhost:3000/api/v1/meetings/${meetingId}/decisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Failed to save decision:', error);
        alert('Failed to save decision. Please try again.');
        return;
      }
      
      const data = await response.json();
      console.log('Decision saved successfully:', data);
      
      onDecisionAdded(data.data);
      setFormData({
        title: '',
        rationale: '',
        owner_id: '',
        review_at: '',
        create_task: true
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating decision:', error);
      alert('Error saving decision. Please check your connection.');
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Decisions</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded flex items-center gap-2 text-sm transition"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Add Decision'}
        </button>
      </div>

      {/* Decision Form */}
      {showForm && (
        <div className="mb-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Decision Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="What was decided?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Rationale *
              </label>
              <textarea
                value={formData.rationale}
                onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 h-20"
                placeholder="Why was this decision made?"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Owner *
                </label>
                <select
                  value={formData.owner_id}
                  onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select owner...</option>
                  {teamMembers.map((member) => (
                    <option key={member.id || member.email} value={member.id || member.email}>
                      {getMemberDisplayName(member)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Review Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.review_at}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (selectedDate < today) {
                        return;
                      }
                      setFormData({ ...formData, review_at: e.target.value });
                    }}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 pr-10 text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="create_task"
                checked={formData.create_task}
                onChange={(e) => setFormData({ ...formData, create_task: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="create_task" className="text-sm text-gray-300">
                Create task from this decision
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition font-medium"
            >
              <Save size={18} />
              Save Decision
            </button>
          </form>
        </div>
      )}

      {/* Decisions List */}
      <div className="space-y-3">
        {decisions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CheckSquare size={48} className="mx-auto mb-2 opacity-50" />
            <p>No decisions logged yet</p>
            <p className="text-sm">Add decisions as they're made during the meeting</p>
          </div>
        ) : (
          decisions.map((decision) => (
            <div key={decision.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-white">{decision.title}</h4>
                <span className="text-xs text-gray-400">
                  {new Date(decision.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-2">{decision.rationale}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                {decision.owner_id && (
                  <span>Owner: {getOwnerName(decision.owner_id)}</span>
                )}
                {decision.review_at && (
                  <span>Review: {new Date(decision.review_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DecisionLogger;
