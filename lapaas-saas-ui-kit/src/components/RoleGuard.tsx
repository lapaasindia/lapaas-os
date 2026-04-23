import React, { ReactNode } from 'react';
import { useUser } from '../contexts/UserContext';

interface RoleGuardProps {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
  fallback?: ReactNode;
}

/**
 * RoleGuard component - Shows children only if user has required role or permission
 * 
 * Usage:
 * <RoleGuard roles={['admin', 'team_leader']}>
 *   <button>Admin Only Button</button>
 * </RoleGuard>
 * 
 * <RoleGuard permissions={['create_team']}>
 *   <button>Create Team</button>
 * </RoleGuard>
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  permissions,
  fallback = null,
}) => {
  const { user, hasRole, hasPermission } = useUser();

  if (!user) {
    return <>{fallback}</>;
  }

  // Check roles if provided
  if (roles && roles.length > 0) {
    if (!hasRole(roles)) {
      return <>{fallback}</>;
    }
  }

  // Check permissions if provided
  if (permissions && permissions.length > 0) {
    const hasAllPermissions = permissions.every(permission => hasPermission(permission));
    if (!hasAllPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

interface DisableIfNoPermissionProps {
  children: ReactNode;
  permissions: string[];
  className?: string;
}

/**
 * DisableIfNoPermission component - Disables children if user doesn't have permission
 * Useful for buttons that should be visible but disabled
 * 
 * Usage:
 * <DisableIfNoPermission permissions={['delete_team']}>
 *   <button>Delete Team</button>
 * </DisableIfNoPermission>
 */
export const DisableIfNoPermission: React.FC<DisableIfNoPermissionProps> = ({
  children,
  permissions,
  className = '',
}) => {
  const { hasPermission } = useUser();

  const hasAllPermissions = permissions.every(permission => hasPermission(permission));

  if (!hasAllPermissions) {
    return (
      <div className={`opacity-50 cursor-not-allowed ${className}`} title="You don't have permission">
        {children}
      </div>
    );
  }

  return <>{children}</>;
};
