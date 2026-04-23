import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Save, AlertCircle, CheckCircle, Briefcase, Building2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

export default function UserProfile() {
  const navigate = useNavigate();
  const { user: contextUser, updateUser } = useUser();
  const [profile, setProfile] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    role: '',
    avatar: null as string | null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [stats, setStats] = useState({ teams: 0, tasks: 0, meetings: 0 });

  // Load user profile and stats on mount
  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Fetch real stats from API
      const [teamsRes, tasksRes, meetingsRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/teams?org_id=org-001'),
        fetch('http://localhost:3000/api/v1/tasks?org_id=org-001'),
        fetch('http://localhost:3000/api/v1/meetings?org_id=org-001')
      ]);
      
      const teamsData = await teamsRes.json();
      const tasksData = await tasksRes.json();
      const meetingsData = await meetingsRes.json();
      
      setStats({
        teams: teamsData.data?.length || 0,
        tasks: tasksData.data?.length || 0,
        meetings: meetingsData.data?.length || 0
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setProfile({
          id: user.id || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          position: user.position || '',
          department: user.department || '',
          role: user.role || 'member',
          avatar: user.avatar || null,
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`http://localhost:3000/api/v1/users/profile/${profile.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          position: profile.position,
          department: profile.department,
        }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      // Update localStorage and context with new user data
      const userStr = localStorage.getItem('user');
      if (userStr && contextUser) {
        const user = JSON.parse(userStr);
        const updatedUser = { 
          ...user, 
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          position: profile.position,
          department: profile.department,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Update the context so other components reflect the change
        updateUser(updatedUser);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <h1 className="md3-headline-large mb-2">User Profile</h1>
          <p className="md3-body-medium text-gray-400">Manage your account information</p>
          {profile.role && (
            <span className="inline-block mt-2 px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm capitalize">
              {profile.role === 'admin' ? 'Founder' : profile.role.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="md3-alert md3-alert-error mb-6 md3-animate-fade">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="md3-alert md3-alert-success mb-6 md3-animate-fade">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="md3-card md3-elevation-2 md3-animate-fade">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-700">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="md3-title-medium">{profile.firstName} {profile.lastName}</p>
                <p className="md3-body-small text-gray-400">{profile.email}</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="md3-text-field">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Last Name */}
              <div className="md3-text-field">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div className="md3-text-field">
                <label>Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    disabled
                    className="pl-10 bg-gray-800 cursor-not-allowed opacity-50"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="md3-text-field">
                <label>Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                    className="pl-10"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Position */}
              <div className="md3-text-field">
                <label>Position / Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="position"
                    value={profile.position}
                    onChange={handleChange}
                    placeholder="Software Engineer"
                    className="pl-10"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Department */}
              <div className="md3-text-field md:col-span-2">
                <label>Department</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="department"
                    value={profile.department}
                    onChange={handleChange}
                    placeholder="Engineering"
                    className="pl-10"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-gray-700">
              <button
                type="submit"
                disabled={loading}
                className="md3-button md3-button-filled flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="md3-button md3-button-outlined"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md3-card md3-elevation-1">
            <div className="text-center">
              <p className="md3-title-large text-green-400">{stats.teams}</p>
              <p className="md3-body-small text-gray-400">Teams</p>
            </div>
          </div>
          <div className="md3-card md3-elevation-1">
            <div className="text-center">
              <p className="md3-title-large text-blue-400">{stats.tasks}</p>
              <p className="md3-body-small text-gray-400">Tasks</p>
            </div>
          </div>
          <div className="md3-card md3-elevation-1">
            <div className="text-center">
              <p className="md3-title-large text-purple-400">{stats.meetings}</p>
              <p className="md3-body-small text-gray-400">Meetings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
