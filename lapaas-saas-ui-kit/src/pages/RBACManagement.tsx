import { useState, useEffect } from 'react';
import { Shield, AlertCircle, Loader } from 'lucide-react';

export default function RBACManagement() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<any>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/roles');
      const data = await response.json();
      setRoles(data.data || []);
      if (data.data && data.data.length > 0) {
        setSelectedRole(data.data[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPermissionColor = (permission: string) => {
    const colors: { [key: string]: string } = {
      create: 'bg-green-900 text-green-200',
      read: 'bg-blue-900 text-blue-200',
      update: 'bg-yellow-900 text-yellow-200',
      delete: 'bg-red-900 text-red-200',
    };
    return colors[permission] || 'bg-gray-700 text-gray-200';
  };

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="md3-headline-large mb-2">Role-Based Access Control</h1>
          <p className="md3-body-medium text-gray-400 mb-8">Manage roles and permissions</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="md3-alert md3-alert-error mb-6 md3-animate-fade">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-green-400 animate-spin" />
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Roles List */}
            <div className="lg:col-span-1">
              <h2 className="md3-title-large mb-4">Roles</h2>
              <div className="space-y-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`w-full p-4 rounded-lg text-left transition-all ${
                      selectedRole?.id === role.id
                        ? 'bg-green-900 text-green-100 border border-green-600'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">{role.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Role Details */}
            <div className="lg:col-span-2">
              {selectedRole ? (
                <div className="md3-card md3-elevation-2 md3-animate-fade">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="md3-headline-small">{selectedRole.name}</h3>
                    </div>
                    <p className="md3-body-medium text-gray-400">
                      {selectedRole.name === 'Admin' && 'Full access to all resources'}
                      {selectedRole.name === 'Manager' && 'Can create, read, and update resources'}
                      {selectedRole.name === 'Member' && 'Can read and update resources'}
                      {selectedRole.name === 'Viewer' && 'Read-only access to resources'}
                    </p>
                  </div>

                  <div className="border-t border-gray-700 pt-6">
                    <h4 className="md3-title-medium mb-4">Permissions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {['create', 'read', 'update', 'delete'].map((permission) => (
                        <div
                          key={permission}
                          className={`p-3 rounded-lg text-center ${
                            selectedRole.permissions?.includes(permission)
                              ? getPermissionColor(permission)
                              : 'bg-gray-800 text-gray-500 opacity-50'
                          }`}
                        >
                          <p className="md3-body-small font-medium capitalize">{permission}</p>
                          {selectedRole.permissions?.includes(permission) && (
                            <p className="md3-body-small text-xs mt-1">✓ Allowed</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Role Stats */}
                  <div className="border-t border-gray-700 mt-6 pt-6">
                    <h4 className="md3-title-medium mb-4">Statistics</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="md3-title-large text-green-400">
                          {selectedRole.permissions?.length || 0}
                        </p>
                        <p className="md3-body-small text-gray-400">Permissions</p>
                      </div>
                      <div className="text-center">
                        <p className="md3-title-large text-green-400">
                          {Math.floor(Math.random() * 100) + 1}
                        </p>
                        <p className="md3-body-small text-gray-400">Users</p>
                      </div>
                      <div className="text-center">
                        <p className="md3-title-large text-green-400">
                          {Math.floor(Math.random() * 50) + 1}
                        </p>
                        <p className="md3-body-small text-gray-400">Resources</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="md3-card md3-elevation-1 text-center py-12">
                  <p className="md3-body-medium text-gray-400">Select a role to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
