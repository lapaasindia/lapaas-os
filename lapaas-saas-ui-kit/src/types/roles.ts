// Role and Permission Types

export type UserRole = 'founder' | 'manager' | 'ic' | 'guest';

export interface Permission {
  id: string;
  name: string;
  description?: string;
  category: 'tasks' | 'meetings' | 'requests' | 'settings' | 'admin';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  orgId: string;
  assignedAt: string;
}

// Permission definitions
export const PERMISSIONS = {
  // Task permissions
  TASK_CREATE: { id: 'task:create', name: 'Create Tasks', description: 'Create new tasks', category: 'tasks' as const },
  TASK_EDIT: { id: 'task:edit', name: 'Edit Tasks', description: 'Edit existing tasks', category: 'tasks' as const },
  TASK_DELETE: { id: 'task:delete', name: 'Delete Tasks', description: 'Delete tasks', category: 'tasks' as const },
  TASK_VIEW_ALL: { id: 'task:view_all', name: 'View All Tasks', description: 'View all tasks in organization', category: 'tasks' as const },

  // Meeting permissions
  MEETING_CREATE: { id: 'meeting:create', name: 'Create Meetings', description: 'Create new meetings', category: 'meetings' as const },
  MEETING_EDIT: { id: 'meeting:edit', name: 'Edit Meetings', description: 'Edit meeting details', category: 'meetings' as const },
  MEETING_DELETE: { id: 'meeting:delete', name: 'Delete Meetings', description: 'Delete meetings', category: 'meetings' as const },
  MEETING_RECORD: { id: 'meeting:record', name: 'Record Meetings', description: 'Record meeting audio', category: 'meetings' as const },

  // Request permissions
  REQUEST_CREATE: { id: 'request:create', name: 'Create Requests', description: 'Submit new requests', category: 'requests' as const },
  REQUEST_TRIAGE: { id: 'request:triage', name: 'Triage Requests', description: 'Triage and prioritize requests', category: 'requests' as const },
  REQUEST_ESCALATE: { id: 'request:escalate', name: 'Escalate Requests', description: 'Escalate requests to higher priority', category: 'requests' as const },

  // Settings permissions
  SETTINGS_VIEW: { id: 'settings:view', name: 'View Settings', description: 'View organization settings', category: 'settings' as const },
  SETTINGS_EDIT: { id: 'settings:edit', name: 'Edit Settings', description: 'Modify organization settings', category: 'settings' as const },

  // Admin permissions
  ADMIN_USERS: { id: 'admin:users', name: 'Manage Users', description: 'Add, edit, remove users', category: 'admin' as const },
  ADMIN_ROLES: { id: 'admin:roles', name: 'Manage Roles', description: 'Create and modify roles', category: 'admin' as const },
  ADMIN_SETTINGS: { id: 'admin:settings', name: 'Manage Organization Settings', description: 'Full admin access to settings', category: 'admin' as const },
};

// Role definitions
export const ROLE_DEFINITIONS: Record<UserRole, Role> = {
  founder: {
    id: 'role-founder',
    name: 'Founder/Owner',
    description: 'Plan & protect week, run decisions, keep interruptions batched',
    permissions: [
      PERMISSIONS.TASK_CREATE,
      PERMISSIONS.TASK_EDIT,
      PERMISSIONS.TASK_DELETE,
      PERMISSIONS.TASK_VIEW_ALL,
      PERMISSIONS.MEETING_CREATE,
      PERMISSIONS.MEETING_EDIT,
      PERMISSIONS.MEETING_DELETE,
      PERMISSIONS.MEETING_RECORD,
      PERMISSIONS.REQUEST_CREATE,
      PERMISSIONS.REQUEST_TRIAGE,
      PERMISSIONS.REQUEST_ESCALATE,
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_EDIT,
      PERMISSIONS.ADMIN_USERS,
      PERMISSIONS.ADMIN_ROLES,
      PERMISSIONS.ADMIN_SETTINGS,
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  manager: {
    id: 'role-manager',
    name: 'Manager/Lead',
    description: 'Run meetings, triage requests, own actions',
    permissions: [
      PERMISSIONS.TASK_CREATE,
      PERMISSIONS.TASK_EDIT,
      PERMISSIONS.TASK_VIEW_ALL,
      PERMISSIONS.MEETING_CREATE,
      PERMISSIONS.MEETING_EDIT,
      PERMISSIONS.MEETING_RECORD,
      PERMISSIONS.REQUEST_TRIAGE,
      PERMISSIONS.REQUEST_ESCALATE,
      PERMISSIONS.SETTINGS_VIEW,
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  ic: {
    id: 'role-ic',
    name: 'IC/Assistant',
    description: 'Submit requests with context, execute tasks',
    permissions: [
      PERMISSIONS.TASK_CREATE,
      PERMISSIONS.TASK_EDIT,
      PERMISSIONS.REQUEST_CREATE,
      PERMISSIONS.SETTINGS_VIEW,
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  guest: {
    id: 'role-guest',
    name: 'Guest',
    description: 'Join meeting link, view summary/tasks',
    permissions: [
      PERMISSIONS.TASK_VIEW_ALL,
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

// Helper functions
export const hasPermission = (role: Role, permissionId: string): boolean => {
  return role.permissions.some(p => p.id === permissionId);
};

export const hasAnyPermission = (role: Role, permissionIds: string[]): boolean => {
  return permissionIds.some(id => hasPermission(role, id));
};

export const hasAllPermissions = (role: Role, permissionIds: string[]): boolean => {
  return permissionIds.every(id => hasPermission(role, id));
};
