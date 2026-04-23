import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LogOut, Settings, Bell, User } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export const Dashboard: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (!accessToken) {
          window.location.href = '/login';
          return;
        }

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Verify token with backend
        const response = await fetch('http://localhost:3000/api/v1/auth/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Unauthorized');
        }

        const data = await response.json();
        setUser(data.data);
      } catch (err: any) {
        setError(err.message);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        await fetch('http://localhost:3000/api/v1/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <div className="p-8 text-center">
            <p className="text-red-600 font-medium mb-4">Error: {error}</p>
            <Button variant="primary" onClick={() => (window.location.href = '/login')}>
              Back to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lapaas OS</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <section className="mb-12">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {user?.firstName || 'User'}!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Here's what's happening with your account today
              </p>
            </div>
            <Button variant="danger" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Projects', value: '0', change: '+0%' },
            { label: 'Active Users', value: '1', change: '+100%' },
            { label: 'Revenue', value: '$0', change: '+0%' },
            { label: 'Growth', value: '0%', change: '+0%' },
          ].map((stat, idx) => (
            <Card key={idx} className="p-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <span className="text-green-600 text-sm font-medium">{stat.change}</span>
              </div>
            </Card>
          ))}
        </section>

        {/* Main Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Account Created</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Welcome to Lapaas OS</p>
                </div>
                <span className="text-xs text-gray-500">Just now</span>
              </div>

              <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Email Verified</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your email address is verified</p>
                </div>
                <span className="text-xs text-gray-500">2 min ago</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">i</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Profile Setup</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Complete your profile to get started</p>
                </div>
                <span className="text-xs text-gray-500">5 min ago</span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="primary" fullWidth>
                Create Project
              </Button>
              <Button variant="secondary" fullWidth>
                View Documentation
              </Button>
              <Button variant="secondary" fullWidth>
                Contact Support
              </Button>
              <Button variant="secondary" fullWidth>
                Settings
              </Button>
            </div>
          </Card>
        </section>

        {/* User Info */}
        <section className="mt-12">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                <p className="text-gray-900 dark:text-white font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Name</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">User ID</p>
                <p className="text-gray-900 dark:text-white font-medium font-mono text-sm">{user?.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                <p className="text-green-600 dark:text-green-400 font-medium">Active</p>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
