import React, { useState, useEffect } from 'react';
import { Building2, Users, Plus, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function OrganizationDashboard() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', description: '' });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/organizations');
      const data = await response.json();
      setOrganizations(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userId = 'user-123';
      const response = await fetch('http://localhost:3000/api/v1/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOrg.name,
          description: newOrg.description,
          ownerId: userId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create organization');

      setSuccess(true);
      setNewOrg({ name: '', description: '' });
      setShowForm(false);
      setTimeout(() => setSuccess(false), 3000);
      fetchOrganizations();
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
            <h1 className="md3-headline-large mb-2">Organizations</h1>
            <p className="md3-body-medium text-gray-400">Manage your organizations</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="md3-button md3-button-filled flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Organization
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
            <span>Organization created successfully!</span>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="md3-card md3-elevation-2 mb-8 md3-animate-fade">
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div className="md3-text-field">
                <label>Organization Name</label>
                <input
                  type="text"
                  value={newOrg.name}
                  onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                  placeholder="Enter organization name"
                  required
                />
              </div>
              <div className="md3-text-field">
                <label>Description</label>
                <input
                  type="text"
                  value={newOrg.description}
                  onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
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

        {/* Organizations Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.length === 0 ? (
              <div className="md3-card md3-elevation-1 col-span-full text-center py-12">
                <Building2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="md3-body-medium text-gray-400">No organizations yet</p>
              </div>
            ) : (
              organizations.map((org) => (
                <div key={org.id} className="md3-card md3-elevation-2 md3-animate-fade hover:md3-elevation-3 transition-all cursor-pointer">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="md3-title-medium">{org.name}</h3>
                      <p className="md3-body-small text-gray-400">{org.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400 mb-4">
                    <Users className="w-4 h-4" />
                    <span className="md3-body-small">{org.members?.length || 0} members</span>
                  </div>

                  <div className="flex gap-2">
                    <button className="md3-button md3-button-outlined text-sm flex-1">
                      View
                    </button>
                    <button className="md3-button md3-button-outlined text-sm flex-1">
                      Settings
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
