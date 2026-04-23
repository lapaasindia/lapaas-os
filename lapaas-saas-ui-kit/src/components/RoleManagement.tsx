import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Crown, UserCheck, Eye, Plus, Edit2, Trash2,
  Check, X, Loader2, ChevronDown, ChevronRight, Save
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  level: number;
  color: string;
  is_system: number;
  permission_count: number;
  user_count: number;
  permissions?: Permission[];
}

interface Permission {
  id: string;
  name: string;
  display_name: string;
  description: string;
  feature_id: string;
  feature_name?: string;
}

interface RoleFormData {
  name: string;
  display_name: string;
  description: string;
  level: number;
  color: string;
}

interface RoleManagementProps {
  isAdmin: boolean;
}

const roleIcons: { [key: string]: React.ReactNode } = {
  owner: <Crown size={18} />,
  admin: <Shield size={18} />,
  team_leader: <UserCheck size={18} />,
  member: <Users size={18} />,
  viewer: <Eye size={18} />,
};

const colorOptions = [
  { value: '#10b981', label: 'Green' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#6b7280', label: 'Gray' },
];

const RoleManagement: React.FC<RoleManagementProps> = ({ isAdmin }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [expandedFeatures, setExpandedFeatures] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  
  // Create/Edit role states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState<RoleFormData>({
    name: '',
    display_name: '',
    description: '',
    level: 5,
    color: '#10b981'
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/feature-roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/permissions');
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const fetchRoleDetails = async (roleId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/feature-roles/${roleId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedRole(data.data);
      }
    } catch (error) {
      console.error('Error fetching role details:', error);
    }
  };

  const toggleFeatureExpand = (featureId: string) => {
    setExpandedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  // Reset form
  const resetForm = () => {
    setRoleForm({
      name: '',
      display_name: '',
      description: '',
      level: 5,
      color: '#10b981'
    });
    setSelectedPermissions([]);
    setShowCreateForm(false);
    setEditingRole(null);
  };

  // Start editing a role
  const startEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      display_name: role.display_name,
      description: role.description,
      level: role.level,
      color: role.color
    });
    setSelectedPermissions(role.permissions?.map(p => p.id) || []);
    setShowCreateForm(true);
  };

  // Create new role
  const handleCreateRole = async () => {
    if (!roleForm.name || !roleForm.display_name) return;
    
    setSaving(true);
    try {
      const response = await fetch('http://localhost:3000/api/v1/feature-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...roleForm,
          permission_ids: selectedPermissions
        })
      });
      
      if (response.ok) {
        await fetchRoles();
        resetForm();
      }
    } catch (error) {
      console.error('Error creating role:', error);
    } finally {
      setSaving(false);
    }
  };

  // Update existing role
  const handleUpdateRole = async () => {
    if (!editingRole || !roleForm.name || !roleForm.display_name) return;
    
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:3000/api/v1/feature-roles/${editingRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm)
      });
      
      if (response.ok) {
        // Update permissions if changed
        await fetch(`http://localhost:3000/api/v1/feature-roles/${editingRole.id}/permissions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permission_ids: selectedPermissions })
        });
        
        await fetchRoles();
        if (selectedRole?.id === editingRole.id) {
          fetchRoleDetails(editingRole.id);
        }
        resetForm();
      }
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setSaving(false);
    }
  };

  // Delete role
  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.is_system) {
      alert('Cannot delete system roles');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/v1/feature-roles/${roleId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchRoles();
        if (selectedRole?.id === roleId) {
          setSelectedRole(null);
        }
      }
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  // Toggle permission selection
  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(id => id !== permId)
        : [...prev, permId]
    );
  };

  // Toggle all permissions for a feature
  const toggleFeaturePermissions = (featurePerms: Permission[]) => {
    const permIds = featurePerms.map(p => p.id);
    const allSelected = permIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !permIds.includes(id)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...permIds])]);
    }
  };

  // Group permissions by feature
  const permissionsByFeature = permissions.reduce((acc, perm) => {
    const featureId = perm.feature_id;
    if (!acc[featureId]) {
      acc[featureId] = {
        feature_name: perm.feature_name || featureId,
        permissions: []
      };
    }
    acc[featureId].permissions.push(perm);
    return acc;
  }, {} as { [key: string]: { feature_name: string; permissions: Permission[] } });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm sm:text-base">Roles & Permissions</h3>
            <p className="text-gray-400 text-xs sm:text-sm">{roles.length} roles configured</p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => { resetForm(); setShowCreateForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
          >
            <Plus size={16} />
            Create Role
          </button>
        )}
      </div>

      {/* Create/Edit Role Form */}
      {showCreateForm && (
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Role Name (internal) *</label>
              <input
                type="text"
                placeholder="e.g., project_manager"
                value={roleForm.name}
                onChange={(e) => setRoleForm({...roleForm, name: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 text-sm"
                disabled={!!editingRole?.is_system}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Display Name *</label>
              <input
                type="text"
                placeholder="e.g., Project Manager"
                value={roleForm.display_name}
                onChange={(e) => setRoleForm({...roleForm, display_name: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Description</label>
              <input
                type="text"
                placeholder="Brief description of this role"
                value={roleForm.description}
                onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Level (0-50)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={roleForm.level}
                onChange={(e) => setRoleForm({...roleForm, level: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Color</label>
              <div className="flex gap-2">
                {colorOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setRoleForm({...roleForm, color: opt.value})}
                    className={`w-8 h-8 rounded-full border-2 transition ${
                      roleForm.color === opt.value ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: opt.value }}
                    title={opt.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Permissions Selection */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block">Permissions ({selectedPermissions.length} selected)</label>
            <div className="max-h-48 overflow-y-auto space-y-2 bg-slate-700/50 rounded-lg p-3">
              {Object.entries(permissionsByFeature).map(([featureId, { feature_name, permissions: featurePerms }]) => {
                const selectedCount = featurePerms.filter(p => selectedPermissions.includes(p.id)).length;
                return (
                  <div key={featureId} className="bg-slate-800 rounded p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-medium">{feature_name}</span>
                      <button
                        onClick={() => toggleFeaturePermissions(featurePerms)}
                        className={`text-xs px-2 py-0.5 rounded ${
                          selectedCount === featurePerms.length
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-600 text-gray-400'
                        }`}
                      >
                        {selectedCount}/{featurePerms.length}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {featurePerms.map(perm => (
                        <button
                          key={perm.id}
                          onClick={() => togglePermission(perm.id)}
                          className={`text-xs px-2 py-1 rounded transition ${
                            selectedPermissions.includes(perm.id)
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-slate-700 text-gray-400 border border-slate-600 hover:border-slate-500'
                          }`}
                        >
                          {perm.display_name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={editingRole ? handleUpdateRole : handleCreateRole}
              disabled={!roleForm.name || !roleForm.display_name || saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingRole ? 'Update Role' : 'Create Role'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Mobile: Stacked Layout, Desktop: Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Roles List */}
        <div className="lg:col-span-1 space-y-2">
          <h4 className="text-gray-400 text-xs uppercase tracking-wider px-1 mb-2">Available Roles</h4>
          {roles.map(role => (
            <div
              key={role.id}
              className={`p-3 rounded-lg border transition-all ${
                selectedRole?.id === role.id
                  ? 'bg-slate-700 border-green-500'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchRoleDetails(role.id)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${role.color}20`, color: role.color }}
                  >
                    {roleIcons[role.name] || <Users size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm truncate">{role.display_name}</span>
                      {role.is_system ? (
                        <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">System</span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-400 text-xs">Level {role.level}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-400 text-xs">{role.permission_count} perms</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-400 text-xs">{role.user_count} users</span>
                    </div>
                  </div>
                </button>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        fetchRoleDetails(role.id).then(() => {
                          // Wait for role details to load then start editing
                          setTimeout(() => {
                            const fullRole = roles.find(r => r.id === role.id);
                            if (fullRole) startEditRole({...fullRole, permissions: selectedRole?.permissions});
                          }, 100);
                        });
                      }}
                      className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-slate-600 rounded transition"
                      title="Edit Role"
                    >
                      <Edit2 size={14} />
                    </button>
                    {!role.is_system && (
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-slate-600 rounded transition"
                        title="Delete Role"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Role Details / Permissions */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              {/* Role Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${selectedRole.color}20`, color: selectedRole.color }}
                  >
                    {roleIcons[selectedRole.name] || <Users size={20} />}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{selectedRole.display_name}</h3>
                    <p className="text-gray-400 text-sm">{selectedRole.description}</p>
                  </div>
                </div>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${selectedRole.color}20`, color: selectedRole.color }}
                >
                  Level {selectedRole.level}
                </span>
              </div>

              {/* Permissions by Feature */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Permissions</h4>
                {Object.entries(permissionsByFeature).map(([featureId, { feature_name, permissions: featurePerms }]) => {
                  const rolePermIds = selectedRole.permissions?.map(p => p.id) || [];
                  const enabledCount = featurePerms.filter(p => rolePermIds.includes(p.id)).length;
                  const isExpanded = expandedFeatures.includes(featureId);

                  return (
                    <div key={featureId} className="bg-slate-700/50 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleFeatureExpand(featureId)}
                        className="w-full p-3 flex items-center justify-between hover:bg-slate-700/70 transition"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                          <span className="text-white text-sm font-medium">{feature_name}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          enabledCount === featurePerms.length 
                            ? 'bg-green-500/20 text-green-400' 
                            : enabledCount > 0 
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                        }`}>
                          {enabledCount}/{featurePerms.length}
                        </span>
                      </button>
                      
                      {isExpanded && (
                        <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {featurePerms.map(perm => {
                            const hasPermission = rolePermIds.includes(perm.id);
                            return (
                              <div
                                key={perm.id}
                                className={`p-2 rounded border text-xs ${
                                  hasPermission
                                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                    : 'bg-slate-800 border-slate-600 text-gray-500'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {hasPermission ? <Check size={12} /> : <X size={12} />}
                                  <span>{perm.display_name}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
              <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Select a role to view permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
