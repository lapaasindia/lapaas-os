// Role Management Service

import { Role, UserRole, UserRoleAssignment, ROLE_DEFINITIONS } from '../types/roles';

const API_BASE = 'http://localhost:3000/api/v1';

export const roleService = {
  // Get all roles for organization
  async getAllRoles(orgId: string): Promise<Role[]> {
    try {
      const response = await fetch(`${API_BASE}/roles?org_id=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      return Object.values(ROLE_DEFINITIONS);
    } catch (error) {
      console.error('Error fetching roles:', error);
      return Object.values(ROLE_DEFINITIONS);
    }
  },

  // Get role by ID
  async getRoleById(roleId: string): Promise<Role | null> {
    try {
      const response = await fetch(`${API_BASE}/roles/${roleId}`);
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching role:', error);
      return null;
    }
  },

  // Get user's role
  async getUserRole(userId: string, orgId: string): Promise<Role | null> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/role?org_id=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  },

  // Assign role to user
  async assignRoleToUser(userId: string, roleId: string, orgId: string): Promise<UserRoleAssignment | null> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId, orgId })
      });
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error assigning role:', error);
      return null;
    }
  },

  // Remove role from user
  async removeRoleFromUser(userId: string, roleId: string, orgId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/roles/${roleId}?org_id=${orgId}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error removing role:', error);
      return false;
    }
  },

  // Get all users with a specific role
  async getUsersByRole(roleId: string, orgId: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE}/roles/${roleId}/users?org_id=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching users by role:', error);
      return [];
    }
  },

  // Check if user has permission
  async hasPermission(userId: string, permissionId: string, orgId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/permissions/${permissionId}?org_id=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        return data.data?.hasPermission || false;
      }
      return false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  },

  // Get user's permissions
  async getUserPermissions(userId: string, orgId: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/permissions?org_id=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        return data.data?.permissions || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }
  },

  // Create custom role
  async createRole(orgId: string, role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role | null> {
    try {
      const response = await fetch(`${API_BASE}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...role, orgId })
      });
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating role:', error);
      return null;
    }
  },

  // Update role
  async updateRole(roleId: string, updates: Partial<Role>): Promise<Role | null> {
    try {
      const response = await fetch(`${API_BASE}/roles/${roleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error updating role:', error);
      return null;
    }
  },

  // Delete role
  async deleteRole(roleId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/roles/${roleId}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting role:', error);
      return false;
    }
  },

  // Get default roles
  getDefaultRoles(): Role[] {
    return Object.values(ROLE_DEFINITIONS);
  },

  // Get role by name
  getRoleByName(name: UserRole): Role {
    return ROLE_DEFINITIONS[name];
  }
};
