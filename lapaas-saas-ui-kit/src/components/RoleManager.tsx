import React, { useState, useEffect } from 'react';
import { Users, Shield, Trash2, Plus, Check, X } from 'lucide-react';
import { Role, ROLE_DEFINITIONS } from '../types/roles';
import { roleService } from '../services/roleService';

interface RoleManagerProps {
  orgId: string;
}

const RoleManager: React.FC<RoleManagerProps> = ({ orgId }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadRoles();
  }, [orgId]);

  const loadRoles = async () => {
    setLoading(true);
    const fetchedRoles = await roleService.getAllRoles(orgId);
    setRoles(fetchedRoles.length > 0 ? fetchedRoles : Object.values(ROLE_DEFINITIONS));
    setLoading(false);
  };

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setShowForm(false);
  };

  const handleCreateRole = async () => {
    if (!formData.name.trim()) return;

    const newRole = await roleService.createRole(orgId, {
      name: formData.name,
      description: formData.description,
      permissions: []
    });

    if (newRole) {
      setRoles([...roles, newRole]);
      setFormData({ name: '', description: '' });
      setShowForm(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      const success = await roleService.deleteRole(roleId);
      if (success) {
        setRoles(roles.filter(r => r.id !== roleId));
        setSelectedRole(null);
      }
    }
  };

  const getRoleIcon = (roleId: string) => {
    if (roleId.includes('founder')) return '👑';
    if (roleId.includes('manager')) return '📊';
    if (roleId.includes('ic')) return '👤';
    if (roleId.includes('guest')) return '👁️';
    return '🔐';
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading roles...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="text-blue-400" size={32} />
              <h1 className="text-4xl font-bold text-white">Role Management</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Plus size={20} /> New Role
            </button>
          </div>
          <p className="text-gray-400 mt-2">Manage user roles and permissions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Roles List */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users size={24} className="text-blue-400" />
                Roles ({roles.length})
              </h2>

              {/* Create Form */}
              {showForm && (
                <div className="mb-4 p-4 bg-slate-700 rounded-lg">
                  <input
                    type="text"
                    placeholder="Role name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-2"
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-2 text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateRole}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <Check size={16} /> Create
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Roles List */}
              <div className="space-y-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleSelectRole(role)}
                    className={`w-full p-3 rounded-lg text-left transition ${
                      selectedRole?.id === role.id
                        ? 'bg-blue-600 border border-blue-500'
                        : 'bg-slate-700 border border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getRoleIcon(role.id)}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{role.name}</p>
                        <p className="text-xs text-gray-400">{role.permissions.length} permissions</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Role Details */}
          <div className="lg:col-span-2">
            {selectedRole ? (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <span className="text-3xl">{getRoleIcon(selectedRole.id)}</span>
                      {selectedRole.name}
                    </h2>
                    <p className="text-gray-400 mt-2">{selectedRole.description}</p>
                  </div>
                  {!selectedRole.id.includes('founder') && !selectedRole.id.includes('manager') && !selectedRole.id.includes('ic') && !selectedRole.id.includes('guest') && (
                    <button
                      onClick={() => handleDeleteRole(selectedRole.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Permissions ({selectedRole.permissions.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedRole.permissions.length > 0 ? (
                      selectedRole.permissions.map((permission) => (
                        <div key={permission.id} className="p-3 bg-slate-700 rounded-lg border border-slate-600">
                          <p className="font-semibold text-white">{permission.name}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            <span className="inline-block px-2 py-1 bg-slate-600 rounded">
                              {permission.category}
                            </span>
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 col-span-2">No permissions assigned</p>
                    )}
                  </div>
                </div>

                {/* Role Stats */}
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-slate-700 rounded-lg">
                      <p className="text-gray-400 text-sm">Permissions</p>
                      <p className="text-2xl font-bold text-blue-400">{selectedRole.permissions.length}</p>
                    </div>
                    <div className="p-3 bg-slate-700 rounded-lg">
                      <p className="text-gray-400 text-sm">Created</p>
                      <p className="text-xs text-gray-300 mt-1">{new Date(selectedRole.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="p-3 bg-slate-700 rounded-lg">
                      <p className="text-gray-400 text-sm">Updated</p>
                      <p className="text-xs text-gray-300 mt-1">{new Date(selectedRole.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
                <Shield className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-400">Select a role to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManager;
