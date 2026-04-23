import { ReactNode, useEffect } from 'react';
// Navigate is available for future use when strict auth is enabled
// import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Auto-login for development - set default user if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Set default user for development
      const defaultUser = {
        id: 'user-001',
        email: 'admin@lapaas.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      };
      localStorage.setItem('user', JSON.stringify(defaultUser));
      localStorage.setItem('accessToken', 'dev-token');
      localStorage.setItem('token', 'dev-token');
      // Reload to pick up the new auth state
      window.location.reload();
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Show loading while auto-login happens
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Setting up...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
