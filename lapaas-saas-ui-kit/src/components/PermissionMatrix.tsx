import React, { useState } from 'react';
import { Check, X, Shield } from 'lucide-react';
import { Role, PERMISSIONS } from '../types/roles';

interface PermissionMatrixProps {
  role: Role;
  onPermissionsChange?: (permissions: string[]) => void;
  readOnly?: boolean;
}

const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ role, onPermissionsChange, readOnly = false }) => {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(role.permissions.map(p => p.id))
  );

  const handleTogglePermission = (permissionId: string) => {
    if (readOnly) return;

    const newPermissions = new Set(selectedPermissions);
    if (newPermissions.has(permissionId)) {
      newPermissions.delete(permissionId);
    } else {
      newPermissions.add(permissionId);
    }
    setSelectedPermissions(newPermissions);
    onPermissionsChange?.(Array.from(newPermissions));
  };

  const permissionsByCategory = Object.values(PERMISSIONS).reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof PERMISSIONS[keyof typeof PERMISSIONS][]>);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      tasks: 'bg-blue-900 border-blue-700',
      meetings: 'bg-purple-900 border-purple-700',
      requests: 'bg-orange-900 border-orange-700',
      settings: 'bg-green-900 border-green-700',
      admin: 'bg-red-900 border-red-700'
    };
    return colors[category] || 'bg-slate-700 border-slate-600';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      tasks: '✓',
      meetings: '🤝',
      requests: '🚨',
      settings: '⚙️',
      admin: '🔐'
    };
    return icons[category] || '📋';
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="text-blue-400" size={24} />
        <h2 className="text-xl font-bold text-white">Permission Matrix</h2>
        {readOnly && <span className="text-xs px-2 py-1 bg-slate-700 text-gray-300 rounded">Read-only</span>}
      </div>

      <div className="space-y-6">
        {Object.entries(permissionsByCategory).map(([category, permissions]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <span className="text-lg">{getCategoryIcon(category)}</span>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {permissions.map((permission) => {
                const isSelected = selectedPermissions.has(permission.id);
                return (
                  <button
                    key={permission.id}
                    onClick={() => handleTogglePermission(permission.id)}
                    disabled={readOnly}
                    className={`p-3 rounded-lg border-2 transition ${
                      isSelected
                        ? `${getCategoryColor(category)} border-opacity-100`
                        : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                    } ${readOnly ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${isSelected ? 'text-green-400' : 'text-gray-400'}`}>
                        {isSelected ? <Check size={18} /> : <X size={18} />}
                      </div>
                      <div className="text-left flex-1">
                        <p className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                          {permission.name}
                        </p>
                        {permission?.description && (
                          <p className="text-xs text-gray-400 mt-1">{permission.description}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-slate-700 rounded-lg">
            <p className="text-gray-400 text-sm">Total Permissions</p>
            <p className="text-2xl font-bold text-blue-400">{Object.values(PERMISSIONS).length}</p>
          </div>
          <div className="p-3 bg-slate-700 rounded-lg">
            <p className="text-gray-400 text-sm">Assigned</p>
            <p className="text-2xl font-bold text-green-400">{selectedPermissions.size}</p>
          </div>
          <div className="p-3 bg-slate-700 rounded-lg">
            <p className="text-gray-400 text-sm">Coverage</p>
            <p className="text-2xl font-bold text-purple-400">
              {Math.round((selectedPermissions.size / Object.values(PERMISSIONS).length) * 100)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionMatrix;
