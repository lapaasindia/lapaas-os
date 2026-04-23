import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Edit2, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'team_leader' | 'member';
  orgId?: string;
  teamId?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUserManagement() {
  const navigate = useNavigate();
  const { user: currentUser, hasPermission } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState<'admin' | 'team_leader' | 'member'>('member');

  useEffect(() => {
    // Check if user has permission
    if (!hasPermission('manage_all_users')) {
      navigate('/founder-os');
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`http://localhost:3000/api/v1/users/${selectedUser.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        await fetchUsers();
        setShowRoleModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'team_leader':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'member':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/founder-os?tab=team')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition"
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="flex items-center gap-3">
                <Shield className="text-red-400" size={24} />
                <h1 className="text-2xl font-bold text-white">User Management</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg">
              <Users size={16} className="text-gray-400" />
              <span className="text-sm text-white">{users.length} Users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Joined</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        {user.id === currentUser?.id && (
                          <span className="text-xs text-gray-500">(You)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                      {user.role === 'admin' && '👑'}
                      {user.role === 'team_leader' && '⭐'}
                      {user.role === 'member' && '👤'}
                      <span className="capitalize">{user.role.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {user.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openRoleModal(user)}
                        disabled={user.id === currentUser?.id}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Change Role"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Change User Role</h3>
            <p className="text-gray-400 mb-6">
              Update role for <span className="text-white font-medium">{selectedUser.firstName} {selectedUser.lastName}</span>
            </p>

            <div className="space-y-3 mb-6">
              {(['admin', 'team_leader', 'member'] as const).map((role) => (
                <label
                  key={role}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                    newRole === role
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={newRole === role}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium capitalize">
                      {role === 'admin' && '👑 '}
                      {role === 'team_leader' && '⭐ '}
                      {role === 'member' && '👤 '}
                      {role.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {role === 'admin' && 'Full system access, manage all users and teams'}
                      {role === 'team_leader' && 'Manage team members, assign tasks, raise requests'}
                      {role === 'member' && 'View own data, complete tasks, raise requests'}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
