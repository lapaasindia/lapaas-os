import React, { useState, useEffect } from 'react';
import { Users, Plus, AlertCircle, CheckCircle, Loader, UserPlus } from 'lucide-react';

export default function TeamManagement() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/teams');
      const data = await response.json();
      setTeams(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userId = 'user-123';
      const orgId = 'org-123';
      const response = await fetch('http://localhost:3000/api/v1/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeam.name,
          description: newTeam.description,
          organizationId: orgId,
          leaderId: userId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create team');

      setSuccess(true);
      setNewTeam({ name: '', description: '' });
      setShowForm(false);
      setTimeout(() => setSuccess(false), 3000);
      fetchTeams();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="md3-headline-large mb-2">Teams</h1>
            <p className="md3-body-medium text-gray-400">Manage your teams</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="md3-button md3-button-filled flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Team
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="md3-alert md3-alert-error mb-6 md3-animate-fade">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="md3-alert md3-alert-success mb-6 md3-animate-fade">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>Team created successfully!</span>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="md3-card md3-elevation-2 mb-8 md3-animate-fade">
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="md3-text-field">
                <label>Team Name</label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="Enter team name"
                  required
                />
              </div>
              <div className="md3-text-field">
                <label>Description</label>
                <input
                  type="text"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="Enter description"
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="md3-button md3-button-filled">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="md3-button md3-button-outlined"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-green-400 animate-spin" />
          </div>
        )}

        {/* Teams Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.length === 0 ? (
              <div className="md3-card md3-elevation-1 col-span-full text-center py-12">
                <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="md3-body-medium text-gray-400">No teams yet</p>
              </div>
            ) : (
              teams.map((team) => (
                <div key={team.id} className="md3-card md3-elevation-2 md3-animate-fade hover:md3-elevation-3 transition-all cursor-pointer">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="md3-title-medium">{team.name}</h3>
                      <p className="md3-body-small text-gray-400">{team.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="md3-body-small">{team.members?.length || 0} members</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="md3-body-small">Lead: {team.leaderId}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="md3-button md3-button-outlined text-sm flex-1">
                      View
                    </button>
                    <button className="md3-button md3-button-outlined text-sm flex-1 flex items-center justify-center gap-1">
                      <UserPlus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
