import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// User interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  position?: string;
  department?: string;
  avatar?: string | null;
  role: 'admin' | 'team_leader' | 'member';
  orgId?: string;
  teamId?: string;
  isActive: boolean;
}

// User context interface
interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  hasRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

// Permission definitions by role
const ROLE_PERMISSIONS = {
  admin: [
    'create_team',
    'delete_team',
    'manage_all_users',
    'assign_task_anyone',
    'view_all_tasks',
    'approve_requests',
    'view_all_meetings',
    'create_meeting',
    'manage_organization',
  ],
  team_leader: [
    'manage_team_members',
    'assign_task_team',
    'view_team_tasks',
    'raise_request',
    'view_team_meetings',
    'create_meeting',
  ],
  member: [
    'view_own_tasks',
    'complete_tasks',
    'raise_request',
    'view_own_meetings',
    'create_meeting',
  ],
};

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider props
interface UserProviderProps {
  children: ReactNode;
}

// Provider component
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();

      // Store token (both keys for compatibility with AuthContext)
      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);

      // Store user data
      const userData: User = {
        id: data.data.user.id,
        email: data.data.user.email,
        firstName: data.data.user.firstName,
        lastName: data.data.user.lastName,
        phone: data.data.user.phone || '',
        position: data.data.user.position || '',
        department: data.data.user.department || '',
        avatar: data.data.user.avatar || null,
        role: data.data.user.role || 'member',
        orgId: data.data.user.orgId,
        teamId: data.data.user.teamId,
        isActive: true,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update user function
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Check if user has specific role(s)
  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  };

  const value: UserContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    hasRole,
    hasPermission,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use user context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Export permission constants for easy access
export const PERMISSIONS = {
  CREATE_TEAM: 'create_team',
  DELETE_TEAM: 'delete_team',
  MANAGE_ALL_USERS: 'manage_all_users',
  ASSIGN_TASK_ANYONE: 'assign_task_anyone',
  VIEW_ALL_TASKS: 'view_all_tasks',
  APPROVE_REQUESTS: 'approve_requests',
  VIEW_ALL_MEETINGS: 'view_all_meetings',
  CREATE_MEETING: 'create_meeting',
  MANAGE_ORGANIZATION: 'manage_organization',
  MANAGE_TEAM_MEMBERS: 'manage_team_members',
  ASSIGN_TASK_TEAM: 'assign_task_team',
  VIEW_TEAM_TASKS: 'view_team_tasks',
  RAISE_REQUEST: 'raise_request',
  VIEW_TEAM_MEETINGS: 'view_team_meetings',
  VIEW_OWN_TASKS: 'view_own_tasks',
  COMPLETE_TASKS: 'complete_tasks',
  VIEW_OWN_MEETINGS: 'view_own_meetings',
};
